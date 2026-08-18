import { prisma } from "./prisma";
import { ensureDatabaseSchema } from "./database";
import { main as seedBase } from "../../prisma/seed";
import { seedPhysics } from "../../prisma/seed-physics";
import { seedChemistry } from "../../prisma/seed-chemistry";
import { seedMath } from "../../prisma/seed-mathematics";

let seeding = false;
let seedComplete = false;

const REQUIRED_SUBJECTS = ["PHYSICS", "CHEMISTRY", "MATHEMATICS"] as const;

export function isSeeding() {
  return seeding;
}

export function isSeedComplete() {
  return seedComplete;
}

export async function checkAndSeed(): Promise<boolean> {
  if (seedComplete) return true;
  if (seeding) return false;

  seeding = true;
  try {
    await ensureDatabaseSchema();

    // The base seed only creates Physics. The old implementation treated
    // any existing topic as a complete seed, which meant production could
    // permanently stop at a tiny Physics-only dataset. Verify all three
    // required subjects before declaring the database ready.
    const subjects = await prisma.subject.findMany({
      where: { name: { in: [...REQUIRED_SUBJECTS] } },
      select: { name: true },
    });
    const subjectNames = new Set(subjects.map((subject) => subject.name));

    const fullySeeded = REQUIRED_SUBJECTS.every((name) => subjectNames.has(name));
    if (!fullySeeded) {
      await seedBase(prisma);
      await seedPhysics(prisma);
      await seedChemistry(prisma);
      await seedMath(prisma);
    }

    const finalSubjects = await prisma.subject.findMany({
      where: { name: { in: [...REQUIRED_SUBJECTS] } },
      select: { name: true },
    });
    const finalNames = new Set(finalSubjects.map((subject) => subject.name));

    seedComplete = REQUIRED_SUBJECTS.every((name) => finalNames.has(name));
    return seedComplete;
  } catch (err) {
    console.error("Auto-seed failed:", err);
    return false;
  } finally {
    seeding = false;
  }
}
