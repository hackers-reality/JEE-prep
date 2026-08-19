import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@libsql/client";
import { ensureAIConversationSchema, currentStudentId, newId } from "@/lib/ai-conversations";

function db() {
  const url = process.env.TURSO_DATABASE_URL ?? process.env.DATABASE_URL ?? "file:./prisma/dev.db";
  const authToken = process.env.TURSO_AUTH_TOKEN;
  return createClient({ url, ...(authToken ? { authToken } : {}) });
}

export async function GET() {
  await ensureAIConversationSchema();
  const studentId = await currentStudentId();
  if (!studentId) return NextResponse.json({ error: "Sign in required." }, { status: 401 });
  const client = db();
  try {
    const result = await client.execute({ sql: `SELECT id, title, topicId, model, createdAt, updatedAt FROM "AIConversation" WHERE studentId = ? ORDER BY updatedAt DESC`, args: [studentId] });
    return NextResponse.json({ conversations: result.rows });
  } finally { client.close(); }
}

export async function POST(req: NextRequest) {
  await ensureAIConversationSchema();
  const studentId = await currentStudentId();
  if (!studentId) return NextResponse.json({ error: "Sign in required." }, { status: 401 });
  const body = await req.json().catch(() => ({}));
  const title = typeof body.title === "string" && body.title.trim() ? body.title.trim().slice(0, 120) : "New JEE Tutor Chat";
  const topicId = typeof body.topicId === "string" ? body.topicId : null;
  const model = typeof body.model === "string" ? body.model : "nvidia/llama-3.3-nemotron-super-49b-v1";
  const id = newId();
  const client = db();
  try {
    await client.execute({ sql: `INSERT INTO "AIConversation" (id, studentId, title, topicId, model) VALUES (?, ?, ?, ?, ?)`, args: [id, studentId, title, topicId, model] });
    return NextResponse.json({ conversation: { id, title, topicId, model } }, { status: 201 });
  } finally { client.close(); }
}
