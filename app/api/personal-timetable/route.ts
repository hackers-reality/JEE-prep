import { NextResponse } from "next/server";
import { randomBytes } from "node:crypto";
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
    await client.execute(`CREATE TABLE IF NOT EXISTS "PersonalTimetable" ("studentId" TEXT NOT NULL PRIMARY KEY, "payload" TEXT NOT NULL, "shareToken" TEXT NOT NULL UNIQUE, "updatedAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP, CONSTRAINT "PersonalTimetable_studentId_fkey" FOREIGN KEY ("studentId") REFERENCES "Student" ("id") ON DELETE CASCADE ON UPDATE CASCADE)`);
    await client.execute(`CREATE UNIQUE INDEX IF NOT EXISTS "PersonalTimetable_shareToken_key" ON "PersonalTimetable"("shareToken")`);
  } finally {
    client.close();
  }
}

export async function GET(request: Request) {
  await ensureTable();
  const url = new URL(request.url);
  const share = url.searchParams.get("share");
  const client = db();
  try {
    if (share) {
      const result = await client.execute({ sql: `SELECT p.payload, p.updatedAt, s.name FROM "PersonalTimetable" p JOIN "Student" s ON s.id = p.studentId WHERE p.shareToken = ? LIMIT 1`, args: [share] });
      const row = result.rows[0] as { payload?: string; updatedAt?: string; name?: string } | undefined;
      if (!row?.payload) return NextResponse.json({ error: "Share link not found." }, { status: 404 });
      return NextResponse.json({ ok: true, mode: "viewer", payload: JSON.parse(row.payload), updatedAt: row.updatedAt, studentName: row.name ?? "JEE 2028 student" });
    }

    const student = await getCurrentStudent();
    if (!student) return NextResponse.json({ error: "Sign in required." }, { status: 401 });
    const result = await client.execute({ sql: `SELECT payload, shareToken, updatedAt FROM "PersonalTimetable" WHERE studentId = ? LIMIT 1`, args: [student.id] });
    const row = result.rows[0] as { payload?: string; shareToken?: string; updatedAt?: string } | undefined;
    return NextResponse.json({ ok: true, mode: "owner", payload: row?.payload ? JSON.parse(row.payload) : null, shareToken: row?.shareToken ?? null, updatedAt: row?.updatedAt ?? null });
  } finally {
    client.close();
  }
}

export async function PUT(request: Request) {
  const student = await getCurrentStudent();
  if (!student) return NextResponse.json({ error: "Sign in required." }, { status: 401 });
  const body = (await request.json()) as { rows?: unknown };
  if (!Array.isArray(body.rows)) return NextResponse.json({ error: "Invalid timetable payload." }, { status: 400 });
  await ensureTable();
  const client = db();
  try {
    const existing = await client.execute({ sql: `SELECT shareToken FROM "PersonalTimetable" WHERE studentId = ? LIMIT 1`, args: [student.id] });
    const old = existing.rows[0] as { shareToken?: string } | undefined;
    const shareToken = old?.shareToken ?? randomBytes(24).toString("base64url");
    await client.execute({ sql: `INSERT INTO "PersonalTimetable" (studentId, payload, shareToken, updatedAt) VALUES (?, ?, ?, CURRENT_TIMESTAMP) ON CONFLICT(studentId) DO UPDATE SET payload = excluded.payload, updatedAt = CURRENT_TIMESTAMP`, args: [student.id, JSON.stringify(body.rows), shareToken] });
    return NextResponse.json({ ok: true, shareToken });
  } finally {
    client.close();
  }
}

export async function POST() {
  const student = await getCurrentStudent();
  if (!student) return NextResponse.json({ error: "Sign in required." }, { status: 401 });
  await ensureTable();
  const client = db();
  try {
    const existing = await client.execute({ sql: `SELECT shareToken FROM "PersonalTimetable" WHERE studentId = ? LIMIT 1`, args: [student.id] });
    const old = existing.rows[0] as { shareToken?: string } | undefined;
    const shareToken = old?.shareToken ?? randomBytes(24).toString("base64url");
    await client.execute({ sql: `INSERT INTO "PersonalTimetable" (studentId, payload, shareToken, updatedAt) VALUES (?, ?, ?, CURRENT_TIMESTAMP) ON CONFLICT(studentId) DO UPDATE SET shareToken = excluded.shareToken, updatedAt = CURRENT_TIMESTAMP`, args: [student.id, JSON.stringify([]), shareToken] });
    return NextResponse.json({ ok: true, shareToken });
  } finally {
    client.close();
  }
}
