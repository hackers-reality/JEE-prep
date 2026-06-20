import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(req: NextRequest, { params }: { params: Promise<{ resultId: string }> }) {
  const id = (await params).resultId;
  const result = await prisma.mockTestResult.findUnique({
    where: { id },
    include: {
      mockTest: {
        include: {
          questions: {
            include: { topics: { include: { topic: true } } },
            orderBy: { id: "asc" },
          },
        },
      },
    },
  });
  if (!result) return NextResponse.json({ error: "Result not found" }, { status: 404 });
  return NextResponse.json(result);
}
