import { createHmac, timingSafeEqual } from "node:crypto";
import { cookies } from "next/headers";

export const PERSONAL_OWNER_COOKIE = "personal_timetable_owner";
export const PERSONAL_GUEST_COOKIE = "personal_timetable_guest";
const OWNER_TTL_MS = 30 * 24 * 60 * 60 * 1000;

function passwordSecret() {
  const value = process.env.PERSONAL_TIMETABLE_PASSWORD;
  if (!value) throw new Error("PERSONAL_TIMETABLE_PASSWORD is not configured.");
  return value;
}

function sign(value: string) {
  return createHmac("sha256", passwordSecret()).update(value).digest("base64url");
}

export function createOwnerToken() {
  const issuedAt = String(Date.now());
  return `${issuedAt}.${sign(issuedAt)}`;
}

export function verifyOwnerToken(token: string | undefined | null) {
  if (!token) return false;
  const [issuedAt, signature] = token.split(".");
  if (!issuedAt || !signature) return false;
  const timestamp = Number(issuedAt);
  if (!Number.isFinite(timestamp) || Date.now() - timestamp > OWNER_TTL_MS) return false;
  const expected = Buffer.from(sign(issuedAt));
  const actual = Buffer.from(signature);
  return expected.length === actual.length && timingSafeEqual(expected, actual);
}

export async function verifyOwnerPassword(password: string) {
  const expected = Buffer.from(passwordSecret());
  const actual = Buffer.from(password);
  return expected.length === actual.length && timingSafeEqual(expected, actual);
}

export async function getPersonalAccess() {
  const cookieStore = await cookies();
  const owner = verifyOwnerToken(cookieStore.get(PERSONAL_OWNER_COOKIE)?.value);
  const guest = cookieStore.get(PERSONAL_GUEST_COOKIE)?.value === "1";
  return { owner, guest, allowed: owner || guest };
}
