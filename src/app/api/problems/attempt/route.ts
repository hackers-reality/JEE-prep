import { NextResponse } from "next/server";
import { randomUUID } from "node:crypto";
import { ensureProblemSchema, recordProblemAttempt } from "@/lib/problem-engine";
import { getAuthenticatedStudent } from "@/lib/auth";

export async function POST(request: Request) {
  const student = await getAuthenticatedStudent();
  if (!student) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = await request.json();
  if (!body?.problemId || typeof body?.isCorrect !== "boolean") {
    return NextResponse.json({ error: "problemId and isCorrect are required" }, { status: 400 });
  }

  await ensureProblemSchema();
  await recordProblemAttempt({
    id: randomUUID(),
    problemId: String(body.problemId),
    studentId: student.id,
    answer: body.answer == null ? null : String(body.answer),
    isCorrect: body.isCorrect,
    timeSeconds: Math.max(0, Number(body.timeSeconds ?? 0)),
    confidence: body.confidence == null ? null : Math.max(1, Math.min(5, Number(body.confidence))),
    mistakeType: body.mistakeType == null ? null : String(body.mistakeType),
  });

  return NextResponse.json({ ok: true });
}
