import { randomUUID } from "node:crypto";
import { createClient } from "@libsql/client";
import { ensureDatabaseSchema } from "@/lib/database";

export type IngestProblem = {
  title: string;
  subject: "PHYSICS" | "CHEMISTRY" | "MATHEMATICS";
  topicId: string;
  exam: "JEE_MAIN" | "JEE_ADVANCED" | "PRACTICE";
  type: "MCQ" | "NUMERICAL" | "INTEGER" | "MULTI_SELECT";
  difficulty: number;
  statement: string;
  options?: string[];
  correctAnswer: string;
  explanation: string;
  source: string;
  sourceYear?: number;
  sourceSession?: string;
  expectedSeconds?: number;
};

export type IngestResult = { inserted: number; skipped: number; errors: string[] };

function db() {
  const url = process.env.TURSO_DATABASE_URL ?? process.env.DATABASE_URL ?? "file:./prisma/dev.db";
  const authToken = process.env.TURSO_AUTH_TOKEN;
  return createClient({ url, ...(authToken ? { authToken } : {}) });
}

export function validateIngestProblem(problem: IngestProblem): string[] {
  const errors: string[] = [];
  if (!problem.title.trim()) errors.push("title is required");
  if (!problem.topicId.trim()) errors.push("topicId is required");
  if (!problem.statement.trim()) errors.push("statement is required");
  if (!problem.correctAnswer.trim()) errors.push("correctAnswer is required");
  if (!problem.explanation.trim()) errors.push("explanation is required");
  if (!problem.source.trim()) errors.push("source is required");
  if (!Number.isInteger(problem.difficulty) || problem.difficulty < 1 || problem.difficulty > 10) errors.push("difficulty must be an integer from 1 to 10");
  if ((problem.type === "MCQ" || problem.type === "MULTI_SELECT") && (!problem.options || problem.options.length < 2)) errors.push("choice problems need at least two options");
  if (problem.sourceYear != null && (!Number.isInteger(problem.sourceYear) || problem.sourceYear < 2000 || problem.sourceYear > new Date().getFullYear())) errors.push("sourceYear is invalid");
  if (problem.expectedSeconds != null && (!Number.isInteger(problem.expectedSeconds) || problem.expectedSeconds < 10)) errors.push("expectedSeconds must be at least 10 seconds");
  return errors;
}

export async function ingestProblems(problems: IngestProblem[]): Promise<IngestResult> {
  await ensureDatabaseSchema();
  const client = db();
  const result: IngestResult = { inserted: 0, skipped: 0, errors: [] };
  try {
    for (const problem of problems) {
      const errors = validateIngestProblem(problem);
      if (errors.length) { result.errors.push(`${problem.title || "untitled"}: ${errors.join(", ")}`); continue; }
      const topic = await client.execute({ sql: `SELECT "id" FROM "Topic" WHERE "id" = ? LIMIT 1`, args: [problem.topicId] });
      if (!topic.rows.length) { result.errors.push(`${problem.title}: topic ${problem.topicId} does not exist`); continue; }
      const existing = await client.execute({
        sql: `SELECT "id" FROM "Problem" WHERE "source" = ? AND COALESCE("sourceYear",0) = COALESCE(?,0) AND COALESCE("sourceSession",'') = COALESCE(?, '') AND "statement" = ? LIMIT 1`,
        args: [problem.source, problem.sourceYear ?? null, problem.sourceSession ?? null, problem.statement],
      });
      if (existing.rows.length) { result.skipped += 1; continue; }
      await client.execute({
        sql: `INSERT INTO "Problem" ("id","title","subject","topicId","exam","type","difficulty","statement","options","correctAnswer","explanation","source","sourceYear","sourceSession","expectedSeconds") VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)`,
        args: [randomUUID(), problem.title, problem.subject, problem.topicId, problem.exam, problem.type, problem.difficulty, problem.statement, JSON.stringify(problem.options ?? []), problem.correctAnswer, problem.explanation, problem.source, problem.sourceYear ?? null, problem.sourceSession ?? null, problem.expectedSeconds ?? 120],
      });
      result.inserted += 1;
    }
    return result;
  } finally { client.close(); }
}
