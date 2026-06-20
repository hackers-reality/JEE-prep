import { NextRequest, NextResponse } from "next/server";

// This route proxies AI chat requests to NVIDIA NIM.
// The apiKey is received in-memory per-request, forwarded to NVIDIA,
// and discarded immediately. It is NOT logged, persisted to DB, or
// written to disk at any point.

const NVIDIA_API_URL = "https://integrate.api.nvidia.com/v1/chat/completions";

export async function POST(req: NextRequest) {
  try {
    const { apiKey, model, messages } = await req.json();
    if (!apiKey) {
      return NextResponse.json({ error: "API key required" }, { status: 400 });
    }

    const res = await fetch(NVIDIA_API_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: model || "nvidia/llama-3.3-nemotron-super-49b-v1",
        messages,
        temperature: 0.3,
        max_tokens: 2048,
      }),
    });

    if (!res.ok) {
      const text = await res.text();
      return NextResponse.json(
        { error: `NVIDIA API error ${res.status}: ${text}` },
        { status: res.status }
      );
    }

    const data = await res.json();
    return NextResponse.json(data);
  } catch (err) {
    console.error("Chat proxy error:", err);
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Failed to reach AI service" },
      { status: 500 }
    );
  }
}
