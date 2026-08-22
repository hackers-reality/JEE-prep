import type { ReactNode } from "react";
import TimeFormat from "./TimeFormat";
import AccessGate from "./AccessGate";
import { getPersonalAccess } from "@/lib/personal-access";

export default async function PersonalTimetableLayout({ children }: { children: ReactNode }) {
  const access = await getPersonalAccess();
  return (
    <>
      <AccessGate />
      {access.allowed ? <div className="select-none">{children}</div> : null}
      <TimeFormat />
    </>
  );
}
