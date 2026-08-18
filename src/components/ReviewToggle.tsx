"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function ReviewToggle({ topicId, initialNeedsReview }: { topicId: string; initialNeedsReview: boolean }) {
  const router = useRouter();
  const [needsReview, setNeedsReview] = useState(initialNeedsReview);
  const [busy, setBusy] = useState(false);

  async function toggle() {
    setBusy(true);
    try {
      const reviewed = needsReview;
      const response = await fetch(`/api/topics/${topicId}/review`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ reviewed }),
      });
      if (!response.ok) throw new Error("Unable to update review state");
      setNeedsReview(!reviewed);
      router.refresh();
    } catch {
      // Keep the UI state unchanged if the request fails.
    } finally {
      setBusy(false);
    }
  }

  return (
    <button
      onClick={toggle}
      disabled={busy}
      className="mt-4 px-4 py-2 text-sm font-bold rounded-lg border hover:-translate-y-0.5 transition disabled:opacity-50"
      style={{ borderColor: "var(--grid-line)", background: needsReview ? "var(--sticky-yellow)" : "var(--sticky-green)" }}
    >
      {busy ? "Saving…" : needsReview ? "✓ Mark as reviewed" : "↺ Put back in revision"}
    </button>
  );
}
