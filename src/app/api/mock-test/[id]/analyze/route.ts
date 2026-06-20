import { NextRequest, NextResponse } from "next/server";
import { computeTestResult } from "@/lib/diagnostic-questions";

export async function POST(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const result = await computeTestResult(id);
    return NextResponse.json(result);
  } catch (err) {
    console.error("mock-test/analyze error:", err);
    return NextResponse.json({ error: "Failed to analyze" }, { status: 500 });
  }
}
