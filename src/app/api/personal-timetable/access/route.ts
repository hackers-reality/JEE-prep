import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { createOwnerToken, PERSONAL_GUEST_COOKIE, PERSONAL_OWNER_COOKIE, verifyOwnerPassword } from "@/lib/personal-access";

export async function POST(request: Request) {
  const body = await request.json().catch(() => ({})) as { mode?: unknown; password?: unknown };
  const mode = body.mode === "owner" ? "owner" : body.mode === "guest" ? "guest" : null;
  const cookieStore = await cookies();

  if (mode === "guest") {
    cookieStore.set(PERSONAL_GUEST_COOKIE, "1", {
      httpOnly: true,
      sameSite: "lax",
      secure: process.env.NODE_ENV === "production",
      path: "/personal-timetable",
      maxAge: 60 * 60 * 24,
    });
    cookieStore.delete(PERSONAL_OWNER_COOKIE);
    return NextResponse.json({ ok: true, mode: "guest" });
  }

  if (mode !== "owner" || typeof body.password !== "string" || !(await verifyOwnerPassword(body.password))) {
    return NextResponse.json({ error: "Invalid password." }, { status: 401 });
  }

  cookieStore.set(PERSONAL_OWNER_COOKIE, createOwnerToken(), {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/personal-timetable",
    maxAge: 60 * 60 * 24 * 30,
  });
  cookieStore.delete(PERSONAL_GUEST_COOKIE);
  return NextResponse.json({ ok: true, mode: "owner" });
}

export async function DELETE() {
  const cookieStore = await cookies();
  cookieStore.delete(PERSONAL_OWNER_COOKIE);
  cookieStore.delete(PERSONAL_GUEST_COOKIE);
  return NextResponse.json({ ok: true });
}
