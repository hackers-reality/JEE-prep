import { NextResponse } from "next/server";
import { createHmac, timingSafeEqual } from "node:crypto";
import { cookies } from "next/headers";

const OWNER_COOKIE = "personal_owner";
const GUEST_COOKIE = "personal_guest";
const TTL_MS = 30 * 24 * 60 * 60 * 1000;

function configuredPassword() {
  const value = process.env.PERSONAL_TIMETABLE_PASSWORD;
  if (!value) throw new Error("PERSONAL_TIMETABLE_PASSWORD is not configured.");
  return value;
}

function sign(timestamp: string) {
  return createHmac("sha256", configuredPassword()).update(timestamp).digest("base64url");
}

function validOwnerToken(token: string | undefined) {
  if (!token) return false;
  const [timestamp, signature] = token.split(".");
  if (!timestamp || !signature) return false;
  const issued = Number(timestamp);
  if (!Number.isFinite(issued) || Date.now() - issued > TTL_MS) return false;
  const expected = Buffer.from(sign(timestamp));
  const actual = Buffer.from(signature);
  return expected.length === actual.length && timingSafeEqual(expected, actual);
}

function ownerToken() {
  const timestamp = String(Date.now());
  return `${timestamp}.${sign(timestamp)}`;
}

export async function GET() {
  const store = await cookies();
  return NextResponse.json({ owner: validOwnerToken(store.get(OWNER_COOKIE)?.value), guest: store.get(GUEST_COOKIE)?.value === "1" });
}

export async function POST(request: Request) {
  const body = await request.json().catch(() => ({})) as { mode?: string; password?: string };
  const store = await cookies();
  if (body.mode === "guest") {
    store.set(GUEST_COOKIE, "1", { httpOnly: true, sameSite: "lax", secure: true, path: "/", maxAge: 60 * 60 * 24 * 30 });
    store.delete(OWNER_COOKIE);
    return NextResponse.json({ ok: true, mode: "guest" });
  }
  if (body.mode === "logout") {
    store.delete(OWNER_COOKIE);
    store.delete(GUEST_COOKIE);
    return NextResponse.json({ ok: true, mode: "logged_out" });
  }
  if (body.mode !== "owner" || typeof body.password !== "string") return NextResponse.json({ error: "Invalid request." }, { status: 400 });
  const expected = Buffer.from(configuredPassword());
  const actual = Buffer.from(body.password);
  if (expected.length !== actual.length || !timingSafeEqual(expected, actual)) return NextResponse.json({ error: "Incorrect password." }, { status: 401 });
  store.set(OWNER_COOKIE, ownerToken(), { httpOnly: true, sameSite: "lax", secure: true, path: "/", maxAge: TTL_MS / 1000 });
  store.delete(GUEST_COOKIE);
  return NextResponse.json({ ok: true, mode: "owner" });
}
