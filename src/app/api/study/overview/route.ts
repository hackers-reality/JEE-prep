import { NextResponse } from "next/server";
import { createClient } from "@libsql/client";
import { ensureStudySchema, currentStudentId } from "@/lib/student-study";

function db() { const url = process.env.TURSO_DATABASE_URL ?? process.env.DATABASE_URL ?? "file:./prisma/dev.db"; const authToken = process.env.TURSO_AUTH_TOKEN; return createClient({ url, ...(authToken ? { authToken } : {}) }); }

export async function GET() {
  await ensureStudySchema(); const studentId = await currentStudentId(); if (!studentId) return NextResponse.json({ error: "Sign in required." }, { status: 401 });
  const client = db();
  try {
    const tasks = await client.execute({ sql: `SELECT id,title,dueAt,status,priority FROM "StudyTask" WHERE studentId = ? ORDER BY status='DONE', dueAt IS NULL, dueAt ASC, priority ASC LIMIT 12`, args: [studentId] });
    const sessions = await client.execute({ sql: `SELECT id,subjectId,topicId,startedAt,endedAt,minutes,notes FROM "StudySession" WHERE studentId = ? ORDER BY startedAt DESC LIMIT 14`, args: [studentId] });
    const totals = await client.execute({ sql: `SELECT COUNT(*) AS sessionCount, COALESCE(SUM(minutes),0) AS totalMinutes FROM "StudySession" WHERE studentId = ?`, args: [studentId] });
    return NextResponse.json({ tasks: tasks.rows, sessions: sessions.rows, totals: totals.rows[0] ?? { sessionCount: 0, totalMinutes: 0 } });
  } finally { client.close(); }
}
