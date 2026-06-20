"use client";

import { type ReactNode, useEffect, useState } from "react";

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
}: {
  color?: CardColor;
  children: ReactNode;
  className?: string;
}) {
  const [rotation, setRotation] = useState(0);
  useEffect(() => {
    setRotation((Math.random() - 0.5) * 4);
  }, []);

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
