import { NextResponse } from "next/server";
import { getPersonalAccess } from "@/lib/personal-access";

export async function GET() {
  return NextResponse.json(await getPersonalAccess());
}
