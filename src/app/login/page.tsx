"use client";

import Link from "next/link";
import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";

export default function LoginPage() {
  const router = useRouter();
  const [mode, setMode] = useState<"login" | "register">("login");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  async function submit(event: FormEvent) {
    event.preventDefault();
    setBusy(true);
    setError("");
    try {
      const endpoint = mode === "login" ? "/api/auth/login" : "/api/auth/register";
      const response = await fetch(endpoint, {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ name, email, password }),
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error ?? "Something went wrong.");
      router.push("/dashboard");
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <main className="min-h-[85vh] flex items-center justify-center p-5">
      <section className="paper-card w-full max-w-md p-7 sm:p-9">
        <p className="text-xs uppercase tracking-[0.25em] opacity-50">JEE 2028 • private study system</p>
        <h1 className="font-hand text-5xl font-bold mt-2">Lock in. 🫡</h1>
        <p className="opacity-65 mt-2">Your dashboard, progress, tests and study history stay attached to your account.</p>

        <div className="flex gap-2 mt-7 p-1 rounded-xl" style={{ background: "rgba(0,0,0,.06)" }}>
          <button type="button" onClick={() => setMode("login")} className={`flex-1 rounded-lg py-2 text-sm font-semibold ${mode === "login" ? "bg-white shadow-sm" : "opacity-60"}`}>Sign in</button>
          <button type="button" onClick={() => setMode("register")} className={`flex-1 rounded-lg py-2 text-sm font-semibold ${mode === "register" ? "bg-white shadow-sm" : "opacity-60"}`}>Create account</button>
        </div>

        <form onSubmit={submit} className="space-y-4 mt-6">
          {mode === "register" && <label className="block"><span className="text-sm font-semibold">Name</span><input value={name} onChange={(e) => setName(e.target.value)} required className="mt-1 w-full rounded-xl border p-3 bg-white/70" placeholder="Arnav" /></label>}
          <label className="block"><span className="text-sm font-semibold">Email</span><input type="email" value={email} onChange={(e) => setEmail(e.target.value)} required className="mt-1 w-full rounded-xl border p-3 bg-white/70" placeholder="you@example.com" autoComplete="email" /></label>
          <label className="block"><span className="text-sm font-semibold">Password</span><input type="password" value={password} onChange={(e) => setPassword(e.target.value)} required minLength={8} className="mt-1 w-full rounded-xl border p-3 bg-white/70" placeholder="At least 8 characters" autoComplete={mode === "login" ? "current-password" : "new-password"} /></label>
          {error && <p className="text-sm font-semibold" style={{ color: "#b42318" }}>{error}</p>}
          <button disabled={busy} className="sticky-button w-full disabled:opacity-50">{busy ? "Working…" : mode === "login" ? "Enter dashboard →" : "Create my study account →"}</button>
        </form>
        <Link href="/" className="block text-center text-xs opacity-55 mt-6 hover:opacity-100">← Back to home</Link>
      </section>
    </main>
  );
}
