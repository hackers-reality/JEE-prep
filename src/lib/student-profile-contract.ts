export type JeeTarget = "MAIN_ONLY" | "MAIN_AND_ADVANCED";
export type PrepStage = "JUST_STARTED_11" | "MID_11" | "COMPLETED_11_STARTING_12" | "IN_12" | "DROP_YEAR_REPEAT";

export type StudyPreference = {
  preferredDailyHours: number;
  subjectPreferences?: Array<{ subject: "PHYSICS" | "CHEMISTRY" | "MATHEMATICS"; preferredWindows: string[] }>;
  maxContinuousStudyMinutes: number;
  shortBreakMinutes: number;
  longBreakMinutes: number;
  weekdayOverrides?: Record<string, number>;
};

export type FixedCommitment = {
  id: string;
  title: string;
  type: "SCHOOL" | "COLLEGE" | "TUITION" | "COMMUTE" | "MEAL" | "PERSONAL" | "OTHER";
  dayOfWeek?: number;
  start: string;
  end: string;
  locked: true;
};

export type StudentScheduleProfile = {
  classLevel?: string;
  prepStage?: PrepStage;
  jeeTarget?: JeeTarget;
  timezone: string;
  wakeTime: string;
  sleepTime: string;
  fixedCommitments: FixedCommitment[];
  studyPreferences: StudyPreference;
  currentPreparationPosition?: string;
  strongTopics?: string[];
  weakTopics?: string[];
};

export function validateScheduleProfile(profile: StudentScheduleProfile): string[] {
  const errors: string[] = [];
  const time = /^([01]\d|2[0-3]):[0-5]\d$/;
  if (!time.test(profile.wakeTime)) errors.push("wakeTime must use HH:mm");
  if (!time.test(profile.sleepTime)) errors.push("sleepTime must use HH:mm");
  if (profile.studyPreferences.preferredDailyHours <= 0 || profile.studyPreferences.preferredDailyHours > 16) errors.push("preferredDailyHours must be between 0 and 16");
  if (profile.studyPreferences.maxContinuousStudyMinutes < 20 || profile.studyPreferences.maxContinuousStudyMinutes > 180) errors.push("maxContinuousStudyMinutes must be between 20 and 180");
  for (const commitment of profile.fixedCommitments) {
    if (!time.test(commitment.start) || !time.test(commitment.end)) errors.push(`Invalid time in commitment ${commitment.title}`);
  }
  return errors;
}
