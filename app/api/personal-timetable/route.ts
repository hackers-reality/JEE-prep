import { NextResponse } from "next/server";
import { randomBytes } from "node:crypto";
import { createClient } from "@libsql/client";
import { getCurrentStudent } from "@/lib/auth";
import { ensureDatabaseSchema } from "@/lib/database";

export type TimetableVisibility = "private" | "parent_teacher" | "anyone_with_link";

function db() {
  const url = process.env.TURSO_DATABASE_URL ?? process.env.DATABASE_URL ?? "file:./prisma/dev.db";
  const authToken = process.env.TURSO_AUTH_TOKEN;
  return createClient({ url, ...(authToken ? { authToken } : {}) });
}

async function ensureTable() {
  await ensureDatabaseSchema();
  const client = db();
  try {
    await client.execute(`CREATE TABLE IF NOT EXISTS "PersonalTimetable" ("studentId" TEXT NOT NULL PRIMARY KEY, "payload" TEXT NOT NULL, "shareToken" TEXT NOT NULL UNIQUE, "visibility" TEXT NOT NULL DEFAULT 'private', "shareExpiresAt" DATETIME, "shareRevokedAt" DATETIME, "updatedAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP, CONSTRAINT "PersonalTimetable_studentId_fkey" FOREIGN KEY ("studentId") REFERENCES "Student" ("id") ON DELETE CASCADE)`);
    const columns = await client.execute(`PRAGMA table_info("PersonalTimetable")`);
    const names = new Set(columns.rows.map((row) => String(row.name ?? "")));
    if (!names.has("visibility")) await client.execute(`ALTER TABLE "PersonalTimetable" ADD COLUMN "visibility" TEXT NOT NULL DEFAULT 'private'`);
    if (!names.has("shareExpiresAt")) await client.execute(`ALTER TABLE "PersonalTimetable" ADD COLUMN "shareExpiresAt" DATETIME`);
    if (!names.has("shareRevokedAt")) await client.execute(`ALTER TABLE "PersonalTimetable" ADD COLUMN "shareRevokedAt" DATETIME`);
    await client.execute(`CREATE UNIQUE INDEX IF NOT EXISTS "PersonalTimetable_shareToken_key" ON "PersonalTimetable"("shareToken")`);
    await client.execute(`CREATE INDEX IF NOT EXISTS "PersonalTimetable_visibility_idx" ON "PersonalTimetable"("visibility")`);
  } finally {
    client.close();
  }
}

export type PersonalPayload = {
  rows: unknown[];
  logs: Record<string, unknown>;
  syllabus: Record<string, string>;
  gtDiary: unknown[];
  doubts: unknown[];
  bookProgress: Record<string, unknown>;
  weeklyReviews: unknown[];
};

const emptyPayload: PersonalPayload = {
  rows: [], logs: {}, syllabus: {}, gtDiary: [], doubts: [], bookProgress: {}, weeklyReviews: [],
};

function asObject(value: unknown): Record<string, unknown> {
  return value && typeof value === "object" && !Array.isArray(value) ? value as Record<string, unknown> : {};
}

function normalizeVisibility(value: unknown): TimetableVisibility {
  return value === "parent_teacher" || value === "anyone_with_link" ? value : "private";
}

async function readPayload(payload: string | null | undefined): Promise<PersonalPayload> {
  if (!payload) return emptyPayload;
  try {
    const parsed = asObject(JSON.parse(payload));
    return {
      rows: Array.isArray(parsed.rows) ? parsed.rows : [],
      logs: asObject(parsed.logs),
      syllabus: asObject(parsed.syllabus) as Record<string, string>,
      gtDiary: Array.isArray(parsed.gtDiary) ? parsed.gtDiary : [],
      doubts: Array.isArray(parsed.doubts) ? parsed.doubts : [],
      bookProgress: asObject(parsed.bookProgress),
      weeklyReviews: Array.isArray(parsed.weeklyReviews) ? parsed.weeklyReviews : [],
    };
  } catch {
    return emptyPayload;
  }
}

function normalizePayload(body: Partial<PersonalPayload> & { rows?: unknown }): PersonalPayload {
  return {
    rows: Array.isArray(body.rows) ? body.rows : [],
    logs: asObject(body.logs),
    syllabus: asObject(body.syllabus) as Record<string, string>,
    gtDiary: Array.isArray(body.gtDiary) ? body.gtDiary : [],
    doubts: Array.isArray(body.doubts) ? body.doubts : [],
    bookProgress: asObject(body.bookProgress),
    weeklyReviews: Array.isArray(body.weeklyReviews) ? body.weeklyReviews : [],
  };
}

