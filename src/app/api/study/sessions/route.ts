import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@libsql/client";
import { ensureStudySchema, currentStudentId, newStudyId } from "@/lib/student-study";

function db() { const url = process.env.TURSO_DATABASE_URL ?? process.env.DATABASE_URL ?? "file:./prisma/dev.db"; const authToken = process.env.TURSO_AUTH_TOKEN; return createClient({ url, ...(authToken ? { authToken } : {}) }); }

export async function GET(req: NextRequest) {
  await ensureStudySchema(); const studentId = await currentStudentId(); if (!studentId) return NextResponse.json({ error: "Sign in required." }, { status: 401 });
  const limit = Math.min(100, Math.max(1, Number(req.nextUrl.searchParams.get("limit") ?? 30) || 30)); const client = db();
  try { const result = await client.execute({ sql: `SELECT id,subjectId,topicId,startedAt,endedAt,minutes,notes,createdAt FROM "StudySession" WHERE studentId = ? ORDER BY startedAt DESC LIMIT ${limit}`, args: [studentId] }); return NextResponse.json({ sessions: result.rows }); } finally { client.close(); }
}

export async function POST(req: NextRequest) {
  await ensureStudySchema(); const studentId = await currentStudentId(); if (!studentId) return NextResponse.json({ error: "Sign in required." }, { status: 401 });
  const body = await req.json().catch(() => ({})); const startedAt = typeof body.startedAt === "string" ? body.startedAt : new Date().toISOString(); const endedAt = typeof body.endedAt === "string" ? body.endedAt : null; const minutes = Number.isFinite(body.minutes) ? Math.max(0, Math.round(Number(body.minutes))) : endedAt ? Math.max(0, Math.round((new Date(endedAt).getTime() - new Date(startedAt).getTime()) / 60000)) : 0;
  const client = db(); try { const id = newStudyId(); await client.execute({ sql: `INSERT INTO "StudySession" (id,studentId,subjectId,topicId,startedAt,endedAt,minutes,notes) VALUES (?,?,?,?,?,?,?,?)`, args: [id,studentId,typeof body.subjectId === "string" ? body.subjectId : null,typeof body.topicId === "string" ? body.topicId : null,startedAt,endedAt,minutes,typeof body.notes === "string" ? body.notes.slice(0,2000) : null] }); return NextResponse.json({ session: { id,startedAt,endedAt,minutes } }, { status: 201 }); } finally { client.close(); }
}
