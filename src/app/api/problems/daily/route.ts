import { NextResponse } from "next/server";
import { getCurrentStudent } from "@/lib/auth";
import { ensureProblemSchema } from "@/lib/problem-engine";
import { recommendProblems } from "@/lib/adaptive-engine";

export async function GET() {
  const student = await getCurrentStudent();
  if (!student) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  await ensureProblemSchema();
  const recommendations = await recommendProblems(student.id, undefined, 1);
  return NextResponse.json({ challenge: recommendations[0] ?? null });
}
