import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@libsql/client";
import { currentStudentId } from "@/lib/student-study";
import { validateScheduleProfile, type StudentScheduleProfile } from "@/lib/student-profile-contract";

function db() {
  const url = process.env.TURSO_DATABASE_URL ?? process.env.DATABASE_URL ?? "file:./prisma/dev.db";
  const authToken = process.env.TURSO_AUTH_TOKEN;
  return createClient({ url, ...(authToken ? { authToken } : {}) });
}

export async function GET() {
  const studentId = await currentStudentId();
  if (!studentId) return NextResponse.json({ error: "Sign in required." }, { status: 401 });
  const client = db();
  try {
    const result = await client.execute({ sql: `SELECT id,name,prepStage,jeeTarget,preferredDailyHours,updatedAt FROM "Student" WHERE id = ? LIMIT 1`, args: [studentId] });
    const student = result.rows[0];
    return NextResponse.json({ profile: student ?? null });
  } finally { client.close(); }
}

export async function PUT(req: NextRequest) {
  const studentId = await currentStudentId();
  if (!studentId) return NextResponse.json({ error: "Sign in required." }, { status: 401 });
  const profile = (await req.json().catch(() => ({}))) as Partial<StudentScheduleProfile>;
  if (!profile.wakeTime || !profile.sleepTime || !profile.timezone || !profile.studyPreferences || !Array.isArray(profile.fixedCommitments)) {
    return NextResponse.json({ error: "Incomplete schedule profile." }, { status: 400 });
  }
  const validation = validateScheduleProfile(profile as StudentScheduleProfile);
  if (validation.length) return NextResponse.json({ error: "Invalid schedule profile.", details: validation }, { status: 400 });
  const client = db();
  try {
    await client.execute({ sql: `UPDATE "Student" SET prepStage = COALESCE(?, prepStage), jeeTarget = COALESCE(?, jeeTarget), preferredDailyHours = ?, updatedAt = CURRENT_TIMESTAMP WHERE id = ?`, args: [profile.prepStage ?? null, profile.jeeTarget ?? null, profile.studyPreferences.preferredDailyHours, studentId] });
    return NextResponse.json({ ok: true, profile });
  } finally { client.close(); }
}
