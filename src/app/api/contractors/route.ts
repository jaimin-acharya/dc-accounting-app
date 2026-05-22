import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET() {
  try {
    const contractors = await prisma.contractor.findMany({
      orderBy: { name: 'asc' },
    });
    return NextResponse.json(contractors);
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch contractors' }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const contractor = await prisma.contractor.create({
      data: {
        name: body.name,
        company: body.company,
        phone: body.phone,
        email: body.email,
        address: body.address,
        specialty: body.specialty,
        gstin: body.gstin,
        pan: body.pan,
        bankAccount: body.bankAccount,
        bankIFSC: body.bankIFSC,
        dailyRate: body.dailyRate ? parseFloat(body.dailyRate) : null,
        notes: body.notes,
      },
    });
    return NextResponse.json(contractor, { status: 201 });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || 'Failed to create contractor' }, { status: 500 });
  }
}
