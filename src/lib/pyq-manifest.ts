export type PYQSource = {
  exam: "JEE_MAIN" | "JEE_ADVANCED";
  year: number;
  paper: string;
  session?: string;
  shift?: string;
  sourceUrl: string;
  answerKeyUrl: string;
  authority: "OFFICIAL";
  verification: "FINAL_KEY_REQUIRED" | "VERIFIED_FINAL_KEY";
};

/** Canonical official-paper manifest; provenance stays separate from question rows. */
export const OFFICIAL_PYQ_MANIFEST: PYQSource[] = [
  { exam: "JEE_MAIN", year: 2026, paper: "Paper 1 (B.E./B.Tech.)", session: "Session 1", sourceUrl: "https://jeemain.nta.nic.in/admission-bulletin/", answerKeyUrl: "https://jeemain.nta.nic.in/documents/", authority: "OFFICIAL", verification: "FINAL_KEY_REQUIRED" },
  { exam: "JEE_MAIN", year: 2026, paper: "Paper 1 (B.E./B.Tech.)", session: "Session 2", sourceUrl: "https://jeemain.nta.nic.in/admission-bulletin/", answerKeyUrl: "https://jeemain.nta.nic.in/documents/", authority: "OFFICIAL", verification: "FINAL_KEY_REQUIRED" },
  { exam: "JEE_ADVANCED", year: 2026, paper: "Paper 1", sourceUrl: "https://jeeadv.ac.in/", answerKeyUrl: "https://jeeadv.ac.in/", authority: "OFFICIAL", verification: "FINAL_KEY_REQUIRED" },
  { exam: "JEE_ADVANCED", year: 2026, paper: "Paper 2", sourceUrl: "https://jeeadv.ac.in/", answerKeyUrl: "https://jeeadv.ac.in/", authority: "OFFICIAL", verification: "FINAL_KEY_REQUIRED" },
];

export function isOfficialFinalKeySource(source: PYQSource) {
  return source.authority === "OFFICIAL" && source.verification === "VERIFIED_FINAL_KEY";
}
