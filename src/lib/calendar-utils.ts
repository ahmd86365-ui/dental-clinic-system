import { addDays, startOfDay } from "@/lib/date-utils";

export type CalendarView = "day" | "week" | "month";
export const CALENDAR_VIEWS: CalendarView[] = ["day", "week", "month"];

export const CALENDAR_SLOT_MINUTES = 30;

/** Middle-East work week: Saturday first, Friday last (Date#getDay(): Sun=0). */
export function startOfWeekSaturday(date: Date): Date {
  const day = date.getDay();
  const diff = (day + 1) % 7; // days since the most recent Saturday
  return startOfDay(addDays(date, -diff));
}

export function addWeeks(date: Date, weeks: number): Date {
  return addDays(date, weeks * 7);
}

export function addMonths(date: Date, months: number): Date {
  const result = new Date(date);
  result.setDate(1);
  result.setMonth(result.getMonth() + months);
  return result;
}

/** 42 days (6 weeks) covering the full month, grid always starting on Saturday. */
export function getMonthGridDays(anchor: Date): Date[] {
  const firstOfMonth = new Date(anchor.getFullYear(), anchor.getMonth(), 1);
  const gridStart = startOfWeekSaturday(firstOfMonth);
  return Array.from({ length: 42 }, (_, index) => addDays(gridStart, index));
}

export function getWeekDays(anchor: Date): Date[] {
  const weekStart = startOfWeekSaturday(anchor);
  return Array.from({ length: 7 }, (_, index) => addDays(weekStart, index));
}

export function toDateKey(date: Date): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

export function isSameDay(a: Date, b: Date): boolean {
  return toDateKey(a) === toDateKey(b);
}

const monthYearFormatter = new Intl.DateTimeFormat("ar-SY", {
  month: "long",
  year: "numeric",
});

export function formatMonthYear(date: Date): string {
  return monthYearFormatter.format(date);
}

const weekdayFormatter = new Intl.DateTimeFormat("ar-SY", { weekday: "short" });
const dayNumberFormatter = new Intl.DateTimeFormat("ar-SY", { day: "numeric" });
const dayMonthFormatter = new Intl.DateTimeFormat("ar-SY", { day: "numeric", month: "short" });

export function formatWeekdayLabel(date: Date): string {
  return weekdayFormatter.format(date);
}

export function formatDayNumber(date: Date): string {
  return dayNumberFormatter.format(date);
}

export function formatWeekRangeLabel(weekDays: Date[]): string {
  const first = weekDays[0];
  const last = weekDays[weekDays.length - 1];
  if (!first || !last) return "";
  return `${dayMonthFormatter.format(first)} — ${dayMonthFormatter.format(last)}`;
}
