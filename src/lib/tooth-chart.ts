import type { ToothConditionType } from "@/generated/prisma/client";

export const UPPER_ROW = [18, 17, 16, 15, 14, 13, 12, 11, 21, 22, 23, 24, 25, 26, 27, 28];
export const LOWER_ROW = [48, 47, 46, 45, 44, 43, 42, 41, 31, 32, 33, 34, 35, 36, 37, 38];
export const ALL_TEETH = [...UPPER_ROW, ...LOWER_ROW];

export const TOOTH_CONDITION_LABELS: Record<ToothConditionType, string> = {
  HEALTHY: "سليم",
  MISSING: "مفقود",
  CARIES: "تسوّس",
  ROOT_CANAL: "علاج عصب",
  FILLING: "حشوة",
  CROWN: "تاج",
  BRIDGE: "جسر",
  IMPLANT: "زراعة",
  EXTRACTION: "خلع",
  FRACTURE: "كسر",
  NEEDS_TREATMENT: "يحتاج علاج",
  COMPLETED_TREATMENT: "علاج مكتمل",
};

export const TOOTH_CONDITION_COLORS: Record<ToothConditionType, string> = {
  HEALTHY: "#ffffff",
  MISSING: "#d1d5db",
  CARIES: "#dc2626",
  ROOT_CANAL: "#a855f7",
  FILLING: "#f59e0b",
  CROWN: "#3b82f6",
  BRIDGE: "#6366f1",
  IMPLANT: "#14b8a6",
  EXTRACTION: "#6b7280",
  FRACTURE: "#ea580c",
  NEEDS_TREATMENT: "#eab308",
  COMPLETED_TREATMENT: "#22c55e",
};

export const TOOTH_CONDITIONS: ToothConditionType[] = [
  "HEALTHY",
  "MISSING",
  "CARIES",
  "ROOT_CANAL",
  "FILLING",
  "CROWN",
  "BRIDGE",
  "IMPLANT",
  "EXTRACTION",
  "FRACTURE",
  "NEEDS_TREATMENT",
  "COMPLETED_TREATMENT",
];
