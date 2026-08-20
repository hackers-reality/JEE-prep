import { NextRequest, NextResponse } from "next/server";
import { AI_MODELS, DEFAULT_AI_MODEL, isAllowedAIModel, modelSupports } from "@/lib/ai-models";

const NVIDIA_API_URL = "https://integrate.api.nvidia.com/v1/chat/completions";

type TextPart = { type: "text"; text: string };
type ImagePart = { type: "image_url"; image_url: { url: string } };
type MessageContent = string | Array<TextPart | ImagePart>;

function sanitizeContent(content: unknown): MessageContent | null {
  if (typeof content === "string") return content.slice(0, 16000).trim() || null;
  if (!Array.isArray(content)) return null;

  const parts: Array<TextPart | ImagePart> = [];
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

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const requestedModel = typeof body.model === "string" ? body.model : DEFAULT_AI_MODEL;
    const model = isAllowedAIModel(requestedModel) ? requestedModel : DEFAULT_AI_MODEL;
    const messages = Array.isArray(body.messages) ? body.messages : [];
    const apiKey = typeof body.apiKey === "string" ? body.apiKey.trim() : "";

    if (!apiKey) return NextResponse.json({ error: "Add your NVIDIA API key in Settings to use the JEE Tutor." }, { status: 401 });
    if (!messages.length) return NextResponse.json({ error: "At least one message is required." }, { status: 400 });
    if (messages.length > 30) return NextResponse.json({ error: "Conversation is too long. Start a fresh chat." }, { status: 413 });

    const safeMessages: Array<{ role: "user" | "assistant" | "system"; content: MessageContent }> = [];
    let hasImage = false;
    for (const message of messages) {
      const item = message as { role?: unknown; content?: unknown };
      const role = item.role === "assistant" || item.role === "system" || item.role === "user" ? item.role : "user";
      const content = sanitizeContent(item.content);
      if (!content) continue;
      if (Array.isArray(content)) hasImage ||= content.some((part) => part.type === "image_url");
      safeMessages.push({ role, content });
    }

    if (!safeMessages.length) return NextResponse.json({ error: "No usable message content." }, { status: 400 });
    if (hasImage && !modelSupports(model, "vision")) {
      return NextResponse.json({ error: "The selected model does not support image input. Choose a multimodal model such as Inkling, Kimi K2.6, MiniMax M3, or Nemotron Omni." }, { status: 400 });
    }

    const res = await fetch(NVIDIA_API_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json", Authorization: `Bearer ${apiKey}` },
      body: JSON.stringify({ model, messages: safeMessages, temperature: 0.2, max_tokens: 4096, stream: true }),
      cache: "no-store",
    });

    if (!res.ok || !res.body) {
      const text = await res.text();
      return NextResponse.json({ error: `AI provider error ${res.status}: ${text.slice(0, 1000)}` }, { status: res.status || 502 });
    }

    return new Response(res.body, { status: 200, headers: { "Content-Type": "text/event-stream; charset=utf-8", "Cache-Control": "no-cache, no-transform", Connection: "keep-alive", "X-Accel-Buffering": "no" } });
  } catch (err) {
    console.error("Chat proxy error:", err);
    return NextResponse.json({ error: err instanceof Error ? err.message : "Failed to reach AI service" }, { status: 500 });
  }
}

export async function GET() {
  return NextResponse.json({
    models: AI_MODELS.map(({ id, name, strengths, capabilities }) => ({ id, name, strengths, capabilities })),
  });
}
