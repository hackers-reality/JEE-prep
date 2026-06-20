import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const test = await prisma.mockTest.findUnique({
    where: { id },
    include: {
      questions: {
        include: { topics: { include: { topic: true } } },
        orderBy: { id: "asc" },
      },
    },
  });
  if (!test) return NextResponse.json({ error: "Test not found" }, { status: 404 });
  return NextResponse.json(test);
}
