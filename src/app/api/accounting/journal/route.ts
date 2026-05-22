import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET() {
  try {
    const entries = await prisma.journalEntry.findMany({
      include: {
        lines: {
          include: {
            debitAccount: true,
            creditAccount: true,
          },
        },
        createdBy: { select: { name: true } },
      },
      orderBy: { date: 'desc' },
    });
    return NextResponse.json(entries);
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch journal entries' }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const count = await prisma.journalEntry.count();
    const entryNumber = `JV-${String(count + 1).padStart(4, '0')}`;

    const entry = await prisma.journalEntry.create({
      data: {
        entryNumber,
        date: new Date(body.date),
        type: body.type,
        narration: body.narration,
        reference: body.reference,
        totalAmount: parseFloat(body.totalAmount),
        createdById: body.createdById,
        lines: {
          create: body.lines.map((line: any) => ({
            debitAccountId: line.debitAccountId || null,
            creditAccountId: line.creditAccountId || null,
            amount: parseFloat(line.amount),
            description: line.description,
          })),
        },
      },
      include: { lines: true },
    });
    return NextResponse.json(entry, { status: 201 });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || 'Failed to create entry' }, { status: 500 });
  }
}
