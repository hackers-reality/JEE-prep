import type { ReactNode } from "react";
import TimeFormat from "./TimeFormat";

export default function PersonalTimetableLayout({ children }: { children: ReactNode }) {
  return <>{children}<a href="/personal-timetable/update" className="fixed bottom-5 right-5 z-50 rounded-full border border-emerald-400/30 bg-slate-900 px-4 py-3 text-sm font-bold text-emerald-300 shadow-2xl hover:bg-slate-800">Update progress</a><TimeFormat /></>;
}
