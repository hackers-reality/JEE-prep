import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { ensureDatabaseSchema } from "@/lib/database";

export const dynamic = "force-dynamic";

export async function GET() {
  await ensureDatabaseSchema();
  const student = await prisma.student.findFirst({ orderBy: { createdAt: "asc" } });
  if (!student) return NextResponse.json({ sessions: [], totalMinutes: 0, streak: 0 });

  const sessions = await prisma.studySession.findMany({
    where: { studentId: student.id },
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
  const body = await request.json().catch(() => ({}));
  const durationMinutes = Number(body.durationMinutes);
  if (!Number.isFinite(durationMinutes) || durationMinutes < 1 || durationMinutes > 240) {
    return NextResponse.json({ error: "durationMinutes must be between 1 and 240" }, { status: 400 });
  }

  const student = await prisma.student.findFirst({ orderBy: { createdAt: "asc" } });
  if (!student) return NextResponse.json({ error: "Complete onboarding first" }, { status: 400 });

  const endedAt = new Date();
  const startedAt = new Date(endedAt.getTime() - Math.round(durationMinutes) * 60_000);
  const session = await prisma.studySession.create({
    data: {
      studentId: student.id,
      startedAt,
      endedAt,
      durationMinutes: Math.round(durationMinutes),
      sessionType: typeof body.sessionType === "string" ? body.sessionType.slice(0, 30) : "FOCUS",
    },
  });

  return NextResponse.json(session, { status: 201 });
}
