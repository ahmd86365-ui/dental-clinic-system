import type {
  InvoicePaymentStatus,
  PaymentMethod,
  TreatmentItemStatus,
  TreatmentPlanStatus,
  TreatmentPriority,
} from "@/generated/prisma/client";

export const TREATMENT_PLAN_STATUS_LABELS: Record<TreatmentPlanStatus, string> = {
  PLANNED: "مخطَّط",
  IN_PROGRESS: "قيد التنفيذ",
  COMPLETED: "مكتمل",
  CANCELLED: "ملغي",
};

export const TREATMENT_PLAN_STATUS_BADGE_CLASSES: Record<TreatmentPlanStatus, string> = {
  PLANNED: "bg-turquoise/15 text-turquoise-foreground",
  IN_PROGRESS: "bg-amber-500/15 text-amber-700 dark:text-amber-400",
  COMPLETED: "bg-emerald-500/15 text-emerald-700 dark:text-emerald-400",
  CANCELLED: "bg-destructive/10 text-destructive",
};

export const TREATMENT_ITEM_STATUS_LABELS: Record<TreatmentItemStatus, string> = {
  PLANNED: "مخطَّط",
  IN_PROGRESS: "قيد التنفيذ",
  COMPLETED: "مكتمل",
  CANCELLED: "ملغي",
};

export const TREATMENT_PRIORITY_LABELS: Record<TreatmentPriority, string> = {
  LOW: "منخفضة",
  MEDIUM: "متوسطة",
  HIGH: "عالية",
  URGENT: "عاجلة",
};

export const TREATMENT_PRIORITY_BADGE_CLASSES: Record<TreatmentPriority, string> = {
  LOW: "bg-secondary text-secondary-foreground",
  MEDIUM: "bg-primary/10 text-primary",
  HIGH: "bg-amber-500/15 text-amber-700 dark:text-amber-400",
  URGENT: "bg-destructive/10 text-destructive",
};

export const PAYMENT_METHOD_LABELS: Record<PaymentMethod, string> = {
  CASH: "نقدًا",
  CARD: "بطاقة",
  BANK_TRANSFER: "تحويل بنكي",
};

export const PAYMENT_METHOD_CHART_COLORS: Record<PaymentMethod, string> = {
  CASH: "var(--chart-1)",
  CARD: "var(--chart-2)",
  BANK_TRANSFER: "var(--chart-3)",
};

export const INVOICE_PAYMENT_STATUS_LABELS: Record<InvoicePaymentStatus, string> = {
  UNPAID: "غير مدفوعة",
  PARTIALLY_PAID: "مدفوعة جزئيًا",
  PAID: "مدفوعة بالكامل",
};

export const INVOICE_PAYMENT_STATUS_BADGE_CLASSES: Record<InvoicePaymentStatus, string> = {
  UNPAID: "bg-destructive/10 text-destructive",
  PARTIALLY_PAID: "bg-amber-500/15 text-amber-700 dark:text-amber-400",
  PAID: "bg-emerald-500/15 text-emerald-700 dark:text-emerald-400",
};

export const COMMON_PROCEDURES = [
  "استشارة",
  "تنظيف",
  "حشوة",
  "علاج عصب",
  "تاج",
  "جسر",
  "زراعة",
  "خلع",
  "تبييض",
];
