import { NextRequest, NextResponse } from "next/server";
import { generateDiagnosticTest } from "@/lib/diagnostic-questions";

export async function POST(req: NextRequest) {
  try {
    const { studentId } = await req.json();
    if (!studentId) {
      return NextResponse.json({ error: "studentId required" }, { status: 400 });
    }

    const tests = await Promise.all([
      generateDiagnosticTest(studentId, 0),
      generateDiagnosticTest(studentId, 1),
      generateDiagnosticTest(studentId, 2),
    ]);

    return NextResponse.json({ tests });
  } catch (err) {
    console.error("mock-test/create error:", err);
    return NextResponse.json({ error: "Failed to create tests" }, { status: 500 });
  }
}
