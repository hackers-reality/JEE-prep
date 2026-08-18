import { NextRequest, NextResponse } from "next/server";

const NVIDIA_API_URL = "https://integrate.api.nvidia.com/v1/chat/completions";
const DEFAULT_MODEL = "nvidia/llama-3.3-nemotron-super-49b-v1";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const model = typeof body.model === "string" ? body.model : DEFAULT_MODEL;
    const messages = Array.isArray(body.messages) ? body.messages : [];
    const apiKey = process.env.NVIDIA_API_KEY || body.apiKey;

    if (!apiKey) {
      return NextResponse.json({ error: "AI provider is not configured. Add NVIDIA_API_KEY or set your personal NIM key in Settings." }, { status: 503 });
    }
    if (!messages.length) return NextResponse.json({ error: "At least one message is required." }, { status: 400 });

    const res = await fetch(NVIDIA_API_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json", Authorization: `Bearer ${apiKey}` },
      body: JSON.stringify({
        model,
        messages,
        temperature: 0.2,
        max_tokens: 4096,
        stream: true,
      }),
    });

    if (!res.ok || !res.body) {
      const text = await res.text();
      return NextResponse.json({ error: `NVIDIA API error ${res.status}: ${text}` }, { status: res.status || 502 });
    }

    return new Response(res.body, {
      status: 200,
      headers: {
        "Content-Type": "text/event-stream; charset=utf-8",
        "Cache-Control": "no-cache, no-transform",
        Connection: "keep-alive",
        "X-Accel-Buffering": "no",
      },
    });
  } catch (err) {
    console.error("Chat proxy error:", err);
    return NextResponse.json({ error: err instanceof Error ? err.message : "Failed to reach AI service" }, { status: 500 });
  }
}
