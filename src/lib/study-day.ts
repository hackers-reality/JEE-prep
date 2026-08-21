const ROLLOVER_HOUR = 3;
const ROLLOVER_MINUTE = 30;

/**
 * Returns the logical study date for the student's 11:00 AM–3:30 AM routine.
 * Between midnight and 3:29 AM we are still completing the previous study day.
 */
export function getStudyDay(date = new Date()): string {
  const d = new Date(date);
  if (d.getHours() < ROLLOVER_HOUR || (d.getHours() === ROLLOVER_HOUR && d.getMinutes() < ROLLOVER_MINUTE)) {
    d.setDate(d.getDate() - 1);
  }
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

export function getStudyDayStart(date = new Date()): Date {
  const d = new Date(date);
  d.setHours(ROLLOVER_HOUR, ROLLOVER_MINUTE, 0, 0);
  if (date instanceof Date && (date.getHours() < ROLLOVER_HOUR || (date.getHours() === ROLLOVER_HOUR && date.getMinutes() < ROLLOVER_MINUTE))) {
    d.setDate(d.getDate() - 1);
  }
  return d;
}

export const STUDY_DAY_ROLLOVER = "03:30";
