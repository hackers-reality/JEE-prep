import { createClient } from "@libsql/client";
import { getCurrentStudent } from "@/lib/auth";

function db() {
  const url = process.env.TURSO_DATABASE_URL ?? process.env.DATABASE_URL ?? "file:./prisma/dev.db";
  const authToken = process.env.TURSO_AUTH_TOKEN;
  if (process.env.NODE_ENV === "production" && !process.env.TURSO_DATABASE_URL && !process.env.DATABASE_URL) {
    throw new Error("Production database is not configured. Set TURSO_DATABASE_URL and TURSO_AUTH_TOKEN.");
  }
  if (process.env.NODE_ENV === "production" && process.env.TURSO_DATABASE_URL && !authToken) {
    throw new Error("TURSO_AUTH_TOKEN is missing in production.");
  }
  return createClient({ url, ...(authToken ? { authToken } : {}) });
}

export async function ensureStudySchema() {
  const client = db();
  try {
    await client.execute(`CREATE TABLE IF NOT EXISTS "StudyTask" ("id" TEXT NOT NULL PRIMARY KEY, "studentId" TEXT NOT NULL, "title" TEXT NOT NULL, "description" TEXT, "dueAt" DATETIME, "status" TEXT NOT NULL DEFAULT 'TODO', "priority" INTEGER NOT NULL DEFAULT 2, "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP, "updatedAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP, CONSTRAINT "StudyTask_studentId_fkey" FOREIGN KEY ("studentId") REFERENCES "Student" ("id") ON DELETE CASCADE)`);
    await client.execute(`CREATE INDEX IF NOT EXISTS "StudyTask_studentId_dueAt_idx" ON "StudyTask"("studentId", "dueAt")`);

    await client.execute(`CREATE TABLE IF NOT EXISTS "StudySession" ("id" TEXT NOT NULL PRIMARY KEY, "studentId" TEXT NOT NULL, "startedAt" DATETIME NOT NULL, "endedAt" DATETIME NOT NULL, "durationMinutes" INTEGER NOT NULL DEFAULT 0, "sessionType" TEXT NOT NULL DEFAULT 'FOCUS', "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP, CONSTRAINT "StudySession_studentId_fkey" FOREIGN KEY ("studentId") REFERENCES "Student" ("id") ON DELETE RESTRICT ON UPDATE CASCADE)`);

    const columns = await client.execute(`PRAGMA table_info("StudySession")`);
    const names = new Set(columns.rows.map((row) => String(row.name ?? "")));
    if (!names.has("durationMinutes")) await client.execute(`ALTER TABLE "StudySession" ADD COLUMN "durationMinutes" INTEGER NOT NULL DEFAULT 0`);
    if (!names.has("sessionType")) await client.execute(`ALTER TABLE "StudySession" ADD COLUMN "sessionType" TEXT NOT NULL DEFAULT 'FOCUS'`);
    if (names.has("minutes")) await client.execute(`UPDATE "StudySession" SET durationMinutes = CASE WHEN durationMinutes > 0 THEN durationMinutes ELSE COALESCE(minutes, 0) END`);
    if (names.has("endedAt")) await client.execute(`UPDATE "StudySession" SET endedAt = startedAt WHERE endedAt IS NULL`);
    await client.execute(`CREATE INDEX IF NOT EXISTS "StudySession_studentId_startedAt_idx" ON "StudySession"("studentId", "startedAt")`);

    await client.execute(`CREATE TABLE IF NOT EXISTS "StudySchedule" ("id" TEXT NOT NULL PRIMARY KEY, "studentId" TEXT NOT NULL, "scheduleDate" TEXT NOT NULL, "version" INTEGER NOT NULL DEFAULT 1, "status" TEXT NOT NULL DEFAULT 'DRAFT', "source" TEXT NOT NULL DEFAULT 'SYSTEM', "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP, "updatedAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP, CONSTRAINT "StudySchedule_studentId_fkey" FOREIGN KEY ("studentId") REFERENCES "Student" ("id") ON DELETE CASCADE)`);
    await client.execute(`CREATE UNIQUE INDEX IF NOT EXISTS "StudySchedule_studentId_date_version_uq" ON "StudySchedule"("studentId", "scheduleDate", "version")`);
    await client.execute(`CREATE INDEX IF NOT EXISTS "StudySchedule_studentId_date_idx" ON "StudySchedule"("studentId", "scheduleDate")`);

    await client.execute(`CREATE TABLE IF NOT EXISTS "StudyScheduleBlock" ("id" TEXT NOT NULL PRIMARY KEY, "scheduleId" TEXT NOT NULL, "taskId" TEXT, "topicId" TEXT, "title" TEXT NOT NULL, "kind" TEXT NOT NULL, "startMinutes" INTEGER NOT NULL, "endMinutes" INTEGER NOT NULL, "priority" INTEGER NOT NULL DEFAULT 2, "locked" INTEGER NOT NULL DEFAULT 0, "status" TEXT NOT NULL DEFAULT 'PLANNED', "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP, CONSTRAINT "StudyScheduleBlock_scheduleId_fkey" FOREIGN KEY ("scheduleId") REFERENCES "StudySchedule" ("id") ON DELETE CASCADE, CONSTRAINT "StudyScheduleBlock_taskId_fkey" FOREIGN KEY ("taskId") REFERENCES "StudyTask" ("id") ON DELETE SET NULL, CONSTRAINT "StudyScheduleBlock_topicId_fkey" FOREIGN KEY ("topicId") REFERENCES "Topic" ("id") ON DELETE SET NULL)`);
    await client.execute(`CREATE INDEX IF NOT EXISTS "StudyScheduleBlock_scheduleId_start_idx" ON "StudyScheduleBlock"("scheduleId", "startMinutes")`);

    await client.execute(`CREATE TABLE IF NOT EXISTS "ScheduleValidationAttempt" ("id" TEXT NOT NULL PRIMARY KEY, "studentId" TEXT NOT NULL, "topicId" TEXT NOT NULL, "scheduleId" TEXT, "scorePercent" REAL NOT NULL, "thresholdPercent" REAL NOT NULL DEFAULT 90, "passed" INTEGER NOT NULL, "coveredConcepts" TEXT NOT NULL, "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP, CONSTRAINT "ScheduleValidationAttempt_studentId_fkey" FOREIGN KEY ("studentId") REFERENCES "Student" ("id") ON DELETE CASCADE, CONSTRAINT "ScheduleValidationAttempt_topicId_fkey" FOREIGN KEY ("topicId") REFERENCES "Topic" ("id") ON DELETE CASCADE, CONSTRAINT "ScheduleValidationAttempt_scheduleId_fkey" FOREIGN KEY ("scheduleId") REFERENCES "StudySchedule" ("id") ON DELETE SET NULL)`);
    await client.execute(`CREATE INDEX IF NOT EXISTS "ScheduleValidationAttempt_student_topic_idx" ON "ScheduleValidationAttempt"("studentId", "topicId", "createdAt")`);
  } finally { client.close(); }
}

export async function currentStudentId() {
  const student = await getCurrentStudent();
  return student?.id ?? null;
}

export function newStudyId() { return crypto.randomUUID(); }
