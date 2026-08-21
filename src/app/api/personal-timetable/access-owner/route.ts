import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { createOwnerToken, PERSONAL_OWNER_COOKIE, verifyOwnerPassword } from "@/lib/personal-access";

export async function POST(request: Request) {
  const body = await request.json().catch(() => ({})) as { password?: unknown };
  if (typeof body.password !== "string" || !(await verifyOwnerPassword(body.password))) return NextResponse.json({ error: "Invalid password." }, { status: 401 });
  const cookieStore = await cookies();
  cookieStore.set(PERSONAL_OWNER_COOKIE, createOwnerToken(), { httpOnly: true, sameSite: "lax", secure: process.env.NODE_ENV === "production", path: "/personal-timetable", maxAge: 2592000 });
  return NextResponse.json({ ok: true, mode: "owner" });
}
