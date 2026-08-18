export type ProblemCandidate = {
  id?: string;
  title?: string;
  subject?: string;
  topicId?: string;
  exam?: string;
  type?: string;
  difficulty?: number;
  statement?: string;
  options?: unknown;
  correctAnswer?: string;
  explanation?: string;
  source?: string;
  sourceYear?: number;
  sourceSession?: string;
  expectedSeconds?: number;
};

export type ValidationIssue = { field: string; message: string };

const SUBJECTS = new Set(["PHYSICS", "CHEMISTRY", "MATHEMATICS"]);
const EXAMS = new Set(["JEE_MAIN", "JEE_ADVANCED", "PRACTICE"]);
const TYPES = new Set(["MCQ", "NUMERICAL"]);

export function validateProblem(candidate: ProblemCandidate): ValidationIssue[] {
  const issues: ValidationIssue[] = [];
  if (!candidate.title?.trim()) issues.push({ field: "title", message: "Missing title" });
  if (!candidate.statement?.trim()) issues.push({ field: "statement", message: "Missing statement" });
  if (!candidate.subject || !SUBJECTS.has(candidate.subject)) issues.push({ field: "subject", message: "Invalid JEE subject" });
  if (!candidate.topicId?.trim()) issues.push({ field: "topicId", message: "Missing topic mapping" });
  if (!candidate.exam || !EXAMS.has(candidate.exam)) issues.push({ field: "exam", message: "Invalid exam" });
  if (!candidate.type || !TYPES.has(candidate.type)) issues.push({ field: "type", message: "Invalid problem type" });
  if (!Number.isInteger(candidate.difficulty) || Number(candidate.difficulty) < 1 || Number(candidate.difficulty) > 10) issues.push({ field: "difficulty", message: "Difficulty must be an integer from 1 to 10" });
  if (!candidate.correctAnswer?.trim()) issues.push({ field: "correctAnswer", message: "Missing correct answer" });
  if (!candidate.explanation?.trim()) issues.push({ field: "explanation", message: "Missing explanation" });
  if (!candidate.source?.trim()) issues.push({ field: "source", message: "Missing provenance" });
  if (candidate.type === "MCQ" && (!Array.isArray(candidate.options) || candidate.options.length < 2)) issues.push({ field: "options", message: "MCQ needs at least two options" });
  if (candidate.type === "NUMERICAL" && Array.isArray(candidate.options) && candidate.options.length) issues.push({ field: "options", message: "Numerical problems should not carry MCQ options" });
  if (candidate.sourceYear != null && (!Number.isInteger(candidate.sourceYear) || candidate.sourceYear < 2002 || candidate.sourceYear > new Date().getFullYear() + 1)) issues.push({ field: "sourceYear", message: "Invalid source year" });
  if (candidate.expectedSeconds != null && (!Number.isFinite(candidate.expectedSeconds) || candidate.expectedSeconds <= 0)) issues.push({ field: "expectedSeconds", message: "Expected time must be positive" });
  return issues;
}
