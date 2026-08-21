"use client";

import { FormEvent, useEffect, useState } from "react";

export default function AccessGate() {
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);
  const [hasAccess, setHasAccess] = useState(false);

  async function refresh() {
    const response = await fetch("/api/personal-timetable/access", { cache: "no-store" });
    const data = await response.json();
    setHasAccess(Boolean(data.owner || data.guest));
    setLoading(false);
  }

  useEffect(() => { void refresh(); }, []);

  async function ownerLogin(event: FormEvent) {
    event.preventDefault();
    setError("");
    const response = await fetch("/api/personal-timetable/access", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ mode: "owner", password }) });
    const data = await response.json();
    if (!response.ok) { setError(data.error ?? "Access denied."); return; }
    setPassword("");
    setHasAccess(true);
    window.location.reload();
  }

  async function guest() {
    await fetch("/api/personal-timetable/access", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ mode: "guest" }) });
    setHasAccess(true);
    window.location.reload();
  }

  if (loading || hasAccess) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/90 p-6 text-white">
      <div className="w-full max-w-md rounded-3xl border border-white/10 bg-[#101015] p-7 shadow-2xl">
        <div className="mb-6">
          <p className="text-xs uppercase tracking-[0.25em] text-white/45">JEE 2028</p>
          <h1 className="mt-2 text-2xl font-semibold">Personal Timetable</h1>
          <p className="mt-2 text-sm text-white/55">Owner access is required to edit. Guests can view progress only.</p>
        </div>
        <form onSubmit={ownerLogin} className="space-y-3">
          <input aria-label="Owner password" type="password" value={password} onChange={(event) => setPassword(event.target.value)} placeholder="Owner password" className="w-full rounded-2xl border border-white/10 bg-white/5 px-4 py-3 outline-none focus:border-white/30" />
          {error && <p className="text-sm text-red-300">{error}</p>}
          <button type="submit" className="w-full rounded-2xl bg-white px-4 py-3 font-medium text-black">Owner access</button>
        </form>
        <button type="button" onClick={guest} className="mt-3 w-full rounded-2xl border border-white/10 px-4 py-3 text-sm text-white/75 hover:bg-white/5">Continue as guest — view only</button>
      </div>
    </div>
  );
}
