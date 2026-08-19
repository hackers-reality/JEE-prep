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
    const problem = await client.execute({ sql: `SELECT id,correctAnswer FROM "Problem" WHERE id = ? LIMIT 1`, args: [problemId] });
    if (!problem.rows.length) return NextResponse.json({ error: "Problem not found." }, { status: 404 });
    const answer = typeof body.answer === "string" ? body.answer.trim() : null;
    const isCorrect = answer !== null ? answer === String(problem.rows[0].correctAnswer ?? "") : null;
    const rawTime = Number(body.timeSeconds); const timeSeconds = Number.isFinite(rawTime) ? Math.max(0, Math.round(rawTime)) : 0;
    const rawConfidence = Number(body.confidence); const confidence = Number.isFinite(rawConfidence) ? Math.min(5, Math.max(1, Math.round(rawConfidence))) : null;
    const mistakeType = typeof body.mistakeType === "string" ? body.mistakeType.trim().slice(0, 80) : null;
    const id = crypto.randomUUID();
    await client.execute({ sql: `INSERT INTO "ProblemAttempt" (id,problemId,studentId,answer,isCorrect,timeSeconds,confidence,mistakeType) VALUES (?,?,?,?,?,?,?,?)`, args: [id,problemId,student.id,answer,isCorrect,timeSeconds,confidence,mistakeType] });
    return NextResponse.json({ attempt: { id,problemId,answer,isCorrect,timeSeconds,confidence,mistakeType } }, { status: 201 });
  } finally { client.close(); }
}
