import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  try {
    const docs = await prisma.document.findMany({
      include: {
        project: {
          select: {
            name: true,
          },
        },
      },
      orderBy: {
        uploadedAt: "desc",
      },
    });
    return NextResponse.json(docs);
  } catch (error: any) {
    return NextResponse.json({ error: error.message || "Failed to fetch documents" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    if (!body.name) {
      return NextResponse.json({ error: "Document name is required" }, { status: 400 });
    }
    const doc = await prisma.document.create({
      data: {
        name: body.name,
        type: body.type || "PDF",
        filePath: body.filePath || "",
        fileSize: body.fileSize ? parseInt(body.fileSize) : null,
        mimeType: body.mimeType || "",
        projectId: body.projectId || null,
        category: body.category || "General",
        description: body.description || "",
        tags: body.tags || "",
      },
    });
    return NextResponse.json(doc);
  } catch (error: any) {
    return NextResponse.json({ error: error.message || "Failed to create document" }, { status: 500 });
  }
}
