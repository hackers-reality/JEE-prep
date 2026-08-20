import Link from "next/link";

export default function Home() {
  return (
    <main className="min-h-[85vh] flex items-center justify-center p-5">
      <section className="paper-card w-full max-w-3xl p-8 sm:p-12 text-center">
        <p className="text-xs uppercase tracking-[0.25em] opacity-50">JEE 2028 • personal study system</p>
        <h1 className="font-hand text-5xl sm:text-6xl font-bold mt-3">Lock in. 🫡</h1>
        <p className="opacity-70 mt-4 max-w-xl mx-auto">Your timetable, study sessions, weaknesses, practice and GT progress in one place.</p>
        <div className="flex flex-wrap justify-center gap-3 mt-7">
          <Link href="/login" className="sticky-button">Sign in →</Link>
          <Link href="/dashboard" className="sticky-button blue">Open dashboard →</Link>
        </div>
      </section>
    </main>
  );
}
