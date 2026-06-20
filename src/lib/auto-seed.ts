import { prisma } from "./prisma";

let seeding = false;
let seedComplete = false;

export function isSeeding() {
  return seeding;
}

export function isSeedComplete() {
  return seedComplete;
}

export async function checkAndSeed(): Promise<boolean> {
  if (seedComplete) return true;
  if (seeding) return false;

  const topicCount = await prisma.topic.count();
  if (topicCount > 0) {
    seedComplete = true;
    return true;
  }

  seeding = true;
  try {
    const { exec } = await import("child_process");
    const { promisify } = await import("util");
    const execAsync = promisify(exec);

    const files = [
      "prisma/seed.ts",
      "prisma/seed-physics.ts",
      "prisma/seed-chemistry.ts",
      "prisma/seed-mathematics.ts",
    ];

    for (const file of files) {
      await execAsync(`npx tsx "${file}"`, {
        cwd: process.cwd(),
        timeout: 180_000,
        env: { ...process.env, NODE_ENV: "production" },
      });
    }

    seedComplete = true;
    seeding = false;
    return true;
  } catch (err) {
    console.error("Auto-seed failed:", err);
    seeding = false;
    return false;
  }
}
