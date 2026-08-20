import type { StudentScheduleProfile } from "./student-profile-contract";

export type SchedulePlanningSnapshot = {
  wakeTime: string;
  sleepTime: string;
  timezone: string;
  preferredDailyHours: number;
  fixedCommitments: StudentScheduleProfile["fixedCommitments"];
  examFocus: "MAIN_ONLY" | "MAIN_AND_ADVANCED" | null;
  prepStage: StudentScheduleProfile["prepStage"];
};

export function toSchedulePlanningSnapshot(profile: StudentScheduleProfile): SchedulePlanningSnapshot {
  return {
    wakeTime: profile.wakeTime,
    sleepTime: profile.sleepTime,
    timezone: profile.timezone,
    preferredDailyHours: profile.studyPreferences.preferredDailyHours,
    fixedCommitments: profile.fixedCommitments,
    examFocus: profile.jeeTarget ?? null,
    prepStage: profile.prepStage,
  };
}
