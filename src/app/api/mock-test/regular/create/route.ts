import { NextRequest, NextResponse } from "next/server";
import { generateRegularMockTest } from "@/lib/diagnostic-questions";

export async function POST(req: NextRequest) {
  try {
    const { studentId } = await req.json();
    if (!studentId) {
      return NextResponse.json({ error: "studentId required" }, { status: 400 });
    }

    const test = await generateRegularMockTest(studentId);
    return NextResponse.json({ test });
  } catch (err) {
    console.error("mock-test/regular/create error:", err);
    return NextResponse.json({ error: "Failed to create regular test" }, { status: 500 });
  }
}
