import { NextResponse } from "next/server";
import { getCurrentStudent } from "@/lib/auth";
import { ensureProblemSchema } from "@/lib/problem-engine";
import { recommendProblems } from "@/lib/adaptive-engine";

export async function GET(request: Request) {
  const student = await getCurrentStudent();
  if (!student) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  await ensureProblemSchema();
  const url = new URL(request.url);
  const subject = url.searchParams.get("subject")?.toUpperCase() || undefined;
  const limit = Math.min(20, Math.max(1, Number(url.searchParams.get("limit") ?? 10)));
  return NextResponse.json({ recommendations: await recommendProblems(student.id, subject, limit) });
}
