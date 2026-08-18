import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { ensureDatabaseSchema } from "@/lib/database";
import { getCurrentStudent } from "@/lib/auth";

export const dynamic = "force-dynamic";

export async function GET() {
  await ensureDatabaseSchema();
  const student = await getCurrentStudent();
  return NextResponse.json(student);
}

export async function POST(request: Request) {
  await ensureDatabaseSchema();
  const body = await request.json();
  const student = await getCurrentStudent();

  if (!student) {
    return NextResponse.json({ error: "Authentication required" }, { status: 401 });
  }

  const data: Record<string, unknown> = {};
  if (body.name !== undefined) data.name = String(body.name).trim() || student.name || "Student";

  if (body.onboardingComplete) {
    data.prepStage = body.prepStage;
    data.jeeTarget = body.jeeTarget;
    data.preferredDailyHours = body.preferredDailyHours ? parseInt(body.preferredDailyHours, 10) : null;
    data.onboardingComplete = true;
  }

  await prisma.student.update({ where: { id: student.id }, data });

  if (body.onboardingComplete && Array.isArray(body.selfRatings)) {
    for (const sr of body.selfRatings) {
      if (!sr.subject || !sr.level) continue;
      await prisma.selfRating.upsert({
        where: { studentId_subject: { studentId: student.id, subject: sr.subject } },
        update: { level: sr.level },
        create: { studentId: student.id, subject: sr.subject, level: sr.level },
      });
    }
  }

  const updated = await prisma.student.findUnique({ where: { id: student.id }, include: { selfRatings: true } });
  return NextResponse.json(updated);
}
