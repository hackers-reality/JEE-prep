import type { ReactNode } from "react";
import { StickyNoteCard } from "./StickyNoteCard";
import type { ComponentProps } from "react";

type CardColor = ComponentProps<typeof StickyNoteCard>["color"];

export function TheoryCard({ children }: { children: ReactNode }) {
  return (
    <StickyNoteCard color="yellow">
      <h3
        className="font-hand text-lg font-bold mb-2"
        style={{ color: "var(--ink)" }}
      >
        Theory
      </h3>
      <div className="text-sm leading-relaxed whitespace-pre-wrap font-body">
        {children}
      </div>
    </StickyNoteCard>
  );
}

export function FormulaCard({ children }: { children: ReactNode }) {
  return (
    <StickyNoteCard color="blue">
      <h3
        className="font-hand text-lg font-bold mb-2"
        style={{ color: "var(--ink)" }}
      >
        Formula
      </h3>
      <div className="text-sm leading-relaxed whitespace-pre-wrap font-body">
        {children}
      </div>
    </StickyNoteCard>
  );
}

export function MistakeCard({ children }: { children: ReactNode }) {
  return (
    <StickyNoteCard color="pink">
      <h3
        className="font-hand text-lg font-bold mb-2"
        style={{ color: "var(--ink)" }}
      >
        Common Mistake
      </h3>
      <div className="text-sm leading-relaxed whitespace-pre-wrap font-body">
        {children}
      </div>
    </StickyNoteCard>
  );
}

export function ExampleCard({
  children,
  difficulty,
}: {
  children: ReactNode;
  difficulty: string;
}) {
  return (
    <StickyNoteCard color="green">
      <div className="flex items-start justify-between mb-2">
        <h3
          className="font-hand text-lg font-bold"
          style={{ color: "var(--ink)" }}
        >
          Solved Example
        </h3>
        <span className="text-xs px-2 py-0.5 rounded bg-white/50 font-semibold">
          {difficulty}
        </span>
      </div>
      <div className="text-sm leading-relaxed whitespace-pre-wrap font-body">
        {children}
      </div>
    </StickyNoteCard>
  );
}
