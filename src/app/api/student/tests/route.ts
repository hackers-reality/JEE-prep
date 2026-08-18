import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getCurrentStudent } from "@/lib/auth";

export async function GET() {
  const student = await getCurrentStudent();
  if (!student) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

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
