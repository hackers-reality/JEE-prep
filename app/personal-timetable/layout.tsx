import type { ReactNode } from "react";
import TimeFormat from "./TimeFormat";

export default function PersonalTimetableLayout({ children }: { children: ReactNode }) {
  return <>{children}<TimeFormat /></>;
}
