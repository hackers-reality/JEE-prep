import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@libsql/client";
import { ensureAIConversationSchema, currentStudentId, newId } from "@/lib/ai-conversations";

type MessagePart = { type: "text"; text: string } | { type: "image_url"; image_url: { url: string } };
type StoredContent = string | MessagePart[];

function db() {
  const url = process.env.TURSO_DATABASE_URL ?? process.env.DATABASE_URL ?? "file:./prisma/dev.db";
  const authToken = process.env.TURSO_AUTH_TOKEN;
  return createClient({ url, ...(authToken ? { authToken } : {}) });
}

function parseStoredContent(content: string): StoredContent {
  try {
    const parsed = JSON.parse(content);
    if (Array.isArray(parsed)) return parsed as MessagePart[];
  } catch {}
  return content;
}

function normalizeIncomingContent(content: unknown): StoredContent | null {
  if (typeof content === "string") return content.trim().slice(0, 16000) || null;
  if (!Array.isArray(content)) return null;
  const parts: MessagePart[] = [];
  for (const part of content.slice(0, 8)) {
    if (!part || typeof part !== "object") continue;
    const candidate = part as { type?: unknown; text?: unknown; image_url?: { url?: unknown } };
    if (candidate.type === "text" && typeof candidate.text === "string") {
      const text = candidate.text.slice(0, 16000).trim();
      if (text) parts.push({ type: "text", text });
    } else if (candidate.type === "image_url" && typeof candidate.image_url?.url === "string") {
      const url = candidate.image_url.url.trim();
      if (url.startsWith("data:image/") || /^https:\/\//.test(url)) parts.push({ type: "image_url", image_url: { url } });
    }
  }
  return parts.length ? parts : null;
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
    const messagesResult = await client.execute({ sql: `SELECT id, role, content, createdAt FROM "AIMessage" WHERE conversationId = ? ORDER BY createdAt ASC`, args: [conversationId] });
    const messages = messagesResult.rows.map((row) => ({ ...row, content: parseStoredContent(String(row.content)) }));
    return NextResponse.json({ conversation: conversation.rows[0], messages });
  } finally { client.close(); }
}

export async function POST(req: NextRequest, { params }: { params: Promise<{ conversationId: string }> }) {
  await ensureAIConversationSchema();
  const studentId = await currentStudentId();
  if (!studentId) return NextResponse.json({ error: "Sign in required." }, { status: 401 });
  const { conversationId } = await params;
  const body = await req.json().catch(() => ({}));
  const role = body.role === "assistant" ? "assistant" : body.role === "user" ? "user" : null;
  const content = normalizeIncomingContent(body.content);
  if (!role || !content) return NextResponse.json({ error: "Valid role and content are required." }, { status: 400 });
  const serialized = typeof content === "string" ? content : JSON.stringify(content);
  const client = db();
  try {
    const owned = await client.execute({ sql: `SELECT id FROM "AIConversation" WHERE id = ? AND studentId = ? LIMIT 1`, args: [conversationId, studentId] });
    if (!owned.rows.length) return NextResponse.json({ error: "Conversation not found." }, { status: 404 });
    const messageId = newId();
    await client.execute({ sql: `INSERT INTO "AIMessage" (id, conversationId, role, content) VALUES (?, ?, ?, ?)`, args: [messageId, conversationId, role, serialized] });
    await client.execute({ sql: `UPDATE "AIConversation" SET updatedAt = CURRENT_TIMESTAMP WHERE id = ?`, args: [conversationId] });
    return NextResponse.json({ message: { id: messageId, role, content } }, { status: 201 });
  } finally { client.close(); }
}
