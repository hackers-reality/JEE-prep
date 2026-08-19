import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@libsql/client";
import { getCurrentStudent } from "@/lib/auth";
import { ensureProblemSchema } from "@/lib/problem-engine";

function db() { const url = process.env.TURSO_DATABASE_URL ?? process.env.DATABASE_URL ?? "file:./prisma/dev.db"; const authToken = process.env.TURSO_AUTH_TOKEN; return createClient({ url, ...(authToken ? { authToken } : {}) }); }

export async function GET(_req: NextRequest, { params }: { params: Promise<{ problemId: string }> }) {
  const student = await getCurrentStudent(); if (!student) return NextResponse.json({ error: "Sign in required." }, { status: 401 }); await ensureProblemSchema(); const { problemId } = await params; const client = db();
  try { const result = await client.execute({ sql: `SELECT id,answer,isCorrect,timeSeconds,confidence,mistakeType,createdAt FROM "ProblemAttempt" WHERE problemId = ? AND studentId = ? ORDER BY createdAt DESC LIMIT 50`, args: [problemId, student.id] }); return NextResponse.json({ attempts: result.rows }); } finally { client.close(); }
}

export async function POST(req: NextRequest, { params }: { params: Promise<{ problemId: string }> }) {
  const student = await getCurrentStudent(); if (!student) return NextResponse.json({ error: "Sign in required." }, { status: 401 }); await ensureProblemSchema(); const { problemId } = await params; const body = await req.json().catch(() => ({})); const client = db();
  try {
    const problem = await client.execute({ sql: `SELECT id,topicId,correctAnswer FROM "Problem" WHERE id = ? LIMIT 1`, args: [problemId] });
    if (!problem.rows.length) return NextResponse.json({ error: "Problem not found." }, { status: 404 });
    const answer = typeof body.answer === "string" ? body.answer.trim() : null;
    const isCorrect = answer !== null ? answer === String(problem.rows[0].correctAnswer ?? "") : null;
    const rawTime = Number(body.timeSeconds); const timeSeconds = Number.isFinite(rawTime) ? Math.max(0, Math.round(rawTime)) : 0;
    const rawConfidence = Number(body.confidence); const confidence = Number.isFinite(rawConfidence) ? Math.min(5, Math.max(1, Math.round(rawConfidence))) : null;
    const mistakeType = typeof body.mistakeType === "string" ? body.mistakeType.trim().slice(0, 80) : null;
    const id = crypto.randomUUID();
    await client.execute({ sql: `INSERT INTO "ProblemAttempt" (id,problemId,studentId,answer,isCorrect,timeSeconds,confidence,mistakeType) VALUES (?,?,?,?,?,?,?,?)`, args: [id,problemId,student.id,answer,isCorrect,timeSeconds,confidence,mistakeType] });

    const topicId = problem.rows[0].topicId ? String(problem.rows[0].topicId) : null;
    if (topicId && isCorrect !== null) {
      const existing = await client.execute({ sql: `SELECT id,questionsSeen,questionsCorrect FROM "TopicMastery" WHERE studentId = ? AND topicId = ? LIMIT 1`, args: [student.id, topicId] });
      if (existing.rows.length) {
        const row = existing.rows[0];
        await client.execute({ sql: `UPDATE "TopicMastery" SET questionsSeen = ?, questionsCorrect = ?, lastUpdated = CURRENT_TIMESTAMP WHERE id = ?`, args: [Number(row.questionsSeen ?? 0) + 1, Number(row.questionsCorrect ?? 0) + (isCorrect ? 1 : 0), row.id] });
      } else {
        await client.execute({ sql: `INSERT INTO "TopicMastery" (id,studentId,topicId,questionsSeen,questionsCorrect,lastUpdated) VALUES (?,?,?,?,?,CURRENT_TIMESTAMP)`, args: [crypto.randomUUID(),student.id,topicId,1,isCorrect ? 1 : 0] });
      }
    }

    return NextResponse.json({ attempt: { id,problemId,answer,isCorrect,timeSeconds,confidence,mistakeType,topicId } }, { status: 201 });
  } finally { client.close(); }
}
