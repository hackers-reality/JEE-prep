"use client";

import { useEffect, useMemo, useState } from "react";

type Visibility = "private" | "parent_teacher" | "anyone_with_link";

type OwnerResponse = {
  payload?: unknown;
  shareToken?: string | null;
  visibility?: Visibility;
  shareExpiresAt?: string | null;
  shareRevokedAt?: string | null;
};

const labels: Record<Visibility, { title: string; desc: string }> = {
  private: { title: "Private", desc: "Only you can open the timetable. Existing share links are revoked." },
  parent_teacher: { title: "Parent / Teacher link", desc: "Read-only access for people you give the link to. The link itself is the permission." },
  anyone_with_link: { title: "Anyone with the link", desc: "Read-only access for anyone who has the link. No login is required." },
};

export default function TimetableVisibilityPage() {
  const [visibility, setVisibility] = useState<Visibility>("private");
  const [shareToken, setShareToken] = useState<string | null>(null);
  const [expiresAt, setExpiresAt] = useState("");
  const [revoked, setRevoked] = useState(false);
  const [status, setStatus] = useState("Loading…");
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    fetch("/api/personal-timetable")
      .then((r) => r.ok ? r.json() : Promise.reject(new Error("Sign in required.")))
      .then((data: OwnerResponse) => {
        setVisibility(data.visibility ?? "private");
        setShareToken(data.shareToken ?? null);
        setExpiresAt(data.shareExpiresAt ? data.shareExpiresAt.slice(0, 10) : "");
        setRevoked(Boolean(data.shareRevokedAt));
        setStatus("Ready");
      })
      .catch((error: Error) => setStatus(error.message));
  }, []);

  const shareUrl = useMemo(() => {
    if (!shareToken || visibility === "private") return "";
    if (typeof window === "undefined") return "";
    return `${window.location.origin}/personal-timetable?share=${encodeURIComponent(shareToken)}`;
  }, [shareToken, visibility]);

  async function save(nextVisibility = visibility, rotate = false) {
    setBusy(true);
    setStatus("Saving…");
    try {
      const response = await fetch("/api/personal-timetable", {
        method: rotate ? "POST" : "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(rotate
          ? { visibility: nextVisibility, expiresAt: expiresAt ? new Date(`${expiresAt}T23:59:59.999Z`).toISOString() : null, rotate: true }
          : { visibility: nextVisibility, shareExpiresAt: expiresAt ? new Date(`${expiresAt}T23:59:59.999Z`).toISOString() : null, revokeShare: nextVisibility === "private" }),
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error ?? "Could not save visibility.");
      setVisibility(data.visibility ?? nextVisibility);
      setShareToken(data.shareToken ?? shareToken);
      setRevoked(Boolean(data.shareRevokedAt));
      setStatus("Saved ✓");
    } catch (error) {
      setStatus(error instanceof Error ? error.message : "Could not save.");
    } finally {
      setBusy(false);
    }
  }

  async function copyLink() {
    if (!shareUrl) return;
    await navigator.clipboard.writeText(shareUrl);
    setStatus("Link copied ✓");
  }

  return <main className="min-h-screen bg-[#0B0D12] text-[#E7E9EE]">
    <div className="mx-auto max-w-[760px] px-4 pb-20 pt-8 sm:px-6">
      <a href="/personal-timetable" className="text-[12px] text-[#8B92A5] hover:text-[#E7E9EE]">← Back to timetable</a>
      <section className="mt-5 rounded-2xl border border-[#232838] bg-[#12151C] p-5 sm:p-6">
        <div className="mb-6">
          <div className="text-[25px] font-bold">Timetable visibility</div>
          <p className="mt-1 text-[12px] text-[#8B92A5]">Control who can see your JEE preparation dashboard. Viewer access is always read-only.</p>
        </div>

        <div className="space-y-2">
          {(Object.keys(labels) as Visibility[]).map((key) => {
            const selected = visibility === key;
            return <button key={key} disabled={busy} onClick={() => setVisibility(key)} className={`w-full rounded-xl border p-4 text-left transition ${selected ? "border-[#3DDCFF] bg-[#3DDCFF]/5" : "border-[#232838] bg-[#171B24] hover:border-[#343B4D]"}`}>
              <div className="flex items-start gap-3">
                <div className={`mt-0.5 h-4 w-4 rounded-full border ${selected ? "border-[#3DDCFF] bg-[#3DDCFF]" : "border-[#565D70]"}`} />
                <div><div className="text-[13px] font-semibold">{labels[key].title}</div><div className="mt-1 text-[11px] text-[#8B92A5]">{labels[key].desc}</div></div>
              </div>
            </button>;
          })}
        </div>

        <div className="mt-5 rounded-xl border border-[#232838] bg-[#171B24] p-4">
          <label className="text-[10px] uppercase tracking-wider text-[#565D70]">Optional link expiry</label>
          <input type="date" value={expiresAt} onChange={(e) => setExpiresAt(e.target.value)} disabled={busy || visibility === "private"} className="mt-2 w-full rounded-lg border border-[#232838] bg-[#0B0D12] px-3 py-2 text-sm disabled:opacity-40" />
          <div className="mt-2 text-[10px] text-[#565D70]">Leave blank for no expiry. This only affects the share link.</div>
        </div>

        <div className="mt-5 flex flex-wrap gap-2">
          <button disabled={busy} onClick={() => void save()} className="rounded-lg bg-[#3DDCFF] px-5 py-2.5 text-sm font-semibold text-[#031014]">Save visibility</button>
          {visibility !== "private" && <button disabled={busy} onClick={() => void save(visibility, true)} className="rounded-lg border border-[#232838] bg-[#171B24] px-4 py-2.5 text-sm text-[#8B92A5]">Rotate link</button>}
        </div>

        {shareUrl && <div className="mt-5 rounded-xl border border-[#232838] bg-[#0B0D12] p-4">
          <div className="text-[10px] uppercase tracking-wider text-[#565D70]">Read-only share link</div>
          <div className="mt-2 break-all font-mono text-[11px] text-[#8B92A5]">{shareUrl}</div>
          <div className="mt-3 flex flex-wrap gap-2">
            <button onClick={() => void copyLink()} className="rounded-lg bg-[#171B24] px-4 py-2 text-xs font-semibold">Copy link</button>
            <a href={shareUrl} target="_blank" rel="noreferrer" className="rounded-lg border border-[#232838] px-4 py-2 text-xs text-[#8B92A5]">Open viewer</a>
          </div>
        </div>}

        {revoked && visibility !== "private" && <div className="mt-4 text-[11px] text-[#FFB454]">The previous share link was revoked. Save visibility or rotate the link to issue an active link.</div>}
        <div className="mt-4 text-[11px] text-[#565D70]">{status}</div>
      </section>
    </div>
  </main>;
}
