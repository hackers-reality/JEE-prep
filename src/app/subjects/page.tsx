import Link from "next/link";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export default async function SubjectsPage() {
  const subjects = await prisma.subject.findMany({ orderBy: { name: "asc" } });

  return (
    <main className="max-w-4xl mx-auto p-6">
      <h1 className="font-hand text-3xl font-bold mb-8" style={{ color: "var(--ink)" }}>
        Subjects
      </h1>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {subjects.map((subject) => (
          <Link key={subject.id} href={`/subjects/${subject.id}`}>
            <div
              className="rounded-lg p-6 shadow-md transition-all duration-200 hover:shadow-xl hover:-translate-y-1"
              style={{
                backgroundColor: "var(--sticky-yellow)",
                transform: `rotate(${(Math.random() - 0.5) * 3}deg)`,
                borderRadius: "6px 10px 8px 12px",
              }}
            >
              <h2 className="font-hand text-xl font-bold">{subject.name.charAt(0) + subject.name.slice(1).toLowerCase()}</h2>
            </div>
          </Link>
        ))}
      </div>
    </main>
  );
}
