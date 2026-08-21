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
    await client.execute(`CREATE TABLE IF NOT EXISTS "PersonalTimetable" ("studentId" TEXT NOT NULL PRIMARY KEY, "payload" TEXT NOT NULL, "shareToken" TEXT NOT NULL UNIQUE, "updatedAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP, CONSTRAINT "PersonalTimetable_studentId_fkey" FOREIGN KEY ("studentId") REFERENCES "Student" ("id") ON DELETE CASCADE)`);
    await client.execute(`CREATE UNIQUE INDEX IF NOT EXISTS "PersonalTimetable_shareToken_key" ON "PersonalTimetable"("shareToken")`);
  } finally { client.close(); }
}

type PersonalPayload = {
  rows: unknown[];
  logs: Record<string, unknown>;
  syllabus: Record<string, string>;
};

const emptyPayload: PersonalPayload = { rows: [], logs: {}, syllabus: {} };

function normalizePayload(value: unknown): PersonalPayload {
  if (!value || typeof value !== "object") return emptyPayload;
  const parsed = value as Partial<PersonalPayload>;
  return {
    rows: Array.isArray(parsed.rows) ? parsed.rows : [],
    logs: parsed.logs && typeof parsed.logs === "object" ? parsed.logs as Record<string, unknown> : {},
    syllabus: parsed.syllabus && typeof parsed.syllabus === "object" ? parsed.syllabus as Record<string, string> : {},
  };
}

function parsePayload(payload: string | null | undefined) {
  if (!payload) return emptyPayload;
  try { return normalizePayload(JSON.parse(payload)); } catch { return emptyPayload; }
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
      if (!row) return NextResponse.json({ error: "Share link not found." }, { status: 404 });
      return NextResponse.json({ ok: true, mode: "viewer", payload: parsePayload(row.payload), updatedAt: row.updatedAt, studentName: row.name ?? "JEE 2028 student" });
    }

    const student = await getCurrentStudent();
    if (!student) return NextResponse.json({ error: "Sign in required." }, { status: 401 });
    const result = await client.execute({ sql: `SELECT payload, shareToken, updatedAt FROM "PersonalTimetable" WHERE studentId = ? LIMIT 1`, args: [student.id] });
    const row = result.rows[0] as { payload?: string; shareToken?: string; updatedAt?: string } | undefined;
    return NextResponse.json({ ok: true, mode: "owner", payload: parsePayload(row?.payload), shareToken: row?.shareToken ?? null, updatedAt: row?.updatedAt ?? null });
  } finally { client.close(); }
}

export async function PUT(request: Request) {
  const student = await getCurrentStudent();
  if (!student) return NextResponse.json({ error: "Sign in required." }, { status: 401 });
  const body = await request.json() as { payload?: unknown; rows?: unknown; logs?: unknown; syllabus?: unknown };
  const payload = normalizePayload(body.payload ?? { rows: body.rows, logs: body.logs, syllabus: body.syllabus });
  await ensureTable();
  const client = db();
  try {
    const existing = await client.execute({ sql: `SELECT shareToken FROM "PersonalTimetable" WHERE studentId = ? LIMIT 1`, args: [student.id] });
    const old = existing.rows[0] as { shareToken?: string } | undefined;
    const shareToken = old?.shareToken ?? randomBytes(24).toString("base64url");
    await client.execute({ sql: `INSERT INTO "PersonalTimetable" (studentId, payload, shareToken, updatedAt) VALUES (?, ?, ?, CURRENT_TIMESTAMP) ON CONFLICT(studentId) DO UPDATE SET payload = excluded.payload, updatedAt = CURRENT_TIMESTAMP`, args: [student.id, JSON.stringify(payload), shareToken] });
    return NextResponse.json({ ok: true, shareToken, updatedAt: new Date().toISOString() });
  } finally { client.close(); }
}

export async function POST() {
  const student = await getCurrentStudent();
  if (!student) return NextResponse.json({ error: "Sign in required." }, { status: 401 });
  await ensureTable();
  const client = db();
  try {
    const existing = await client.execute({ sql: `SELECT shareToken, payload FROM "PersonalTimetable" WHERE studentId = ? LIMIT 1`, args: [student.id] });
    const old = existing.rows[0] as { shareToken?: string; payload?: string } | undefined;
    const shareToken = old?.shareToken ?? randomBytes(24).toString("base64url");
    const payload = old?.payload ?? JSON.stringify(emptyPayload);
    await client.execute({ sql: `INSERT INTO "PersonalTimetable" (studentId, payload, shareToken, updatedAt) VALUES (?, ?, ?, CURRENT_TIMESTAMP) ON CONFLICT(studentId) DO UPDATE SET shareToken = excluded.shareToken, updatedAt = CURRENT_TIMESTAMP`, args: [student.id, payload, shareToken] });
    return NextResponse.json({ ok: true, shareToken });
  } finally { client.close(); }
}
