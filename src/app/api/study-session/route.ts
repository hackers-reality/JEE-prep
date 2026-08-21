import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { ensureDatabaseSchema } from "@/lib/database";
import { currentStudentId } from "@/lib/student-study";

export const dynamic = "force-dynamic";

export async function GET() {
  await ensureDatabaseSchema();
  const studentId = await currentStudentId();
  if (!studentId) return NextResponse.json({ error: "Sign in required", sessions: [], totalMinutes: 0, streak: 0 }, { status: 401 });

  const sessions = await prisma.studySession.findMany({
    where: { studentId },
    orderBy: { startedAt: "desc" },
    take: 100,
  });

  const totalMinutes = sessions.reduce((sum, session) => sum + session.durationMinutes, 0);
  const days = new Set(sessions.map((session) => session.startedAt.toISOString().slice(0, 10)));
  let streak = 0;
  const cursor = new Date();
  while (days.has(cursor.toISOString().slice(0, 10))) {
    streak += 1;
    cursor.setUTCDate(cursor.getUTCDate() - 1);
  }

  return NextResponse.json({ sessions, totalMinutes, streak });
}

export async function POST(request: Request) {
  await ensureDatabaseSchema();
  const studentId = await currentStudentId();
  if (!studentId) return NextResponse.json({ error: "Sign in required" }, { status: 401 });

  const body = await request.json().catch(() => ({}));
  const durationMinutes = Number(body.durationMinutes);
  if (!Number.isFinite(durationMinutes) || durationMinutes < 1 || durationMinutes > 240) {
    return NextResponse.json({ error: "durationMinutes must be between 1 and 240" }, { status: 400 });
  }

  const endedAt = new Date();
  const startedAt = new Date(endedAt.getTime() - Math.round(durationMinutes) * 60_000);
  const session = await prisma.studySession.create({
    data: {
      studentId,
      startedAt,
      endedAt,
      durationMinutes: Math.round(durationMinutes),
      sessionType: typeof body.sessionType === "string" ? body.sessionType.slice(0, 30) : "FOCUS",
    },
  });

  return NextResponse.json(session, { status: 201 });
}
