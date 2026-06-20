import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(request: Request) {
  const url = new URL(request.url);
  const id = url.searchParams.get("id");
  if (id) {
    const student = await prisma.student.findUnique({
      where: { id },
      include: { selfRatings: true },
    });
    return NextResponse.json(student);
  }
  // Return first student (default for offline-first, no auth)
  const student = await prisma.student.findFirst({
    include: { selfRatings: true },
  });
  return NextResponse.json(student);
}

export async function POST(request: Request) {
  const body = await request.json();

  let student = await prisma.student.findFirst();

  if (body.id) {
    student = await prisma.student.findUnique({ where: { id: body.id } });
  }

  if (!student) {
    student = await prisma.student.create({
      data: {
        name: body.name ?? "Student",
        onboardingComplete: false,
      },
    });
  }

  if (body.onboardingComplete) {
    await prisma.student.update({
      where: { id: student.id },
      data: {
        prepStage: body.prepStage,
        jeeTarget: body.jeeTarget,
        preferredDailyHours: body.preferredDailyHours ? parseInt(body.preferredDailyHours) : null,
        onboardingComplete: true,
      },
    });

    if (body.selfRatings) {
      for (const sr of body.selfRatings) {
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
