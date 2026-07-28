import type { AppointmentStatus } from "@/generated/prisma/client";

export const APPOINTMENT_STATUS_LABELS: Record<AppointmentStatus, string> = {
  NEW: "جديد",
  PENDING: "قيد المراجعة",
  CONFIRMED: "مؤكد",
  COMPLETED: "مكتمل",
  CANCELLED: "ملغي",
  NO_SHOW: "لم يحضر",
};

export const APPOINTMENT_STATUS_BADGE_CLASSES: Record<AppointmentStatus, string> = {
  NEW: "bg-turquoise/15 text-turquoise-foreground",
  PENDING: "bg-amber-500/15 text-amber-700 dark:text-amber-400",
  CONFIRMED: "bg-primary/10 text-primary",
  COMPLETED: "bg-emerald-500/15 text-emerald-700 dark:text-emerald-400",
  CANCELLED: "bg-destructive/10 text-destructive",
  NO_SHOW: "bg-neutral-500/15 text-neutral-700 dark:text-neutral-400",
};

export const APPOINTMENT_STATUS_CHART_COLORS: Record<AppointmentStatus, string> = {
  NEW: "var(--turquoise)",
  PENDING: "#f59e0b",
  CONFIRMED: "var(--primary)",
  COMPLETED: "#10b981",
  CANCELLED: "var(--destructive)",
  NO_SHOW: "#737373",
};

export const APPOINTMENT_STATUSES: AppointmentStatus[] = [
  "NEW",
  "PENDING",
  "CONFIRMED",
  "COMPLETED",
  "CANCELLED",
  "NO_SHOW",
];
