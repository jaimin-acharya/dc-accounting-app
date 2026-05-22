import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET() {
  try {
    const accounts = await prisma.ledgerAccount.findMany({
      orderBy: { code: 'asc' },
    });
    return NextResponse.json(accounts);
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch accounts' }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const account = await prisma.ledgerAccount.create({
      data: {
        code: body.code,
        name: body.name,
        type: body.type,
        subType: body.subType,
        description: body.description,
        openingBalance: parseFloat(body.openingBalance) || 0,
      },
    });
    return NextResponse.json(account, { status: 201 });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to create account' }, { status: 500 });
  }
}
