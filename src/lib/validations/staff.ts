import { z } from "zod";

const phoneRegex = /^[0-9+\-\s]{7,20}$/;

const optionalPhone = z
  .union([z.literal(""), z.string().trim().regex(phoneRegex, "رقم الهاتف غير صحيح")])
  .optional();

export const strongPasswordSchema = z
  .string()
  .min(8, "كلمة المرور يجب ألا تقل عن 8 أحرف")
  .regex(/[a-z]/, "يجب أن تحتوي كلمة المرور على حرف صغير على الأقل")
  .regex(/[A-Z]/, "يجب أن تحتوي كلمة المرور على حرف كبير على الأقل")
  .regex(/[0-9]/, "يجب أن تحتوي كلمة المرور على رقم على الأقل");

export const staffRoleSchema = z.enum([
  "DOCTOR",
  "RECEPTIONIST",
  "ASSISTANT",
  "HYGIENIST",
  "ACCOUNTANT",
  "ADMIN",
]);

export const createStaffSchema = z.object({
  fullName: z.string().trim().min(3, "الاسم الكامل يجب أن يتكون من 3 أحرف على الأقل"),
  email: z.string().trim().email("بريد إلكتروني غير صحيح"),
  phone: optionalPhone,
  role: staffRoleSchema,
  jobTitle: z.string().trim().max(100).optional(),
  notes: z.string().trim().max(1000).optional(),
  hireDate: z.string().trim().optional(),
  avatarUrl: z.union([z.literal(""), z.string().trim().url()]).optional(),
  password: strongPasswordSchema,
});

export type CreateStaffInput = z.infer<typeof createStaffSchema>;

export const updateStaffSchema = z.object({
  fullName: z.string().trim().min(3, "الاسم الكامل يجب أن يتكون من 3 أحرف على الأقل"),
  email: z.string().trim().email("بريد إلكتروني غير صحيح"),
  phone: optionalPhone,
  role: staffRoleSchema,
  jobTitle: z.string().trim().max(100).optional(),
  notes: z.string().trim().max(1000).optional(),
  hireDate: z.string().trim().optional(),
  avatarUrl: z.union([z.literal(""), z.string().trim().url()]).optional(),
  isActive: z.boolean(),
});

export type UpdateStaffInput = z.infer<typeof updateStaffSchema>;

export const resetPasswordSchema = z.object({
  password: strongPasswordSchema,
});
