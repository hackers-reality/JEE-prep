import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@libsql/client";
import { ensureStudySchema, currentStudentId, newStudyId } from "@/lib/student-study";

function db() { const url = process.env.TURSO_DATABASE_URL ?? process.env.DATABASE_URL ?? "file:./prisma/dev.db"; const authToken = process.env.TURSO_AUTH_TOKEN; return createClient({ url, ...(authToken ? { authToken } : {}) }); }

export async function GET(req: NextRequest) {
  await ensureStudySchema(); const studentId = await currentStudentId(); if (!studentId) return NextResponse.json({ error: "Sign in required." }, { status: 401 });
  const date = new URL(req.url).searchParams.get("date") || new Date().toISOString().slice(0, 10); const client = db();
  try {
    const schedule = await client.execute({ sql: `SELECT id,scheduleDate,version,status,source,createdAt,updatedAt FROM "StudySchedule" WHERE studentId = ? AND scheduleDate = ? ORDER BY version DESC LIMIT 1`, args: [studentId, date] });
    if (!schedule.rows.length) return NextResponse.json({ schedule: null, blocks: [] });
    const blocks = await client.execute({ sql: `SELECT id,taskId,topicId,title,kind,startMinutes,endMinutes,priority,locked,status,createdAt FROM "StudyScheduleBlock" WHERE scheduleId = ? ORDER BY startMinutes ASC`, args: [schedule.rows[0].id] });
    return NextResponse.json({ schedule: schedule.rows[0], blocks: blocks.rows });
  } finally { client.close(); }
}

export async function POST(req: NextRequest) {
  await ensureStudySchema(); const studentId = await currentStudentId(); if (!studentId) return NextResponse.json({ error: "Sign in required." }, { status: 401 });
  const body = await req.json().catch(() => ({})); const scheduleDate = typeof body.scheduleDate === "string" ? body.scheduleDate : new Date().toISOString().slice(0, 10); const rawBlocks = Array.isArray(body.blocks) ? body.blocks : [];
  if (rawBlocks.length > 100) return NextResponse.json({ error: "Too many schedule blocks." }, { status: 400 });
  const client = db();
  try {
    const latest = await client.execute({ sql: `SELECT COALESCE(MAX(version),0) AS version FROM "StudySchedule" WHERE studentId = ? AND scheduleDate = ?`, args: [studentId, scheduleDate] });
    const version = Number(latest.rows[0]?.version ?? 0) + 1; const scheduleId = newStudyId(); const source = typeof body.source === "string" ? body.source.slice(0, 40) : "SYSTEM";
    await client.execute({ sql: `INSERT INTO "StudySchedule" (id,studentId,scheduleDate,version,status,source) VALUES (?,?,?,?,?,?)`, args: [scheduleId,studentId,scheduleDate,version,"DRAFT",source] });
    for (const item of rawBlocks) {
      const start = Number(item.startMinutes); const end = Number(item.endMinutes); if (!Number.isFinite(start) || !Number.isFinite(end) || start < 0 || end <= start || end > 1440) continue;
      await client.execute({ sql: `INSERT INTO "StudyScheduleBlock" (id,scheduleId,taskId,topicId,title,kind,startMinutes,endMinutes,priority,locked,status) VALUES (?,?,?,?,?,?,?,?,?,?,?)`, args: [newStudyId(),scheduleId,typeof item.taskId === "string" ? item.taskId : null,typeof item.topicId === "string" ? item.topicId : null,typeof item.title === "string" ? item.title.slice(0,160) : "Study block",typeof item.kind === "string" ? item.kind.slice(0,30) : "THEORY",Math.round(start),Math.round(end),Number.isInteger(item.priority) ? Math.min(3,Math.max(1,item.priority)) : 2,item.locked ? 1 : 0,typeof item.status === "string" ? item.status.slice(0,30) : "PLANNED"] });
    }
    return NextResponse.json({ schedule: { id: scheduleId, scheduleDate, version, status: "DRAFT", source } }, { status: 201 });
  } finally { client.close(); }
}
