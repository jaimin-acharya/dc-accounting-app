import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET() {
  try {
    const projects = await prisma.project.findMany({
      include: { client: true },
      orderBy: { createdAt: 'desc' },
    });
    return NextResponse.json(projects);
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch projects' }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    // Auto-generate project code
    const count = await prisma.project.count();
    const projectCode = `DC-${new Date().getFullYear()}-${String(count + 1).padStart(3, '0')}`;
    const project = await prisma.project.create({
      data: {
        projectCode,
        name: body.name,
        description: body.description,
        clientId: body.clientId ? body.clientId : null,
        siteAddress: body.siteAddress,
        city: body.city,
        state: body.state,
        status: body.status || 'PLANNING',
        startDate: body.startDate ? new Date(body.startDate) : null,
        endDate: body.endDate ? new Date(body.endDate) : null,
        estimatedBudget: parseFloat(body.estimatedBudget) || 0,
        contractValue: parseFloat(body.contractValue) || 0,
        progress: parseInt(body.progress) || 0,
        notes: body.notes,
      },
      include: { client: true },
    });
    return NextResponse.json(project, { status: 201 });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || 'Failed to create project' }, { status: 500 });
  }
}
