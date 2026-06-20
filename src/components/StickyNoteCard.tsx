"use client";

import { type ReactNode } from "react";
import { deterministicRotation } from "@/lib/rotation";

type CardColor = "yellow" | "blue" | "pink" | "green";

const colorMap: Record<CardColor, string> = {
  yellow: "var(--sticky-yellow)",
  blue: "var(--sticky-blue)",
  pink: "var(--sticky-pink)",
  green: "var(--sticky-green)",
};

export function StickyNoteCard({
  color = "yellow",
  children,
  className = "",
  seed,
}: {
  color?: CardColor;
  children: ReactNode;
  className?: string;
  seed?: string;
}) {
  // Deterministic rotation so server and client render identically (no
  // hydration mismatch) and no setState-in-effect is needed.
  const rotation = deterministicRotation(seed ?? color, 4);

  return (
    <div
      className={`p-5 transition-all duration-200 hover:-translate-y-0.5 ${className}`}
      style={{
        backgroundColor: colorMap[color],
        transform: `rotate(${rotation}deg)`,
        borderRadius: "4px",
        boxShadow: "5px 5px 0 rgba(0,0,0,0.25)",
        border: "1px solid rgba(0,0,0,0.08)",
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.transform = "rotate(0deg)";
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.transform = `rotate(${rotation}deg)`;
      }}
    >
      {children}
    </div>
  );
}
