export function NeedsReviewBadge() {
  return (
    <span
      className="inline-flex items-center gap-1 px-2 py-0.5 text-xs font-bold uppercase tracking-wide rounded"
      style={{ backgroundColor: "var(--accent-red)", color: "white" }}
    >
      Unreviewed — verify against a textbook
    </span>
  );
}
