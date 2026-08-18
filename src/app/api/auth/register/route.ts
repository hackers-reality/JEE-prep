import { NextResponse } from "next/server";
import { registerAccount, SESSION_COOKIE } from "@/lib/auth";

export async function POST(request: Request) {
  try {
    const { name, email, password } = await request.json();
    const session = await registerAccount(String(name ?? ""), String(email ?? ""), String(password ?? ""));
    const response = NextResponse.json({ ok: true });
    response.cookies.set(SESSION_COOKIE, session.token, {
      httpOnly: true,
      sameSite: "lax",
      secure: process.env.NODE_ENV === "production",
      expires: session.expiresAt,
      path: "/",
    });
    return response;
  } catch (error) {
    return NextResponse.json({ error: error instanceof Error ? error.message : "Unable to create account." }, { status: 400 });
  }
}
