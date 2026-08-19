export type TimeRange = { startMinutes: number; endMinutes: number };
export type FixedBlock = TimeRange & { id: string; label: string; kind: "SCHOOL" | "TUITION" | "MEAL" | "SLEEP" | "COMMITMENT" };
export type StudyBlock = TimeRange & { id: string; title: string; kind: "THEORY" | "PRACTICE" | "REVISION" | "TEST" | "BUFFER"; topicId?: string; priority: number; locked?: boolean };
export type ScheduleConstraints = { wakeMinutes: number; sleepMinutes: number; availableStudyMinutes: number; fixedBlocks: FixedBlock[]; bufferPercent?: number };
export type ScheduleCandidate = { id: string; title: string; minutes: number; kind: StudyBlock["kind"]; priority: number; topicId?: string };
export type ScheduleBuildResult = { blocks: StudyBlock[]; unscheduled: ScheduleCandidate[]; conflicts: string[] };

function overlaps(a: TimeRange, b: TimeRange) { return a.startMinutes < b.endMinutes && b.startMinutes < a.endMinutes; }
function normalizeEnd(end: number) { return Math.min(end, 24 * 60); }

export function validateFixedBlocks(constraints: ScheduleConstraints) {
  const conflicts: string[] = [];
  if (constraints.wakeMinutes >= constraints.sleepMinutes) conflicts.push("Wake time must be earlier than sleep time on the same day.");
  const blocks = [...constraints.fixedBlocks].sort((a, b) => a.startMinutes - b.startMinutes);
  for (let i = 1; i < blocks.length; i += 1) if (overlaps(blocks[i - 1], blocks[i])) conflicts.push(`Fixed blocks overlap: ${blocks[i - 1].label} / ${blocks[i].label}`);
  return [...new Set(conflicts)];
}

function freeWindows(constraints: ScheduleConstraints): TimeRange[] {
  const day = { startMinutes: constraints.wakeMinutes, endMinutes: constraints.sleepMinutes };
  const fixed = [...constraints.fixedBlocks].filter((block) => overlaps(block, day)).map((block) => ({ startMinutes: Math.max(block.startMinutes, day.startMinutes), endMinutes: Math.min(block.endMinutes, day.endMinutes) })).sort((a, b) => a.startMinutes - b.startMinutes);
  const windows: TimeRange[] = [];
  let cursor = day.startMinutes;
  for (const block of fixed) { if (cursor < block.startMinutes) windows.push({ startMinutes: cursor, endMinutes: block.startMinutes }); cursor = Math.max(cursor, block.endMinutes); }
  if (cursor < day.endMinutes) windows.push({ startMinutes: cursor, endMinutes: day.endMinutes });
  return windows;
}

export function buildDailySchedule(constraints: ScheduleConstraints, candidates: ScheduleCandidate[]): ScheduleBuildResult {
  const conflicts = validateFixedBlocks(constraints);
  if (conflicts.length) return { blocks: [], unscheduled: [...candidates], conflicts };
  const free = freeWindows(constraints);
  const bufferPercent = Math.max(0, Math.min(0.35, constraints.bufferPercent ?? 0.1));
  let remaining = Math.max(0, Math.round(constraints.availableStudyMinutes * (1 - bufferPercent)));
  const blocks: StudyBlock[] = [];
  const unscheduled: ScheduleCandidate[] = [];
  for (const candidate of [...candidates].sort((a, b) => b.priority - a.priority)) {
    if (remaining <= 0) { unscheduled.push(candidate); continue; }
    let placed = false;
    for (const window of free) {
      const prior = blocks.filter((block) => overlaps(block, window)).sort((a, b) => a.startMinutes - b.startMinutes).at(-1);
      const cursor = prior ? prior.endMinutes : window.startMinutes;
      const duration = Math.min(candidate.minutes, remaining);
      if (cursor + duration <= window.endMinutes) {
        blocks.push({ id: candidate.id, title: candidate.title, kind: candidate.kind, topicId: candidate.topicId, priority: candidate.priority, startMinutes: cursor, endMinutes: normalizeEnd(cursor + duration) });
        remaining -= duration;
        placed = true;
        break;
      }
    }
    if (!placed) unscheduled.push(candidate);
  }
  return { blocks: blocks.sort((a, b) => a.startMinutes - b.startMinutes), unscheduled, conflicts: [] };
}

export function minutesToLabel(totalMinutes: number) {
  const minutes = ((Math.round(totalMinutes) % 1440) + 1440) % 1440;
  const hour = Math.floor(minutes / 60);
  const minute = minutes % 60;
  const suffix = hour >= 12 ? "PM" : "AM";
  const twelveHour = hour % 12 || 12;
  return `${twelveHour}:${minute.toString().padStart(2, "0")} ${suffix}`;
}
