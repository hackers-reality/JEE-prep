import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@libsql/client";
import { ensureStudySchema, currentStudentId, newStudyId } from "@/lib/student-study";

function db() { const url = process.env.TURSO_DATABASE_URL ?? process.env.DATABASE_URL ?? "file:./prisma/dev.db"; const authToken = process.env.TURSO_AUTH_TOKEN; return createClient({ url, ...(authToken ? { authToken } : {}) }); }

export async function GET(req: NextRequest) {
  await ensureStudySchema(); const studentId = await currentStudentId(); if (!studentId) return NextResponse.json({ error: "Sign in required." }, { status: 401 });
  const limit = Math.min(100, Math.max(1, Number(req.nextUrl.searchParams.get("limit") ?? 30) || 30)); const client = db();
  try { const result = await client.execute({ sql: `SELECT id,studentId,startedAt,endedAt,durationMinutes,sessionType,createdAt FROM "StudySession" WHERE studentId = ? ORDER BY startedAt DESC LIMIT ${limit}`, args: [studentId] }); return NextResponse.json({ sessions: result.rows }); } finally { client.close(); }
}

export async function POST(req: NextRequest) {
  await ensureStudySchema(); const studentId = await currentStudentId(); if (!studentId) return NextResponse.json({ error: "Sign in required." }, { status: 401 });
  const body = await req.json().catch(() => ({}));
  const startedAt = typeof body.startedAt === "string" ? new Date(body.startedAt) : new Date();
  const endedAt = typeof body.endedAt === "string" ? new Date(body.endedAt) : new Date();
  if (Number.isNaN(startedAt.getTime()) || Number.isNaN(endedAt.getTime()) || endedAt < startedAt) return NextResponse.json({ error: "Invalid study-session times." }, { status: 400 });
  const derivedMinutes = Math.max(0, Math.round((endedAt.getTime() - startedAt.getTime()) / 60000));
  const durationMinutes = Number.isFinite(body.durationMinutes) ? Math.max(0, Math.round(Number(body.durationMinutes))) : derivedMinutes;
  const sessionType = typeof body.sessionType === "string" && body.sessionType.trim() ? body.sessionType.trim().slice(0, 40) : "FOCUS";
  const client = db(); try { const id = newStudyId(); await client.execute({ sql: `INSERT INTO "StudySession" (id,studentId,startedAt,endedAt,durationMinutes,sessionType) VALUES (?,?,?,?,?,?)`, args: [id,studentId,startedAt.toISOString(),endedAt.toISOString(),durationMinutes,sessionType] }); return NextResponse.json({ session: { id,startedAt:startedAt.toISOString(),endedAt:endedAt.toISOString(),durationMinutes,sessionType } }, { status: 201 }); } finally { client.close(); }
}
