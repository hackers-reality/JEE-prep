export type VerificationStage =
  | "DRAFT"
  | "SOURCE_CHECKED"
  | "EXTRACTION_CHECKED"
  | "CONTENT_REVIEWED"
  | "JEE_REVIEWED"
  | "HUMAN_APPROVED"
  | "VERIFIED"
  | "REJECTED"
  | "RETIRED";

export type VerificationRecord = {
  contentId: string;
  contentVersion: string;
  sourceId: string;
  sourceLocation: string;
  stage: VerificationStage;
  reviewerId?: string;
  checkedAt: string;
  notes?: string;
  evidence?: string[];
};

const ORDER: VerificationStage[] = [
  "DRAFT",
  "SOURCE_CHECKED",
  "EXTRACTION_CHECKED",
  "CONTENT_REVIEWED",
  "JEE_REVIEWED",
  "HUMAN_APPROVED",
  "VERIFIED",
];

export function canAdvanceVerification(from: VerificationStage, to: VerificationStage) {
  if (from === "REJECTED" || from === "RETIRED") return false;
  const fromIndex = ORDER.indexOf(from);
  const toIndex = ORDER.indexOf(to);
  return fromIndex >= 0 && toIndex === fromIndex + 1;
}

export function canRecommendAsAuthoritative(sourceTrusted: boolean, contentStage: VerificationStage) {
  return sourceTrusted && contentStage === "VERIFIED";
}

export function verificationEvidenceRequired(stage: VerificationStage) {
  return stage !== "DRAFT" && stage !== "REJECTED" && stage !== "RETIRED";
}
