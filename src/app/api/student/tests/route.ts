import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  const student = await prisma.student.findFirst({ orderBy: { createdAt: "asc" } });
  if (!student) return NextResponse.json([]);

  const tests = await prisma.mockTest.findMany({
    where: { studentId: student.id },
    include: { result: true },
    orderBy: { createdAt: "asc" },
  });

  return NextResponse.json(
    tests.map((t) => ({
      id: t.id,
      type: t.type,
      takenAt: t.takenAt,
      resultId: t.result?.id ?? null,
    }))
  );
}
