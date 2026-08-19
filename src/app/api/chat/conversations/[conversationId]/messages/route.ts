import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@libsql/client";
import { ensureAIConversationSchema, currentStudentId, newId } from "@/lib/ai-conversations";

function db() {
  const url = process.env.TURSO_DATABASE_URL ?? process.env.DATABASE_URL ?? "file:./prisma/dev.db";
  const authToken = process.env.TURSO_AUTH_TOKEN;
  return createClient({ url, ...(authToken ? { authToken } : {}) });
}

export async function GET(_req: NextRequest, { params }: { params: Promise<{ conversationId: string }> }) {
  await ensureAIConversationSchema();
  const studentId = await currentStudentId();
  if (!studentId) return NextResponse.json({ error: "Sign in required." }, { status: 401 });
  const { conversationId } = await params;
  const client = db();
  try {
    const conversation = await client.execute({ sql: `SELECT id, title, topicId, model, createdAt, updatedAt FROM "AIConversation" WHERE id = ? AND studentId = ? LIMIT 1`, args: [conversationId, studentId] });
    if (!conversation.rows.length) return NextResponse.json({ error: "Conversation not found." }, { status: 404 });
    const messages = await client.execute({ sql: `SELECT id, role, content, createdAt FROM "AIMessage" WHERE conversationId = ? ORDER BY createdAt ASC`, args: [conversationId] });
    return NextResponse.json({ conversation: conversation.rows[0], messages: messages.rows });
  } finally { client.close(); }
}

export async function POST(req: NextRequest, { params }: { params: Promise<{ conversationId: string }> }) {
  await ensureAIConversationSchema();
  const studentId = await currentStudentId();
  if (!studentId) return NextResponse.json({ error: "Sign in required." }, { status: 401 });
  const { conversationId } = await params;
  const body = await req.json().catch(() => ({}));
  const role = body.role === "assistant" ? "assistant" : body.role === "user" ? "user" : null;
  const content = typeof body.content === "string" ? body.content.trim().slice(0, 16000) : "";
  if (!role || !content) return NextResponse.json({ error: "Valid role and content are required." }, { status: 400 });
  const client = db();
  try {
    const owned = await client.execute({ sql: `SELECT id FROM "AIConversation" WHERE id = ? AND studentId = ? LIMIT 1`, args: [conversationId, studentId] });
    if (!owned.rows.length) return NextResponse.json({ error: "Conversation not found." }, { status: 404 });
    const messageId = newId();
    await client.execute({ sql: `INSERT INTO "AIMessage" (id, conversationId, role, content) VALUES (?, ?, ?, ?)`, args: [messageId, conversationId, role, content] });
    await client.execute({ sql: `UPDATE "AIConversation" SET updatedAt = CURRENT_TIMESTAMP WHERE id = ?`, args: [conversationId] });
    return NextResponse.json({ message: { id: messageId, role, content } }, { status: 201 });
  } finally { client.close(); }
}
