export type ProblemSource = {
  id: string;
  label: string;
  kind: "official" | "reference" | "practice";
  priority: number;
  copyrightSafe: boolean;
  notes: string;
};

/**
 * Source registry used by the ingestion pipeline. We never copy textbook
 * content into the repository; this records provenance and tells ingestion
 * which sources can be safely used as canonical exam/reference metadata.
 */
export const PROBLEM_SOURCES: ProblemSource[] = [
  {
    id: "jee-main-nta",
    label: "JEE Main — NTA official papers/keys",
    kind: "official",
    priority: 100,
    copyrightSafe: true,
    notes: "Use official NTA question papers and final answer keys as the primary PYQ source.",
  },
  {
    id: "jee-advanced-iit",
    label: "JEE Advanced — official papers/keys",
    kind: "official",
    priority: 100,
    copyrightSafe: true,
    notes: "Use the official JEE Advanced archive for papers, answer keys and syllabus metadata.",
  },
  {
    id: "ncert",
    label: "NCERT",
    kind: "reference",
    priority: 90,
    copyrightSafe: false,
    notes: "Use for topic mapping and reference links; do not bulk-republish copyrighted textbook content.",
  },
  {
    id: "hc-verma",
    label: "H.C. Verma — Concepts of Physics",
    kind: "reference",
    priority: 80,
    copyrightSafe: false,
    notes: "Use as an external reference/source tag and for human curation; do not reproduce the book's problems wholesale.",
  },
  {
    id: "arihant-pyq",
    label: "Arihant JEE PYQ/reference series",
    kind: "reference",
    priority: 70,
    copyrightSafe: false,
    notes: "Reference/curation source only; official exam papers remain the canonical PYQ record.",
  },
  {
    id: "target-publications",
    label: "Target Publications / state-board references",
    kind: "reference",
    priority: 60,
    copyrightSafe: false,
    notes: "Useful for Maharashtra/state-board alignment and supplementary practice metadata.",
  },
];

export function getProblemSource(id: string) {
  return PROBLEM_SOURCES.find((source) => source.id === id) ?? null;
}
