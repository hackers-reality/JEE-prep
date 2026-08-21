import { createClient } from "@libsql/client";

function db() {
  const url = process.env.TURSO_DATABASE_URL ?? process.env.DATABASE_URL;
  if (!url) throw new Error("TURSO_DATABASE_URL is not configured.");
  const authToken = process.env.TURSO_AUTH_TOKEN;
  return createClient({ url, ...(authToken ? { authToken } : {}) });
}

export async function ensurePersonalTimetableTables() {
  const client = db();
  try {
    await client.execute(`CREATE TABLE IF NOT EXISTS "PersonalTimetableData" ("id" INTEGER PRIMARY KEY CHECK ("id" = 1), "payload" TEXT NOT NULL DEFAULT '{}', "updatedAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP)`);
    await client.execute(`CREATE TABLE IF NOT EXISTS "PersonalTimetableAccess" ("id" INTEGER PRIMARY KEY CHECK ("id" = 1), "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP, "updatedAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP)`);
  } finally {
    client.close();
  }
}
