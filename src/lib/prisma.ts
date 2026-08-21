import "dotenv/config";
import { PrismaLibSql } from "@prisma/adapter-libsql";
import { PrismaClient } from "@/generated/prisma/client";

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

function createPrismaClient() {
  const url = process.env.TURSO_DATABASE_URL ?? process.env.DATABASE_URL ?? "file:./prisma/dev.db";
  const authToken = process.env.TURSO_AUTH_TOKEN;

  if (process.env.NODE_ENV === "production" && !process.env.TURSO_DATABASE_URL && !process.env.DATABASE_URL) {
    throw new Error("Production database is not configured. Set TURSO_DATABASE_URL and TURSO_AUTH_TOKEN in the deployment environment.");
  }

  if (process.env.NODE_ENV === "production" && process.env.TURSO_DATABASE_URL && !authToken) {
    throw new Error("TURSO_AUTH_TOKEN is missing in the production environment.");
  }

  const adapter = new PrismaLibSql({
    url,
    ...(authToken ? { authToken } : {}),
  });

  return new PrismaClient({ adapter });
}

export const prisma = globalForPrisma.prisma ?? createPrismaClient();

if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = prisma;
