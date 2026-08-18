import { NextRequest, NextResponse } from "next/server";

const NVIDIA_API_URL = "https://integrate.api.nvidia.com/v1/chat/completions";
const DEFAULT_MODEL = "nvidia/llama-3.3-nemotron-super-49b-v1";
const ALLOWED_MODELS = new Set([
  DEFAULT_MODEL,
  "meta/llama-3.1-405b-instruct",
  "meta/llama-3.1-70b-instruct",
  "meta/llama-3.1-8b-instruct",
  "mistralai/mistral-7b-instruct",
  "deepseek-ai/deepseek-r1",
]);

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const requestedModel = typeof body.model === "string" ? body.model : DEFAULT_MODEL;
    const model = ALLOWED_MODELS.has(requestedModel) ? requestedModel : DEFAULT_MODEL;
    const messages = Array.isArray(body.messages) ? body.messages : [];
    const apiKey = process.env.NVIDIA_API_KEY || body.apiKey;

    if (!apiKey) return NextResponse.json({ error: "AI provider is not configured. Add NVIDIA_API_KEY in Vercel or set your personal NIM key in Settings." }, { status: 503 });
    if (!messages.length) return NextResponse.json({ error: "At least one message is required." }, { status: 400 });
    if (messages.length > 30) return NextResponse.json({ error: "Conversation is too long. Start a fresh chat or clear older messages." }, { status: 413 });

    const safeMessages = messages.map((message: unknown) => {
      const item = message as { role?: unknown; content?: unknown };
      const role = item.role === "system" || item.role === "assistant" || item.role === "user" ? item.role : "user";
      const content = typeof item.content === "string" ? item.content.slice(0, 16000) : "";
      return { role, content };
    }).filter((message: { content: string }) => message.content.trim().length > 0);

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
