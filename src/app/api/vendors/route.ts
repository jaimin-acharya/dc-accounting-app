import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET() {
  try {
    const vendors = await prisma.vendor.findMany({ orderBy: { name: 'asc' } });
    return NextResponse.json(vendors);
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch vendors' }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const vendor = await prisma.vendor.create({
      data: {
        name: body.name,
        company: body.company,
        phone: body.phone,
        email: body.email,
        address: body.address,
        city: body.city,
        gstin: body.gstin,
        pan: body.pan,
        category: body.category,
        bankAccount: body.bankAccount,
        bankIFSC: body.bankIFSC,
        notes: body.notes,
      },
    });
    return NextResponse.json(vendor, { status: 201 });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || 'Failed to create vendor' }, { status: 500 });
  }
}
