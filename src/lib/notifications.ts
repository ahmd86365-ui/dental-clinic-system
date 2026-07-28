import {
  CalendarCheck,
  CalendarClock,
  CalendarPlus,
  CalendarX,
  ClipboardList,
  Receipt,
  Settings,
  UserCog,
  UserPlus,
  Wallet,
  type LucideIcon,
} from "lucide-react";
import { hasPermission, type Permission } from "@/lib/auth/permissions";
import type { NotificationPriority, NotificationType, StaffRole } from "@/generated/prisma/client";

export const NOTIFICATION_TYPE_LABELS: Record<NotificationType, string> = {
  APPOINTMENT_CREATED: "موعد جديد",
  APPOINTMENT_CANCELLED: "إلغاء موعد",
  APPOINTMENT_RESCHEDULED: "تعديل موعد",
  APPOINTMENT_COMPLETED: "اكتمال موعد",
  PATIENT_CREATED: "مريض جديد",
  INVOICE_CREATED: "فاتورة جديدة",
  PAYMENT_RECEIVED: "دفعة مستلمة",
  TREATMENT_PLAN_CREATED: "خطة علاج جديدة",
  STAFF_CREATED: "موظف جديد",
  CLINIC_SETTINGS_UPDATED: "تحديث إعدادات العيادة",
};

export const NOTIFICATION_TYPE_ICONS: Record<NotificationType, LucideIcon> = {
  APPOINTMENT_CREATED: CalendarPlus,
  APPOINTMENT_CANCELLED: CalendarX,
  APPOINTMENT_RESCHEDULED: CalendarClock,
  APPOINTMENT_COMPLETED: CalendarCheck,
  PATIENT_CREATED: UserPlus,
  INVOICE_CREATED: Receipt,
  PAYMENT_RECEIVED: Wallet,
  TREATMENT_PLAN_CREATED: ClipboardList,
  STAFF_CREATED: UserCog,
  CLINIC_SETTINGS_UPDATED: Settings,
};

export const NOTIFICATION_PRIORITY_LABELS: Record<NotificationPriority, string> = {
  LOW: "منخفضة",
  MEDIUM: "متوسطة",
  HIGH: "عالية",
  CRITICAL: "حرجة",
};

export const NOTIFICATION_PRIORITY_BADGE_CLASSES: Record<NotificationPriority, string> = {
  LOW: "bg-muted text-muted-foreground",
  MEDIUM: "bg-primary/10 text-primary",
  HIGH: "bg-amber-500/15 text-amber-700 dark:text-amber-400",
  CRITICAL: "bg-destructive/10 text-destructive",
};

/** Which base permission is required to see a notification of this type. */
const NOTIFICATION_TYPE_PERMISSION: Record<NotificationType, Permission> = {
  APPOINTMENT_CREATED: "viewAppointments",
  APPOINTMENT_CANCELLED: "viewAppointments",
  APPOINTMENT_RESCHEDULED: "viewAppointments",
  APPOINTMENT_COMPLETED: "viewAppointments",
  PATIENT_CREATED: "viewPatients",
  INVOICE_CREATED: "viewBilling",
  PAYMENT_RECEIVED: "viewBilling",
  TREATMENT_PLAN_CREATED: "viewMedicalRecord",
  STAFF_CREATED: "manageStaff",
  CLINIC_SETTINGS_UPDATED: "viewClinicSettings",
};

export const ALL_NOTIFICATION_TYPES = Object.keys(
  NOTIFICATION_TYPE_LABELS
) as NotificationType[];

// Receptionist gets an explicit, narrower allow-list per spec ("only
// appointment and patient notifications") — deliberately not the generic
// permission mapping below, since Receptionist actually holds viewBilling and
// viewMedicalRecord elsewhere in the app but must NOT see billing/clinical
// notifications.
const RECEPTIONIST_ALLOWED_TYPES: NotificationType[] = [
  "APPOINTMENT_CREATED",
  "APPOINTMENT_CANCELLED",
  "APPOINTMENT_RESCHEDULED",
  "APPOINTMENT_COMPLETED",
  "PATIENT_CREATED",
];

/**
 * Doctor sees everything. Receptionist sees only the explicit list above.
 * Every other role (Admin/Assistant/Hygienist/Accountant) sees only the
 * notification types whose required permission they actually hold — which
 * today is an empty or near-empty set for those roles, matching their
 * intentionally minimal permissions elsewhere (see permissions.ts).
 */
export function getVisibleNotificationTypes(role: StaffRole): NotificationType[] {
  if (role === "DOCTOR") return ALL_NOTIFICATION_TYPES;
  if (role === "RECEPTIONIST") return RECEPTIONIST_ALLOWED_TYPES;
  return ALL_NOTIFICATION_TYPES.filter((type) =>
    hasPermission(role, NOTIFICATION_TYPE_PERMISSION[type])
  );
}
