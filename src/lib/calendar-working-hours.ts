import type { WorkingHourEntry } from "@/lib/clinic-settings-types";

export function getWorkingHoursForDate(
  workingHours: WorkingHourEntry[],
  date: Date
): WorkingHourEntry | undefined {
  return workingHours.find((entry) => entry.day === date.getDay());
}

function timeStringToMinutes(time: string): number {
  const [hours, minutes] = time.split(":").map(Number);
  return hours * 60 + minutes;
}

/** Whether `date` (a specific moment) falls inside that weekday's open/close window. */
export function isWithinWorkingHours(
  workingHours: WorkingHourEntry[],
  date: Date
): boolean {
  const entry = getWorkingHoursForDate(workingHours, date);
  if (!entry || entry.closed) return false;

  const minutesOfDay = date.getHours() * 60 + date.getMinutes();
  return (
    minutesOfDay >= timeStringToMinutes(entry.open) &&
    minutesOfDay < timeStringToMinutes(entry.close)
  );
}

/** Whether an entire [start, end) range falls inside that day's open/close window. */
export function isRangeWithinWorkingHours(
  workingHours: WorkingHourEntry[],
  start: Date,
  end: Date
): boolean {
  const entry = getWorkingHoursForDate(workingHours, start);
  if (!entry || entry.closed) return false;

  const startMinutes = start.getHours() * 60 + start.getMinutes();
  const endMinutes = end.getHours() * 60 + end.getMinutes();
  const openMinutes = timeStringToMinutes(entry.open);
  const closeMinutes = timeStringToMinutes(entry.close);

  return startMinutes >= openMinutes && endMinutes <= closeMinutes;
}

const DEFAULT_START_HOUR = 8;
const DEFAULT_END_HOUR = 20;

/**
 * The vertical hour range to render for a set of visible days, based on the
 * widest open/close window among them (with 1h padding), or a sane fallback
 * if every visible day is closed.
 */
export function getDisplayHourRange(
  workingHours: WorkingHourEntry[],
  visibleDates: Date[]
): { startHour: number; endHour: number } {
  let minOpen: number | null = null;
  let maxClose: number | null = null;

  for (const date of visibleDates) {
    const entry = getWorkingHoursForDate(workingHours, date);
    if (!entry || entry.closed) continue;

    const openHour = Math.floor(timeStringToMinutes(entry.open) / 60);
    const closeMinutes = timeStringToMinutes(entry.close);
    const closeHour = Math.ceil(closeMinutes / 60);

    if (minOpen === null || openHour < minOpen) minOpen = openHour;
    if (maxClose === null || closeHour > maxClose) maxClose = closeHour;
  }

  if (minOpen === null || maxClose === null) {
    return { startHour: DEFAULT_START_HOUR, endHour: DEFAULT_END_HOUR };
  }

  return {
    startHour: Math.max(0, minOpen - 1),
    endHour: Math.min(24, maxClose + 1),
  };
}
