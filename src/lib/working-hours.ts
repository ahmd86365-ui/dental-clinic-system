import type { WorkingHourEntry } from "@/lib/clinic-settings-types";

export const DAY_LABELS: Record<number, string> = {
  0: "الأحد",
  1: "الإثنين",
  2: "الثلاثاء",
  3: "الأربعاء",
  4: "الخميس",
  5: "الجمعة",
  6: "السبت",
};

// Additive, public-site-only variant — the admin working-hours editor keeps
// using DAY_LABELS above unconditionally and is unaffected by this.
const DAY_LABELS_EN: Record<number, string> = {
  0: "Sunday",
  1: "Monday",
  2: "Tuesday",
  3: "Wednesday",
  4: "Thursday",
  5: "Friday",
  6: "Saturday",
};

// Middle-East work week convention: Saturday first, Friday last.
export const WEEK_ORDER = [6, 0, 1, 2, 3, 4, 5];

export function formatWorkingHoursSummary(
  entries: WorkingHourEntry[],
  locale: "ar" | "en" = "ar"
): string {
  const dayLabels = locale === "en" ? DAY_LABELS_EN : DAY_LABELS;
  const closedLabel = locale === "en" ? "Closed" : "مغلق";
  const separator = locale === "en" ? ", " : "، ";

  const byDay = new Map(entries.map((entry) => [entry.day, entry]));
  const ordered = WEEK_ORDER.map((day) => byDay.get(day)).filter(
    (entry): entry is WorkingHourEntry => !!entry
  );

  if (ordered.length === 0) return "";

  type Group = { start: WorkingHourEntry; end: WorkingHourEntry };
  const groups: Group[] = [];

  for (const entry of ordered) {
    const last = groups[groups.length - 1];
    const sameAsLast =
      last &&
      last.end.closed === entry.closed &&
      last.end.open === entry.open &&
      last.end.close === entry.close;

    if (sameAsLast) {
      last.end = entry;
    } else {
      groups.push({ start: entry, end: entry });
    }
  }

  return groups
    .map((group) => {
      const label =
        group.start.day === group.end.day
          ? dayLabels[group.start.day]
          : `${dayLabels[group.start.day]} - ${dayLabels[group.end.day]}`;

      if (group.start.closed) return `${label}: ${closedLabel}`;
      return `${label}: ${group.start.open} - ${group.start.close}`;
    })
    .join(separator);
}
