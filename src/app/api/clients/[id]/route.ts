import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    // Set projects linked to this client to null
    await prisma.project.updateMany({
      where: { clientId: id },
      data: { clientId: null },
    });

    await prisma.client.delete({
      where: { id },
    });

    return NextResponse.json({ success: true });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || 'Failed to delete client' }, { status: 500 });
  }
}

export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await req.json();
    const client = await prisma.client.update({
      where: { id },
      data: {
        name: body.name,
        company: body.company,
        email: body.email,
        phone: body.phone,
        address: body.address,
        city: body.city,
        state: body.state,
        gstin: body.gstin,
        pan: body.pan,
        notes: body.notes,
      },
    });
    return NextResponse.json(client);
  } catch (error: any) {
    return NextResponse.json({ error: error.message || 'Failed to update client' }, { status: 500 });
  }
}
