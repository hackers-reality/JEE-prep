import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import {
  createOwnerToken,
  PERSONAL_GUEST_COOKIE,
  PERSONAL_OWNER_COOKIE,
  verifyOwnerPassword,
} from "@/lib/personal-access";

export async function GET() {
  const cookieStore = await cookies();
  const guest = cookieStore.get(PERSONAL_GUEST_COOKIE)?.value === "1";
  const ownerToken = cookieStore.get(PERSONAL_OWNER_COOKIE)?.value;

  // Keep the UI access check on the exact same cookie/token implementation
  // used by the timetable API and server layout.
  const { verifyOwnerToken } = await import("@/lib/personal-access");
  const owner = verifyOwnerToken(ownerToken);
  return NextResponse.json({ owner, guest });
}

export async function POST(request: Request) {
  const body = await request.json().catch(() => ({})) as {
    mode?: unknown;
    password?: unknown;
  };
  const cookieStore = await cookies();

  if (body.mode === "guest") {
    cookieStore.set(PERSONAL_GUEST_COOKIE, "1", {
      httpOnly: true,
      sameSite: "lax",
      secure: process.env.NODE_ENV === "production",
      path: "/",
      maxAge: 60 * 60 * 24 * 30,
    });
    cookieStore.delete(PERSONAL_OWNER_COOKIE);
    return NextResponse.json({ ok: true, mode: "guest" });
  }

  if (body.mode === "logout") {
    cookieStore.delete(PERSONAL_OWNER_COOKIE);
    cookieStore.delete(PERSONAL_GUEST_COOKIE);
    return NextResponse.json({ ok: true, mode: "logged_out" });
  }

  if (body.mode !== "owner" || typeof body.password !== "string") {
    return NextResponse.json({ error: "Invalid request." }, { status: 400 });
  }

  if (!(await verifyOwnerPassword(body.password))) {
    return NextResponse.json({ error: "Incorrect password." }, { status: 401 });
  }

  cookieStore.set(PERSONAL_OWNER_COOKIE, createOwnerToken(), {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: 60 * 60 * 24 * 30,
  });
  cookieStore.delete(PERSONAL_GUEST_COOKIE);
  return NextResponse.json({ ok: true, mode: "owner" });
}
