import type { VerificationRecord, VerificationStage } from "./content-verification-store";

export type VerificationQueueItem = VerificationRecord & {
  priority: "HIGH" | "NORMAL";
};

export function nextVerificationStage(stage: VerificationStage): VerificationStage | null {
  const order: VerificationStage[] = [
    "DRAFT",
    "SOURCE_CHECKED",
    "EXTRACTION_CHECKED",
    "CONTENT_REVIEWED",
    "JEE_REVIEWED",
    "HUMAN_APPROVED",
    "VERIFIED",
  ];
  const index = order.indexOf(stage);
  return index >= 0 && index < order.length - 1 ? order[index + 1] : null;
}

export function buildVerificationQueue(records: VerificationRecord[]): VerificationQueueItem[] {
  return records
    .filter((record) => record.stage !== "VERIFIED" && record.stage !== "RETIRED" && record.stage !== "REJECTED")
    .map<VerificationQueueItem>((record) => ({
      ...record,
      priority:
        record.stage === "JEE_REVIEWED" || record.stage === "HUMAN_APPROVED" ? "HIGH" : "NORMAL",
    }))
    .sort((a, b) => Number(b.priority === "HIGH") - Number(a.priority === "HIGH"));
}
