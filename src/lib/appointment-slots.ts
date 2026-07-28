export const CLINIC_OPEN_HOUR = 9;
export const CLINIC_CLOSE_HOUR = 20;
export const SLOT_MINUTES = 30;
export const CLOSED_WEEKDAY = 5; // Friday (Date#getDay(): Sunday = 0)

export function getAllDaySlots(): string[] {
  const slots: string[] = [];
  const totalMinutes = (CLINIC_CLOSE_HOUR - CLINIC_OPEN_HOUR) * 60;

  for (let minutes = 0; minutes < totalMinutes; minutes += SLOT_MINUTES) {
    const hour = CLINIC_OPEN_HOUR + Math.floor(minutes / 60);
    const minute = minutes % 60;
    slots.push(`${String(hour).padStart(2, "0")}:${String(minute).padStart(2, "0")}`);
  }

  return slots;
}

export function isClosedDay(dateStr: string): boolean {
  const date = new Date(`${dateStr}T00:00:00`);
  return date.getDay() === CLOSED_WEEKDAY;
}

export function isPastSlot(dateStr: string, timeStr: string): boolean {
  const dateTime = new Date(`${dateStr}T${timeStr}:00`);
  return dateTime.getTime() < Date.now();
}

export function combineDateAndTime(dateStr: string, timeStr: string): Date {
  return new Date(`${dateStr}T${timeStr}:00`);
}

export function todayDateString(): string {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, "0");
  const day = String(now.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}
