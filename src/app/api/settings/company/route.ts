import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET() {
  try {
    const company = await prisma.company.findFirst();
    return NextResponse.json(company || {});
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch company' }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const existing = await prisma.company.findFirst();

    const data = {
      name: body.name || 'Dhruvanshi Construction',
      legalName: body.legalName,
      gstin: body.gstin,
      pan: body.pan,
      address: body.address,
      city: body.city,
      state: body.state,
      pincode: body.pincode,
      phone: body.phone,
      email: body.email,
      website: body.website,
      bankName: body.bankName,
      bankAccount: body.bankAccount,
      bankIFSC: body.bankIFSC,
      financialYear: body.financialYear,
      logoPath: body.logoPath,
    };

    const company = existing
      ? await prisma.company.update({ where: { id: existing.id }, data })
      : await prisma.company.create({ data });

    return NextResponse.json(company);
  } catch (error: any) {
    return NextResponse.json({ error: error.message || 'Failed to save company' }, { status: 500 });
  }
}
