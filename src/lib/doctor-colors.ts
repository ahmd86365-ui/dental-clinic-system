// Reuses the app's existing categorical chart palette (--chart-1..5, see globals.css)
// so doctor colors stay on-brand and theme-aware instead of introducing new hues.
const DOCTOR_COLOR_VARS = [
  "var(--chart-1)",
  "var(--chart-2)",
  "var(--chart-3)",
  "var(--chart-4)",
  "var(--chart-5)",
];

export function getDoctorColor(doctorIndex: number): string {
  return DOCTOR_COLOR_VARS[doctorIndex % DOCTOR_COLOR_VARS.length];
}

export function buildDoctorColorMap(doctorIds: string[]): Map<string, string> {
  return new Map(doctorIds.map((id, index) => [id, getDoctorColor(index)]));
}
