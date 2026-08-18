export type ContentSource = {
  id: string;
  name: string;
  kind: "OFFICIAL" | "TEXTBOOK" | "REFERENCE" | "PRACTICE";
  authority: "PRIMARY" | "SECONDARY";
  usage: "QUESTION_CORPUS" | "REFERENCE_ONLY" | "CURATION";
  url: string;
};

export const CONTENT_SOURCES: ContentSource[] = [
  { id: "nta-jee-main", name: "NTA JEE Main", kind: "OFFICIAL", authority: "PRIMARY", usage: "QUESTION_CORPUS", url: "https://jeemain.nta.nic.in/" },
  { id: "jee-advanced", name: "JEE Advanced", kind: "OFFICIAL", authority: "PRIMARY", usage: "QUESTION_CORPUS", url: "https://jeeadv.ac.in/" },
  { id: "ncert", name: "NCERT", kind: "OFFICIAL", authority: "PRIMARY", usage: "REFERENCE_ONLY", url: "https://ncert.nic.in/" },
  { id: "hc-verma", name: "H.C. Verma", kind: "TEXTBOOK", authority: "SECONDARY", usage: "REFERENCE_ONLY", url: "https://www.concepts-of-physics.com/" },
  { id: "arihant", name: "Arihant JEE series", kind: "REFERENCE", authority: "SECONDARY", usage: "REFERENCE_ONLY", url: "https://arihantbooks.com/" },
  { id: "target", name: "Target Publications", kind: "REFERENCE", authority: "SECONDARY", usage: "REFERENCE_ONLY", url: "https://targetpublications.org/" },
];

export function getContentSource(id: string) {
  return CONTENT_SOURCES.find((source) => source.id === id) ?? null;
}
