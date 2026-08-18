import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { ensureDatabaseSchema } from "@/lib/database";
import { deterministicRotation } from "@/lib/rotation";

export const dynamic = "force-dynamic";

export default async function SubjectsPage() {
  await ensureDatabaseSchema();
  const subjects = await prisma.subject.findMany({ orderBy: { name: "asc" } });

  return (
    <main className="max-w-5xl mx-auto p-6">
      <div className="mb-8"><p className="text-xs uppercase tracking-widest opacity-50">JEE syllabus</p><h1 className="font-hand text-4xl font-bold" style={{ color: "var(--ink)" }}>Subjects</h1><p className="text-sm opacity-65 mt-1">Pick a subject, then work chapter → topic → questions.</p></div>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {subjects.map((subject) => (
          <Link key={subject.id} href={`/subjects/${subject.id}`}>
            <div className="paper-card p-6 transition-all duration-200 hover:shadow-xl hover:-translate-y-1" style={{ backgroundColor: subject.name === "PHYSICS" ? "var(--sticky-blue)" : subject.name === "CHEMISTRY" ? "var(--sticky-green)" : "var(--sticky-yellow)", transform: `rotate(${deterministicRotation(subject.id, 3)}deg)` }}>
              <p className="text-xs uppercase tracking-widest opacity-50">{subject.name}</p>
              <h2 className="font-hand text-2xl font-bold mt-1">{subject.name.charAt(0) + subject.name.slice(1).toLowerCase()}</h2>
              <p className="text-xs opacity-60 mt-3">Open chapters →</p>
            </div>
          </Link>
        ))}
      </div>
    </main>
  );
}
