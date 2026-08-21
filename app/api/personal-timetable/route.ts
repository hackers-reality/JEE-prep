import { NextResponse } from "next/server";
import { createClient } from "@libsql/client";
import { ensureDatabaseSchema } from "@/lib/database";
import { getPersonalAccess } from "@/lib/personal-access";

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

function db() {
  const url = process.env.TURSO_DATABASE_URL ?? process.env.DATABASE_URL;
  if (!url) throw new Error("TURSO_DATABASE_URL is not configured.");
  const authToken = process.env.TURSO_AUTH_TOKEN;
  return createClient({ url, ...(authToken ? { authToken } : {}) });
}

async function ensureTable() {
  await ensureDatabaseSchema();
  const client = db();
  try {
    await client.execute(`CREATE TABLE IF NOT EXISTS "PersonalTimetableAccess" ("id" INTEGER NOT NULL PRIMARY KEY CHECK ("id" = 1), "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP, "updatedAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP)`);
    await client.execute(`INSERT OR IGNORE INTO "PersonalTimetableAccess" ("id") VALUES (1)`);
    await client.execute(`CREATE TABLE IF NOT EXISTS "PersonalTimetableData" ("id" INTEGER NOT NULL PRIMARY KEY CHECK ("id" = 1), "payload" TEXT NOT NULL, "updatedAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP)`);
  } finally {
    client.close();
  }
}

function asObject(value: unknown): Record<string, unknown> {
  return value && typeof value === "object" && !Array.isArray(value) ? value as Record<string, unknown> : {};
}

function readPayload(payload: string | null | undefined): PersonalPayload {
  if (!payload) return emptyPayload;
  try {
    const parsed = asObject(JSON.parse(payload));
    return {
      rows: Array.isArray(parsed.rows) ? parsed.rows : [],
      logs: asObject(parsed.logs),
      syllabus: asObject(parsed.syllabus) as Record<string, string>,
      gtDiary: [],
      doubts: [],
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
    gtDiary: [],
    doubts: [],
    bookProgress: asObject(body.bookProgress),
    weeklyReviews: Array.isArray(body.weeklyReviews) ? body.weeklyReviews : [],
  };
}

export async function GET() {
  await ensureTable();
  const access = await getPersonalAccess();
  if (!access.allowed) return NextResponse.json({ error: "Enter the owner password or continue as guest." }, { status: 401 });
  const client = db();
  try {
    const result = await client.execute(`SELECT payload, updatedAt FROM "PersonalTimetableData" WHERE id = 1 LIMIT 1`);
    const row = result.rows[0] as { payload?: string; updatedAt?: string } | undefined;
    return NextResponse.json({ ok: true, mode: access.owner ? "owner" : "guest", readOnly: !access.owner, payload: readPayload(row?.payload), updatedAt: row?.updatedAt ?? null });
  } finally {
    client.close();
  }
}

export async function PUT(request: Request) {
  const access = await getPersonalAccess();
  if (!access.owner) return NextResponse.json({ error: "Owner access required." }, { status: 403 });
  const body = (await request.json()) as Partial<PersonalPayload> & { rows?: unknown };
  const payload = normalizePayload(body);
  await ensureTable();
  const client = db();
  try {
    await client.execute({
      sql: `INSERT INTO "PersonalTimetableData" (id, payload, updatedAt) VALUES (1, ?, CURRENT_TIMESTAMP) ON CONFLICT(id) DO UPDATE SET payload = excluded.payload, updatedAt = CURRENT_TIMESTAMP`,
      args: [JSON.stringify(payload)],
    });
    return NextResponse.json({ ok: true, mode: "owner", updatedAt: new Date().toISOString() });
  } finally {
    client.close();
  }
}

export async function POST() {
  return NextResponse.json({ error: "Share-link generation is no longer used. Open the permanent personal timetable URL instead." }, { status: 410 });
}
