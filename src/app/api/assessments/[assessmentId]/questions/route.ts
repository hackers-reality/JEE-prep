import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@libsql/client";
import { ensureAssessmentSchema, currentStudentId } from "@/lib/assessment-persistence";
import type { SaveQuestionAttempt } from "@/lib/assessment-persistence";

function db() {
  const url = process.env.TURSO_DATABASE_URL ?? process.env.DATABASE_URL ?? "file:./prisma/dev.db";
  const authToken = process.env.TURSO_AUTH_TOKEN;
  return createClient({ url, ...(authToken ? { authToken } : {}) });
}

export async function GET(_req: NextRequest, { params }: { params: Promise<{ assessmentId: string }> }) {
  await ensureAssessmentSchema();
  const studentId = await currentStudentId();
  if (!studentId) return NextResponse.json({ error: "Sign in required." }, { status: 401 });
  const { assessmentId } = await params;
  const client = db();
  try {
    const owned = await client.execute({ sql: `SELECT id,title,timeLimitSeconds,startedAt,endedAt,status FROM "AssessmentAttempt" WHERE id = ? AND studentId = ? LIMIT 1`, args: [assessmentId, studentId] });
    if (!owned.rows.length) return NextResponse.json({ error: "Assessment not found." }, { status: 404 });
    const questions = await client.execute({ sql: `SELECT id,questionId,topicId,startedAt,submittedAt,expectedSeconds,activeSeconds,answer,isCorrect,confidence,mistakeType,status FROM "AssessmentQuestionAttempt" WHERE assessmentId = ? ORDER BY createdAt ASC`, args: [assessmentId] });
    return NextResponse.json({ assessment: owned.rows[0], questions: questions.rows });
  } finally { client.close(); }
}

export async function POST(req: NextRequest, { params }: { params: Promise<{ assessmentId: string }> }) {
  await ensureAssessmentSchema();
  const studentId = await currentStudentId();
  if (!studentId) return NextResponse.json({ error: "Sign in required." }, { status: 401 });
  const { assessmentId } = await params;
  const body = await req.json().catch(() => ({})) as SaveQuestionAttempt;
  if (typeof body.questionId !== "string" || !body.questionId.trim()) return NextResponse.json({ error: "questionId is required." }, { status: 400 });
  const status = body.status === "SUBMITTED" || body.status === "ANSWERED" ? body.status : "UNATTEMPTED";
  const expectedSeconds = Number.isInteger(body.expectedSeconds) ? Math.max(1, Math.min(3600, body.expectedSeconds!)) : 120;
  const activeSeconds = Number.isInteger(body.activeSeconds) ? Math.max(0, Math.min(24 * 60 * 60, body.activeSeconds!)) : 0;
  const confidence = Number.isInteger(body.confidence) ? Math.max(1, Math.min(5, body.confidence!)) : null;
  const client = db();
  try {
    const owned = await client.execute({ sql: `SELECT id FROM "AssessmentAttempt" WHERE id = ? AND studentId = ? LIMIT 1`, args: [assessmentId, studentId] });
    if (!owned.rows.length) return NextResponse.json({ error: "Assessment not found." }, { status: 404 });
    const existing = await client.execute({ sql: `SELECT id FROM "AssessmentQuestionAttempt" WHERE assessmentId = ? AND questionId = ? LIMIT 1`, args: [assessmentId, body.questionId] });
    if (existing.rows.length) {
      await client.execute({
        sql: `UPDATE "AssessmentQuestionAttempt" SET topicId = ?,startedAt = ?,submittedAt = ?,expectedSeconds = ?,activeSeconds = ?,answer = ?,isCorrect = ?,confidence = ?,mistakeType = ?,status = ?,updatedAt = CURRENT_TIMESTAMP WHERE id = ?`,
        args: [body.topicId ?? null, body.startedAt ?? null, body.submittedAt ?? null, expectedSeconds, activeSeconds, body.answer ?? null, body.isCorrect == null ? null : body.isCorrect ? 1 : 0, confidence, body.mistakeType ?? null, status, existing.rows[0].id],
      });
      return NextResponse.json({ ok: true, updated: true });
    }
    const id = crypto.randomUUID();
    await client.execute({
      sql: `INSERT INTO "AssessmentQuestionAttempt" (id,assessmentId,questionId,topicId,startedAt,submittedAt,expectedSeconds,activeSeconds,answer,isCorrect,confidence,mistakeType,status) VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?)`,
      args: [id, assessmentId, body.questionId, body.topicId ?? null, body.startedAt ?? null, body.submittedAt ?? null, expectedSeconds, activeSeconds, body.answer ?? null, body.isCorrect == null ? null : body.isCorrect ? 1 : 0, confidence, body.mistakeType ?? null, status],
    });
    return NextResponse.json({ ok: true, id }, { status: 201 });
  } finally { client.close(); }
}
