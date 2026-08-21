import { NextResponse } from "next/server";
import { createClient } from "@libsql/client";
import { getCurrentStudent } from "@/lib/auth";

function db() {
  const url = process.env.TURSO_DATABASE_URL ?? process.env.DATABASE_URL ?? "file:./prisma/dev.db";
  const authToken = process.env.TURSO_AUTH_TOKEN;
  return createClient({ url, ...(authToken ? { authToken } : {}) });
}

async function ensureTable() {
  const client = db();
  try {
    await client.execute(`CREATE TABLE IF NOT EXISTS "PersonalProgress" ("studentId" TEXT NOT NULL, "date" TEXT NOT NULL, "gtWrong" INTEGER NOT NULL DEFAULT 0, "gtMainLevel" INTEGER NOT NULL DEFAULT 0, "unattempted" INTEGER NOT NULL DEFAULT 0, "doubts" INTEGER NOT NULL DEFAULT 0, "cleared" INTEGER NOT NULL DEFAULT 0, "advanced" INTEGER NOT NULL DEFAULT 0, "updatedAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP, PRIMARY KEY ("studentId", "date"))`);
  } finally {
    client.close();
  }
}

export async function GET(request: Request) {
  const student = await getCurrentStudent();
  if (!student) return NextResponse.json({ error: "Sign in required." }, { status: 401 });
  await ensureTable();
  const date = new URL(request.url).searchParams.get("date") ?? new Date().toISOString().slice(0, 10);
  const client = db();
  try {
    const result = await client.execute({ sql: `SELECT date, gtWrong, gtMainLevel, unattempted, doubts, cleared, advanced, updatedAt FROM "PersonalProgress" WHERE studentId = ? AND date = ? LIMIT 1`, args: [student.id, date] });
    return NextResponse.json({ ok: true, progress: result.rows[0] ?? null });
  } finally {
    client.close();
  }
}

export async function PUT(request: Request) {
  const student = await getCurrentStudent();
  if (!student) return NextResponse.json({ error: "Sign in required." }, { status: 401 });
  const body = (await request.json()) as { date?: string; metrics?: Record<string, unknown> };
  const date = body.date ?? new Date().toISOString().slice(0, 10);
  const metrics = body.metrics ?? {};
  const n = (key: string) => Math.max(0, Math.floor(Number(metrics[key]) || 0));
  await ensureTable();
  const client = db();
  try {
    await client.execute({ sql: `INSERT INTO "PersonalProgress" (studentId, date, gtWrong, gtMainLevel, unattempted, doubts, cleared, advanced, updatedAt) VALUES (?, ?, ?, ?, ?, ?, ?, ?, CURRENT_TIMESTAMP) ON CONFLICT(studentId, date) DO UPDATE SET gtWrong=excluded.gtWrong, gtMainLevel=excluded.gtMainLevel, unattempted=excluded.unattempted, doubts=excluded.doubts, cleared=excluded.cleared, advanced=excluded.advanced, updatedAt=CURRENT_TIMESTAMP`, args: [student.id, date, n("gtWrong"), n("gtMainLevel"), n("unattempted"), n("doubts"), n("cleared"), n("advanced")] });
    return NextResponse.json({ ok: true, date });
  } finally {
    client.close();
  }
}
