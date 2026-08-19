import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@libsql/client";
import { ensureStudySchema, currentStudentId, newStudyId } from "@/lib/student-study";

function db() { const url = process.env.TURSO_DATABASE_URL ?? process.env.DATABASE_URL ?? "file:./prisma/dev.db"; const authToken = process.env.TURSO_AUTH_TOKEN; return createClient({ url, ...(authToken ? { authToken } : {}) }); }

export async function POST(req: NextRequest) {
  await ensureStudySchema(); const studentId = await currentStudentId(); if (!studentId) return NextResponse.json({ error: "Sign in required." }, { status: 401 });
  const body = await req.json().catch(() => ({})); const topicId = typeof body.topicId === "string" ? body.topicId : ""; const scorePercent = Number(body.scorePercent); const thresholdPercent = Number.isFinite(Number(body.thresholdPercent)) ? Number(body.thresholdPercent) : 90; const coveredConcepts = Array.isArray(body.coveredConcepts) ? body.coveredConcepts.filter((x: unknown) => typeof x === "string").slice(0, 50) : [];
  if (!topicId || !Number.isFinite(scorePercent) || scorePercent < 0 || scorePercent > 100) return NextResponse.json({ error: "Valid topic and score are required." }, { status: 400 });
  if (thresholdPercent < 50 || thresholdPercent > 100) return NextResponse.json({ error: "Threshold must be between 50 and 100." }, { status: 400 });
  const passed = scorePercent > thresholdPercent;
  const client = db(); try {
    const topic = await client.execute({ sql: `SELECT id FROM "Topic" WHERE id = ? LIMIT 1`, args: [topicId] }); if (!topic.rows.length) return NextResponse.json({ error: "Topic not found." }, { status: 404 });
    const scheduleId = typeof body.scheduleId === "string" ? body.scheduleId : null; if (scheduleId) { const owned = await client.execute({ sql: `SELECT id FROM "StudySchedule" WHERE id = ? AND studentId = ? LIMIT 1`, args: [scheduleId, studentId] }); if (!owned.rows.length) return NextResponse.json({ error: "Schedule not found." }, { status: 404 }); }
    const id = newStudyId(); await client.execute({ sql: `INSERT INTO "ScheduleValidationAttempt" (id,studentId,topicId,scheduleId,scorePercent,thresholdPercent,passed,coveredConcepts) VALUES (?,?,?,?,?,?,?,?)`, args: [id,studentId,topicId,scheduleId,scorePercent,thresholdPercent,passed ? 1 : 0,JSON.stringify(coveredConcepts)] });
    return NextResponse.json({ validation: { id, scorePercent, thresholdPercent, passed, eligibleForRemoval: passed } }, { status: 201 });
  } finally { client.close(); }
}
