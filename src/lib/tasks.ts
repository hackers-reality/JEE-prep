import { createClient } from "@libsql/client";
import { randomUUID } from "node:crypto";
import { getCurrentStudent } from "@/lib/auth";

function db() {
  const url = process.env.TURSO_DATABASE_URL ?? process.env.DATABASE_URL ?? "file:./prisma/dev.db";
  const authToken = process.env.TURSO_AUTH_TOKEN;
  return createClient({ url, ...(authToken ? { authToken } : {}) });
}

async function ensureTaskSchema() {
  const client = db();
  try {
    await client.execute(`CREATE TABLE IF NOT EXISTS "Task" ("id" TEXT NOT NULL PRIMARY KEY, "studentId" TEXT NOT NULL, "title" TEXT NOT NULL, "description" TEXT, "dueDate" DATETIME, "priority" TEXT NOT NULL DEFAULT 'MEDIUM', "category" TEXT NOT NULL DEFAULT 'STUDY', "completedAt" DATETIME, "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP, "updatedAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP, CONSTRAINT "Task_studentId_fkey" FOREIGN KEY ("studentId") REFERENCES "Student" ("id") ON DELETE CASCADE ON UPDATE CASCADE)`);
    await client.execute(`CREATE INDEX IF NOT EXISTS "Task_studentId_dueDate_idx" ON "Task"("studentId", "dueDate")`);
  } finally {
    client.close();
  }
}

export async function listTasks() {
  const student = await getCurrentStudent();
  if (!student) return null;
  await ensureTaskSchema();
  const client = db();
  try {
    const result = await client.execute({ sql: `SELECT id, title, description, dueDate, priority, category, completedAt, createdAt FROM "Task" WHERE studentId = ? ORDER BY completedAt IS NOT NULL, dueDate IS NULL, dueDate ASC, createdAt DESC`, args: [student.id] });
    return result.rows;
  } finally {
    client.close();
  }
}

export async function createTask(input: { title: string; description?: string; dueDate?: string | null; priority?: string; category?: string }) {
  const student = await getCurrentStudent();
  if (!student) return null;
  await ensureTaskSchema();
  const id = randomUUID();
  const client = db();
  try {
    await client.execute({ sql: `INSERT INTO "Task" (id, studentId, title, description, dueDate, priority, category) VALUES (?, ?, ?, ?, ?, ?, ?)`, args: [id, student.id, input.title.trim(), input.description?.trim() || null, input.dueDate || null, input.priority || "MEDIUM", input.category || "STUDY"] });
  } finally {
    client.close();
  }
  return id;
}

export async function updateTask(id: string, completed: boolean) {
  const student = await getCurrentStudent();
  if (!student) return false;
  await ensureTaskSchema();
  const client = db();
  try {
    await client.execute({ sql: `UPDATE "Task" SET completedAt = ?, updatedAt = CURRENT_TIMESTAMP WHERE id = ? AND studentId = ?`, args: [completed ? new Date().toISOString() : null, id, student.id] });
  } finally {
    client.close();
  }
  return true;
}
