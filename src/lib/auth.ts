import { createHash, randomBytes, scryptSync, timingSafeEqual } from "node:crypto";
import { createClient } from "@libsql/client";
import { prisma } from "@/lib/prisma";
import { ensureDatabaseSchema } from "@/lib/database";
import { cookies } from "next/headers";

const SESSION_COOKIE = "jee_session";
const SESSION_DAYS = 30;

function db() {
  const url = process.env.TURSO_DATABASE_URL ?? process.env.DATABASE_URL ?? "file:./prisma/dev.db";
  const authToken = process.env.TURSO_AUTH_TOKEN;
  return createClient({ url, ...(authToken ? { authToken } : {}) });
}

async function ensureAuthSchema() {
  const client = db();
  try {
    await client.execute(`CREATE TABLE IF NOT EXISTS "Account" ("id" TEXT NOT NULL PRIMARY KEY, "studentId" TEXT NOT NULL UNIQUE, "email" TEXT NOT NULL UNIQUE, "passwordHash" TEXT NOT NULL, "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP, "updatedAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP, CONSTRAINT "Account_studentId_fkey" FOREIGN KEY ("studentId") REFERENCES "Student" ("id") ON DELETE CASCADE ON UPDATE CASCADE)`);
    await client.execute(`CREATE TABLE IF NOT EXISTS "AuthSession" ("id" TEXT NOT NULL PRIMARY KEY, "accountId" TEXT NOT NULL, "tokenHash" TEXT NOT NULL UNIQUE, "expiresAt" DATETIME NOT NULL, "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP, CONSTRAINT "AuthSession_accountId_fkey" FOREIGN KEY ("accountId") REFERENCES "Account" ("id") ON DELETE CASCADE ON UPDATE CASCADE)`);
    await client.execute(`CREATE INDEX IF NOT EXISTS "AuthSession_accountId_expiresAt_idx" ON "AuthSession"("accountId", "expiresAt")`);
  } finally {
    client.close();
  }
}

function normalizeEmail(email: string) {
  return email.trim().toLowerCase();
}

function hashPassword(password: string) {
  const salt = randomBytes(16).toString("hex");
  const key = scryptSync(password, salt, 64).toString("hex");
  return `scrypt$${salt}$${key}`;
}

function verifyPassword(password: string, stored: string) {
  const [, salt, expected] = stored.split("$");
  if (!salt || !expected) return false;
  const actual = scryptSync(password, salt, 64);
  const expectedBuffer = Buffer.from(expected, "hex");
  return expectedBuffer.length === actual.length && timingSafeEqual(actual, expectedBuffer);
}

function hashToken(token: string) {
  return createHash("sha256").update(token).digest("hex");
}

export async function registerAccount(name: string, email: string, password: string) {
  await ensureDatabaseSchema();
  await ensureAuthSchema();
  const normalizedEmail = normalizeEmail(email);
  if (!normalizedEmail || !normalizedEmail.includes("@")) throw new Error("Enter a valid email address.");
  if (password.length < 8) throw new Error("Password must be at least 8 characters.");

  const existingClient = db();
  let exists = false;
  try {
    const existing = await existingClient.execute({ sql: `SELECT id FROM "Account" WHERE email = ? LIMIT 1`, args: [normalizedEmail] });
    exists = existing.rows.length > 0;
  } finally {
    existingClient.close();
  }
  if (exists) throw new Error("An account with that email already exists.");

  const student = await prisma.student.create({ data: { name: name.trim() || "Student" } });
  const accountId = crypto.randomUUID();
  const client = db();
  try {
    await client.execute({ sql: `INSERT INTO "Account" (id, studentId, email, passwordHash) VALUES (?, ?, ?, ?)`, args: [accountId, student.id, normalizedEmail, hashPassword(password)] });
  } catch (error) {
    await prisma.student.delete({ where: { id: student.id } }).catch(() => undefined);
    throw error;
  } finally {
    client.close();
  }
  return createSession(accountId);
}

export async function loginAccount(email: string, password: string) {
  await ensureDatabaseSchema();
  await ensureAuthSchema();
  const client = db();
  try {
    const result = await client.execute({ sql: `SELECT id, passwordHash FROM "Account" WHERE email = ? LIMIT 1`, args: [normalizeEmail(email)] });
    const account = result.rows[0] as { id?: string; passwordHash?: string } | undefined;
    if (!account?.id || !account.passwordHash || !verifyPassword(password, account.passwordHash)) throw new Error("Invalid email or password.");
    return createSession(account.id);
  } finally {
    client.close();
  }
}

async function createSession(accountId: string) {
  const token = randomBytes(32).toString("base64url");
  const expiresAt = new Date(Date.now() + SESSION_DAYS * 24 * 60 * 60 * 1000);
  const client = db();
  try {
    await client.execute({ sql: `INSERT INTO "AuthSession" (id, accountId, tokenHash, expiresAt) VALUES (?, ?, ?, ?)`, args: [crypto.randomUUID(), accountId, hashToken(token), expiresAt.toISOString()] });
  } finally {
    client.close();
  }
  return { token, expiresAt };
}

export async function getCurrentStudent() {
  await ensureDatabaseSchema();
  await ensureAuthSchema();
  const cookieStore = await cookies();
  const token = cookieStore.get(SESSION_COOKIE)?.value;
  if (!token) return null;

  const client = db();
  try {
    const result = await client.execute({ sql: `SELECT a.studentId, s.expiresAt FROM "AuthSession" s JOIN "Account" a ON a.id = s.accountId WHERE s.tokenHash = ? LIMIT 1`, args: [hashToken(token)] });
    const session = result.rows[0] as { studentId?: string; expiresAt?: string } | undefined;
    if (!session?.studentId || !session.expiresAt || new Date(session.expiresAt) <= new Date()) return null;
    return prisma.student.findUnique({ where: { id: session.studentId }, include: { selfRatings: true } });
  } finally {
    client.close();
  }
}

export async function destroyCurrentSession() {
  const cookieStore = await cookies();
  const token = cookieStore.get(SESSION_COOKIE)?.value;
  if (token) {
    const client = db();
    try {
      await client.execute({ sql: `DELETE FROM "AuthSession" WHERE tokenHash = ?`, args: [hashToken(token)] });
    } finally {
      client.close();
    }
  }
  cookieStore.delete(SESSION_COOKIE);
}

export { SESSION_COOKIE };
