import { createClient } from "@libsql/client";
import { getCurrentStudent } from "@/lib/auth";

function db() {
  const url = process.env.TURSO_DATABASE_URL ?? process.env.DATABASE_URL ?? "file:./prisma/dev.db";
  const authToken = process.env.TURSO_AUTH_TOKEN;
  return createClient({ url, ...(authToken ? { authToken } : {}) });
}

export async function ensureAIConversationSchema() {
  const client = db();
  try {
    await client.execute(`CREATE TABLE IF NOT EXISTS "AIConversation" ("id" TEXT NOT NULL PRIMARY KEY, "studentId" TEXT NOT NULL, "title" TEXT NOT NULL DEFAULT 'New JEE Tutor Chat', "topicId" TEXT, "model" TEXT NOT NULL, "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP, "updatedAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP, FOREIGN KEY ("studentId") REFERENCES "Student"("id") ON DELETE CASCADE)`);
    await client.execute(`CREATE TABLE IF NOT EXISTS "AIMessage" ("id" TEXT NOT NULL PRIMARY KEY, "conversationId" TEXT NOT NULL, "role" TEXT NOT NULL, "content" TEXT NOT NULL, "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP, FOREIGN KEY ("conversationId") REFERENCES "AIConversation"("id") ON DELETE CASCADE)`);
    await client.execute(`CREATE INDEX IF NOT EXISTS "AIConversation_student_updated_idx" ON "AIConversation"("studentId", "updatedAt")`);
    await client.execute(`CREATE INDEX IF NOT EXISTS "AIMessage_conversation_created_idx" ON "AIMessage"("conversationId", "createdAt")`);
  } finally { client.close(); }
}

export async function currentStudentId() {
  const student = await getCurrentStudent();
  return student?.id ?? null;
}

export function newId() { return crypto.randomUUID(); }