export async function GET(request: Request) {
  await ensureTable();
  const url = new URL(request.url);
  const share = url.searchParams.get("share");
  const client = db();
  try {
    if (share) {
      const result = await client.execute({ sql: `SELECT p.payload, p.updatedAt, p.visibility, p.shareExpiresAt, p.shareRevokedAt, s.name FROM "PersonalTimetable" p JOIN "Student" s ON s.id = p.studentId WHERE p.shareToken = ? LIMIT 1`, args: [share] });
      const row = result.rows[0] as { payload?: string; updatedAt?: string; visibility?: string; shareExpiresAt?: string | null; shareRevokedAt?: string | null; name?: string } | undefined;
      if (!row) return NextResponse.json({ error: "Share link not found." }, { status: 404 });
      const visibility = normalizeVisibility(row.visibility);
      if (visibility === "private") return NextResponse.json({ error: "This timetable is private." }, { status: 403 });
      if (row.shareRevokedAt) return NextResponse.json({ error: "This share link has been revoked." }, { status: 410 });
      if (row.shareExpiresAt && new Date(row.shareExpiresAt) <= new Date()) return NextResponse.json({ error: "This share link has expired." }, { status: 410 });
      return NextResponse.json({ ok: true, mode: "viewer", visibility, payload: await readPayload(row.payload), updatedAt: row.updatedAt, studentName: row.name ?? "JEE 2028 student" });
    }

    const student = await getCurrentStudent();
    if (!student) return NextResponse.json({ error: "Sign in required." }, { status: 401 });
    const result = await client.execute({ sql: `SELECT payload, shareToken, visibility, shareExpiresAt, shareRevokedAt, updatedAt FROM "PersonalTimetable" WHERE studentId = ? LIMIT 1`, args: [student.id] });
    const row = result.rows[0] as { payload?: string; shareToken?: string; visibility?: string; shareExpiresAt?: string | null; shareRevokedAt?: string | null; updatedAt?: string } | undefined;
    return NextResponse.json({ ok: true, mode: "owner", payload: await readPayload(row?.payload), shareToken: row?.shareToken ?? null, visibility: normalizeVisibility(row?.visibility), shareExpiresAt: row?.shareExpiresAt ?? null, shareRevokedAt: row?.shareRevokedAt ?? null, updatedAt: row?.updatedAt ?? null });
  } finally {
    client.close();
  }
}

export async function PUT(request: Request) {
  const student = await getCurrentStudent();
  if (!student) return NextResponse.json({ error: "Sign in required." }, { status: 401 });
  const body = (await request.json()) as Partial<PersonalPayload> & { rows?: unknown; visibility?: unknown; shareExpiresAt?: string | null; revokeShare?: boolean };
  const payload = normalizePayload(body);
  const visibility = normalizeVisibility(body.visibility);
  await ensureTable();
  const client = db();
  try {
    const existing = await client.execute({ sql: `SELECT shareToken, shareExpiresAt, shareRevokedAt FROM "PersonalTimetable" WHERE studentId = ? LIMIT 1`, args: [student.id] });
    const old = existing.rows[0] as { shareToken?: string; shareExpiresAt?: string | null; shareRevokedAt?: string | null } | undefined;
    const shareToken = old?.shareToken ?? randomBytes(24).toString("base64url");
    const expiresAt = body.shareExpiresAt === null ? null : (body.shareExpiresAt ?? old?.shareExpiresAt ?? null);
    const revokedAt = body.revokeShare ? new Date().toISOString() : (visibility === "private" ? new Date().toISOString() : null);
    await client.execute({
      sql: `INSERT INTO "PersonalTimetable" (studentId, payload, shareToken, visibility, shareExpiresAt, shareRevokedAt, updatedAt) VALUES (?, ?, ?, ?, ?, ?, CURRENT_TIMESTAMP)
            ON CONFLICT(studentId) DO UPDATE SET payload = excluded.payload, visibility = excluded.visibility, shareExpiresAt = excluded.shareExpiresAt, shareRevokedAt = excluded.shareRevokedAt, updatedAt = CURRENT_TIMESTAMP`,
      args: [student.id, JSON.stringify(payload), shareToken, visibility, expiresAt, revokedAt],
    });
    return NextResponse.json({ ok: true, shareToken, visibility, shareExpiresAt: expiresAt, shareRevokedAt: revokedAt, updatedAt: new Date().toISOString() });
  } finally {
    client.close();
  }
}

export async function POST(request: Request) {
  const student = await getCurrentStudent();
  if (!student) return NextResponse.json({ error: "Sign in required." }, { status: 401 });
  const body = (await request.json().catch(() => ({}))) as { visibility?: unknown; expiresAt?: string | null; rotate?: boolean };
  const visibility = normalizeVisibility(body.visibility ?? "parent_teacher");
  await ensureTable();
  const client = db();
  try {
    const existing = await client.execute({ sql: `SELECT shareToken, payload, shareExpiresAt FROM "PersonalTimetable" WHERE studentId = ? LIMIT 1`, args: [student.id] });
    const old = existing.rows[0] as { shareToken?: string; payload?: string; shareExpiresAt?: string | null } | undefined;
    const shareToken = !body.rotate && old?.shareToken ? old.shareToken : randomBytes(24).toString("base64url");
    const payload = old?.payload ?? JSON.stringify(emptyPayload);
    const expiresAt = body.expiresAt === undefined ? (old?.shareExpiresAt ?? null) : body.expiresAt;
    await client.execute({
      sql: `INSERT INTO "PersonalTimetable" (studentId, payload, shareToken, visibility, shareExpiresAt, shareRevokedAt, updatedAt) VALUES (?, ?, ?, ?, ?, NULL, CURRENT_TIMESTAMP)
            ON CONFLICT(studentId) DO UPDATE SET shareToken = excluded.shareToken, visibility = excluded.visibility, shareExpiresAt = excluded.shareExpiresAt, shareRevokedAt = NULL, updatedAt = CURRENT_TIMESTAMP`,
      args: [student.id, payload, shareToken, visibility, expiresAt],
    });
    return NextResponse.json({ ok: true, shareToken, visibility, shareExpiresAt: expiresAt });
  } finally {
    client.close();
  }
}
