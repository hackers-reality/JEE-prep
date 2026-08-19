import { createClient } from "@libsql/client";
import { getCurrentStudent } from "@/lib/auth";

function db() {
  const url = process.env.TURSO_DATABASE_URL ?? process.env.DATABASE_URL ?? "file:./prisma/dev.db";
  const authToken = process.env.TURSO_AUTH_TOKEN;
  return createClient({ url, ...(authToken ? { authToken } : {}) });
}

export async function ensureStudySchema() {
  const client = db();
  try {
    await client.execute(`CREATE TABLE IF NOT EXISTS "StudyTask" ("id" TEXT NOT NULL PRIMARY KEY, "studentId" TEXT NOT NULL, "title" TEXT NOT NULL, "description" TEXT, "dueAt" DATETIME, "status" TEXT NOT NULL DEFAULT 'TODO', "priority" INTEGER NOT NULL DEFAULT 2, "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP, "updatedAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP, CONSTRAINT "StudyTask_studentId_fkey" FOREIGN KEY ("studentId") REFERENCES "Student" ("id") ON DELETE CASCADE)`);
    await client.execute(`CREATE INDEX IF NOT EXISTS "StudyTask_studentId_dueAt_idx" ON "StudyTask"("studentId", "dueAt")`);

    await client.execute(`CREATE TABLE IF NOT EXISTS "StudySession" ("id" TEXT NOT NULL PRIMARY KEY, "studentId" TEXT NOT NULL, "startedAt" DATETIME NOT NULL, "endedAt" DATETIME NOT NULL, "durationMinutes" INTEGER NOT NULL DEFAULT 0, "sessionType" TEXT NOT NULL DEFAULT 'FOCUS', "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP, CONSTRAINT "StudySession_studentId_fkey" FOREIGN KEY ("studentId") REFERENCES "Student" ("id") ON DELETE RESTRICT ON UPDATE CASCADE)`);

    // Backward-compatible migration for the short-lived session schema that used
    // minutes/notes and allowed a nullable end timestamp.
    const columns = await client.execute(`PRAGMA table_info("StudySession")`);
    const names = new Set(columns.rows.map((row) => String(row.name ?? "")));
    if (!names.has("durationMinutes")) await client.execute(`ALTER TABLE "StudySession" ADD COLUMN "durationMinutes" INTEGER NOT NULL DEFAULT 0`);
    if (!names.has("sessionType")) await client.execute(`ALTER TABLE "StudySession" ADD COLUMN "sessionType" TEXT NOT NULL DEFAULT 'FOCUS'`);
    if (names.has("minutes")) await client.execute(`UPDATE "StudySession" SET durationMinutes = CASE WHEN durationMinutes > 0 THEN durationMinutes ELSE COALESCE(minutes, 0) END`);
    if (names.has("endedAt")) await client.execute(`UPDATE "StudySession" SET endedAt = startedAt WHERE endedAt IS NULL`);

    await client.execute(`CREATE INDEX IF NOT EXISTS "StudySession_studentId_startedAt_idx" ON "StudySession"("studentId", "startedAt")`);
  } finally { client.close(); }
}

export async function currentStudentId() {
  const student = await getCurrentStudent();
  return student?.id ?? null;
}

export function newStudyId() { return crypto.randomUUID(); }
