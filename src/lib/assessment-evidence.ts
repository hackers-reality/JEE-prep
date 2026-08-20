export type AssessmentQuestionEvidence = {
  topicId: string | null;
  isCorrect: boolean;
  actualSeconds: number;
  expectedSeconds: number;
  confidence: number | null;
  mistakeType: string | null;
};

export type TopicAssessmentEvidence = {
  topicId: string;
  attempts: number;
  correct: number;
  accuracy: number;
  avgSeconds: number | null;
  expectedSeconds: number | null;
  avgConfidence: number | null;
  mistakes: number;
};

export function aggregateAssessmentEvidence(items: AssessmentQuestionEvidence[]): TopicAssessmentEvidence[] {
  const byTopic = new Map<string, AssessmentQuestionEvidence[]>();
  for (const item of items) {
    if (!item.topicId) continue;
    const bucket = byTopic.get(item.topicId) ?? [];
    bucket.push(item);
    byTopic.set(item.topicId, bucket);
  }

  return [...byTopic.entries()].map(([topicId, rows]) => {
    const attempted = rows.length;
    const correct = rows.filter((row) => row.isCorrect).length;
    const timed = rows.filter((row) => row.expectedSeconds > 0);
    const confidences = rows.filter((row) => row.confidence != null);
    return {
      topicId,
      attempts: attempted,
      correct,
      accuracy: attempted ? correct / attempted : 0,
      avgSeconds: attempted ? rows.reduce((sum, row) => sum + Math.max(0, row.actualSeconds), 0) / attempted : null,
      expectedSeconds: timed.length ? timed.reduce((sum, row) => sum + row.expectedSeconds, 0) / timed.length : null,
      avgConfidence: confidences.length ? confidences.reduce((sum, row) => sum + Number(row.confidence), 0) / confidences.length : null,
      mistakes: rows.filter((row) => Boolean(row.mistakeType)).length,
    };
  });
}
