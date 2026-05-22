import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const projectId = searchParams.get('projectId');
    const expenses = await prisma.expense.findMany({
      where: projectId ? { projectId } : {},
      include: {
        project: { select: { name: true } },
        vendor: { select: { name: true } },
      },
      orderBy: { date: 'desc' },
    });
    return NextResponse.json(expenses);
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch expenses' }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const expense = await prisma.expense.create({
      data: {
        projectId: body.projectId || null,
        category: body.category,
        description: body.description,
        amount: parseFloat(body.amount),
        date: new Date(body.date),
        vendorId: body.vendorId || null,
        billNumber: body.billNumber,
        paymentMode: body.paymentMode || 'CASH',
        notes: body.notes,
      },
    });
    return NextResponse.json(expense, { status: 201 });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || 'Failed to create expense' }, { status: 500 });
  }
}
