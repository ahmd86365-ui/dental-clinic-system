import { z } from "zod";

const listField = z
  .union([z.array(z.string()), z.string()])
  .optional()
  .transform((value): string[] => {
    if (!value) return [];
    if (Array.isArray(value)) return value.map((v) => v.trim()).filter(Boolean);
    return value
      .split(",")
      .map((v) => v.trim())
      .filter(Boolean);
  });

export const medicalHistorySchema = z.object({
  allergies: listField,
  chronicDiseases: listField,
  currentMedications: listField,
  previousSurgeries: listField,
  smokingStatus: z.enum(["NON_SMOKER", "SMOKER", "FORMER_SMOKER"]).optional(),
  isPregnant: z.boolean().optional(),
  bloodType: z
    .enum(["A_POS", "A_NEG", "B_POS", "B_NEG", "AB_POS", "AB_NEG", "O_POS", "O_NEG"])
    .optional(),
  medicalNotes: z.string().trim().max(2000).optional(),
});

export type MedicalHistoryInput = z.input<typeof medicalHistorySchema>;
export type MedicalHistoryValues = z.infer<typeof medicalHistorySchema>;

export const dentalVisitSchema = z.object({
  visitDate: z.string().min(1, "الرجاء اختيار تاريخ الزيارة"),
  chiefComplaint: z.string().trim().max(500).optional(),
  diagnosis: z.string().trim().max(1000).optional(),
  treatmentPlan: z.string().trim().max(1000).optional(),
  proceduresPerformed: listField,
  prescriptions: z.string().trim().max(1000).optional(),
  clinicalNotes: z.string().trim().max(2000).optional(),
  followUpNotes: z.string().trim().max(1000).optional(),
  cost: z.coerce.number().min(0).optional(),
});

export type DentalVisitInput = z.input<typeof dentalVisitSchema>;
export type DentalVisitValues = z.infer<typeof dentalVisitSchema>;

export const toothConditionSchema = z.object({
  toothNumber: z.number().int().min(11).max(48),
  condition: z.enum([
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
  ]),
  notes: z.string().trim().max(300).optional(),
});

export type ToothConditionValues = z.infer<typeof toothConditionSchema>;

export const personalInfoSchema = z.object({
  fullName: z.string().trim().min(3),
  phone: z.string().trim().min(7),
  gender: z.enum(["MALE", "FEMALE"]).optional(),
  dateOfBirth: z.string().optional(),
  address: z.string().trim().optional(),
  emergencyContactName: z.string().trim().optional(),
  emergencyContactPhone: z.string().trim().optional(),
});

export type PersonalInfoValues = z.infer<typeof personalInfoSchema>;
