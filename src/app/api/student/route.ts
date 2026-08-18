import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { ensureDatabaseSchema } from "@/lib/database";

export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  await ensureDatabaseSchema();
  const url = new URL(request.url);
  const id = url.searchParams.get("id");
  const student = id
    ? await prisma.student.findUnique({ where: { id }, include: { selfRatings: true } })
    : await prisma.student.findFirst({ include: { selfRatings: true }, orderBy: { createdAt: "asc" } });
  return NextResponse.json(student);
}

export async function POST(request: Request) {
  await ensureDatabaseSchema();
  const body = await request.json();

  let student = await prisma.student.findFirst({ orderBy: { createdAt: "asc" } });

  if (body.id) {
    student = await prisma.student.findUnique({ where: { id: body.id } });
  }

  if (!student) {
    student = await prisma.student.create({
      data: { name: body.name ?? "Student", onboardingComplete: false },
    });
  }

  if (body.onboardingComplete) {
    await prisma.student.update({
      where: { id: student.id },
      data: {
        name: body.name ?? student.name ?? "Student",
        prepStage: body.prepStage,
        jeeTarget: body.jeeTarget,
        preferredDailyHours: body.preferredDailyHours ? parseInt(body.preferredDailyHours, 10) : null,
        onboardingComplete: true,
      },
    });

    if (Array.isArray(body.selfRatings)) {
      for (const sr of body.selfRatings) {
        if (!sr.subject || !sr.level) continue;
        await prisma.selfRating.upsert({
          where: { studentId_subject: { studentId: student.id, subject: sr.subject } },
          update: { level: sr.level },
          create: { studentId: student.id, subject: sr.subject, level: sr.level },
        });
      }
    }
  }

  const updated = await prisma.student.findUnique({
    where: { id: student.id },
    include: { selfRatings: true },
  });

  return NextResponse.json(updated);
}
