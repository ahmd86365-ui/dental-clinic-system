import type { BloodType, PatientFileType, SmokingStatus } from "@/generated/prisma/client";

export const SMOKING_STATUS_LABELS: Record<SmokingStatus, string> = {
  NON_SMOKER: "غير مدخّن",
  SMOKER: "مدخّن",
  FORMER_SMOKER: "مدخّن سابق",
};

export const BLOOD_TYPE_LABELS: Record<BloodType, string> = {
  A_POS: "A+",
  A_NEG: "A-",
  B_POS: "B+",
  B_NEG: "B-",
  AB_POS: "AB+",
  AB_NEG: "AB-",
  O_POS: "O+",
  O_NEG: "O-",
};

export const PATIENT_FILE_TYPE_LABELS: Record<PatientFileType, string> = {
  XRAY: "أشعة",
  CLINICAL_PHOTO: "صورة سريرية",
  PDF: "ملف PDF",
  OTHER: "ملف آخر",
};
