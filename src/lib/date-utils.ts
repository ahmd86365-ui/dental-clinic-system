export function startOfDay(date: Date): Date {
  const d = new Date(date);
  d.setHours(0, 0, 0, 0);
  return d;
}

export function endOfDay(date: Date): Date {
  const d = new Date(date);
  d.setHours(23, 59, 59, 999);
  return d;
}

export function startOfMonth(date: Date): Date {
  return new Date(date.getFullYear(), date.getMonth(), 1);
}

export function startOfYear(date: Date): Date {
  return new Date(date.getFullYear(), 0, 1);
}

export function endOfYear(date: Date): Date {
  return new Date(date.getFullYear(), 11, 31, 23, 59, 59, 999);
}

export function addDays(date: Date, days: number): Date {
  const d = new Date(date);
  d.setDate(d.getDate() + days);
  return d;
}

const dayFormatter = new Intl.DateTimeFormat("ar-SY", {
  day: "numeric",
  month: "short",
});

export function formatShortDate(date: Date): string {
  return dayFormatter.format(date);
}

const dateTimeFormatter = new Intl.DateTimeFormat("ar-SY", {
  day: "numeric",
  month: "short",
  year: "numeric",
  hour: "2-digit",
  minute: "2-digit",
});

export function formatDateTime(date: Date): string {
  return dateTimeFormatter.format(date);
}

const timeFormatter = new Intl.DateTimeFormat("ar-SY", {
  hour: "2-digit",
  minute: "2-digit",
});

export function formatTime(date: Date): string {
  return timeFormatter.format(date);
}

export function splitByTime<T extends { startTime: Date }>(
  items: T[]
): { upcoming: T[]; previous: T[] } {
  const now = Date.now();
  return {
    upcoming: items.filter((item) => item.startTime.getTime() >= now),
    previous: items.filter((item) => item.startTime.getTime() < now),
  };
}

const currencyFormatter = new Intl.NumberFormat("ar-SY", {
  minimumFractionDigits: 0,
  maximumFractionDigits: 2,
});

export function formatCurrency(amount: number): string {
  return currencyFormatter.format(amount);
}

export function calculateAge(dateOfBirth: Date): number {
  const now = new Date();
  let age = now.getFullYear() - dateOfBirth.getFullYear();
  const hasHadBirthdayThisYear =
    now.getMonth() > dateOfBirth.getMonth() ||
    (now.getMonth() === dateOfBirth.getMonth() && now.getDate() >= dateOfBirth.getDate());
  if (!hasHadBirthdayThisYear) age -= 1;
  return age;
}
