import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@libsql/client";
import { ensureAssessmentSchema, currentStudentId, newAssessmentId } from "@/lib/assessment-persistence";

function db() {
  const url = process.env.TURSO_DATABASE_URL ?? process.env.DATABASE_URL ?? "file:./prisma/dev.db";
  const authToken = process.env.TURSO_AUTH_TOKEN;
  return createClient({ url, ...(authToken ? { authToken } : {}) });
}

export async function GET() {
  await ensureAssessmentSchema();
  const studentId = await currentStudentId();
  if (!studentId) return NextResponse.json({ error: "Sign in required." }, { status: 401 });
  const client = db();
  try {
    const result = await client.execute({
      sql: `SELECT id,title,timeLimitSeconds,startedAt,endedAt,status,createdAt,updatedAt FROM "AssessmentAttempt" WHERE studentId = ? ORDER BY startedAt DESC LIMIT 50`,
      args: [studentId],
    });
    return NextResponse.json({ assessments: result.rows });
  } finally { client.close(); }
}

export async function POST(req: NextRequest) {
  await ensureAssessmentSchema();
  const studentId = await currentStudentId();
  if (!studentId) return NextResponse.json({ error: "Sign in required." }, { status: 401 });
  const body = await req.json().catch(() => ({}));
  const title = typeof body.title === "string" ? body.title.trim().slice(0, 160) : "";
  const timeLimitSeconds = Number.isInteger(body.timeLimitSeconds) ? Math.max(60, Math.min(24 * 60 * 60, body.timeLimitSeconds)) : 60 * 60;
  if (!title) return NextResponse.json({ error: "Assessment title is required." }, { status: 400 });
  const client = db();
  try {
    const id = newAssessmentId();
    await client.execute({
      sql: `INSERT INTO "AssessmentAttempt" (id,studentId,title,timeLimitSeconds,startedAt,status) VALUES (?,?,?,?,CURRENT_TIMESTAMP,'IN_PROGRESS')`,
      args: [id, studentId, title, timeLimitSeconds],
    });
    return NextResponse.json({ assessment: { id, title, timeLimitSeconds, status: "IN_PROGRESS" } }, { status: 201 });
  } finally { client.close(); }
}
