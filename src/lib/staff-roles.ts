import type { StaffRole } from "@/generated/prisma/client";

export const STAFF_ROLE_LABELS: Record<StaffRole, string> = {
  DOCTOR: "طبيب",
  RECEPTIONIST: "موظف استقبال",
  ASSISTANT: "مساعد طبي",
  HYGIENIST: "أخصائي نظافة أسنان",
  ACCOUNTANT: "محاسب",
  ADMIN: "مدير النظام",
};

export const STAFF_ROLE_OPTIONS: { value: StaffRole; label: string }[] = (
  Object.keys(STAFF_ROLE_LABELS) as StaffRole[]
).map((value) => ({ value, label: STAFF_ROLE_LABELS[value] }));
