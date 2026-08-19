export type SourceVerificationStatus =
  | "UNVERIFIED"
  | "IDENTIFIED"
  | "PROVENANCE_CHECKED"
  | "RIGHTS_CLEARED"
  | "TRUSTED"
  | "RESTRICTED"
  | "RETIRED";

export type ContentVerificationStatus =
  | "DRAFT"
  | "SOURCE_CHECKED"
  | "EXTRACTION_CHECKED"
  | "CONTENT_REVIEWED"
  | "JEE_REVIEWED"
  | "HUMAN_APPROVED"
  | "VERIFIED"
  | "RETIRED";

const sourceRank: Record<SourceVerificationStatus, number> = {
  UNVERIFIED: 0,
  IDENTIFIED: 1,
  PROVENANCE_CHECKED: 2,
  RIGHTS_CLEARED: 3,
  TRUSTED: 4,
  RESTRICTED: 0,
  RETIRED: 0,
};

const contentRank: Record<ContentVerificationStatus, number> = {
  DRAFT: 0,
  SOURCE_CHECKED: 1,
  EXTRACTION_CHECKED: 2,
  CONTENT_REVIEWED: 3,
  JEE_REVIEWED: 4,
  HUMAN_APPROVED: 5,
  VERIFIED: 6,
  RETIRED: 0,
};

export function isTrustedSource(status: SourceVerificationStatus) {
  return status === "TRUSTED";
}

export function isVerifiedContent(status: ContentVerificationStatus) {
  return status === "VERIFIED";
}

export function canTutorNavigatorRecommend(
  sourceStatus: SourceVerificationStatus,
  contentStatus: ContentVerificationStatus,
) {
  return sourceRank[sourceStatus] >= sourceRank.TRUSTED && contentRank[contentStatus] >= contentRank.VERIFIED;
}

export function nextVerificationStage(status: ContentVerificationStatus): ContentVerificationStatus | null {
  switch (status) {
    case "DRAFT": return "SOURCE_CHECKED";
    case "SOURCE_CHECKED": return "EXTRACTION_CHECKED";
    case "EXTRACTION_CHECKED": return "CONTENT_REVIEWED";
    case "CONTENT_REVIEWED": return "JEE_REVIEWED";
    case "JEE_REVIEWED": return "HUMAN_APPROVED";
    case "HUMAN_APPROVED": return "VERIFIED";
    default: return null;
  }
}

export type VerificationEvidence = {
  sourceLocation?: string;
  sourceIdentifier?: string;
  reviewer?: string;
  notes?: string;
  checks?: string[];
};

export function validateVerificationEvidence(
  status: ContentVerificationStatus,
  evidence: VerificationEvidence,
) {
  if (status === "DRAFT" || status === "RETIRED") return true;
  if (!evidence.sourceLocation && !evidence.sourceIdentifier) return false;
  if (["CONTENT_REVIEWED", "JEE_REVIEWED", "HUMAN_APPROVED", "VERIFIED"].includes(status)) {
    return Boolean(evidence.reviewer);
  }
  return true;
}
