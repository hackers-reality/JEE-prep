import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { ensureDatabaseSchema } from "@/lib/database";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    await ensureDatabaseSchema();
    const [subjects, topics, students] = await Promise.all([
      prisma.subject.count(),
      prisma.topic.count(),
      prisma.student.count(),
    ]);

    return NextResponse.json({
      ok: true,
      database: process.env.TURSO_DATABASE_URL ? "turso" : "sqlite",
      subjects,
      topics,
      students,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    return NextResponse.json({
      ok: false,
      error: error instanceof Error ? error.message : "Unknown database error",
    }, { status: 500 });
  }
}
