import { prisma } from "./prisma";
import { main as seedBase } from "../../prisma/seed";
import { seedPhysics } from "../../prisma/seed-physics";
import { seedChemistry } from "../../prisma/seed-chemistry";
import { seedMath } from "../../prisma/seed-mathematics";

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
    await seedBase(prisma);
    await seedPhysics(prisma);
    await seedChemistry(prisma);
    await seedMath(prisma);
    seedComplete = true;
    seeding = false;
    return true;
  } catch (err) {
    console.error("Auto-seed failed:", err);
    seeding = false;
    return false;
  }
}
