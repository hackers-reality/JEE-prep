import { NextResponse } from "next/server";
import { checkAndSeed, isSeeding, isSeedComplete } from "@/lib/auto-seed";

export async function GET() {
  if (isSeedComplete()) {
    return NextResponse.json({ status: "done" });
  }

  if (isSeeding()) {
    return NextResponse.json({ status: "seeding" });
  }

  const success = await checkAndSeed();
  if (success) {
    return NextResponse.json({ status: "done" });
  }
  return NextResponse.json({ status: "failed" }, { status: 500 });
}
