import { z } from "zod";

const phoneRegex = /^[0-9+\-\s]{7,20}$/;

const optionalPhone = z
  .union([z.literal(""), z.string().trim().regex(phoneRegex, "رقم الهاتف غير صحيح")])
  .optional();

const optionalEmail = z
  .union([z.literal(""), z.string().trim().email("بريد إلكتروني غير صحيح")])
  .optional();

export const createDoctorSchema = z.object({
  firstName: z.string().trim().min(2, "الاسم الأول يجب أن يتكون من حرفين على الأقل"),
  lastName: z.string().trim().min(2, "اسم العائلة يجب أن يتكون من حرفين على الأقل"),
  specialty: z.string().trim().max(150).optional(),
  phone: optionalPhone,
  email: optionalEmail,
});

export type CreateDoctorInput = z.infer<typeof createDoctorSchema>;

export const updateDoctorSchema = createDoctorSchema.extend({
  isActive: z.boolean(),
});

export type UpdateDoctorInput = z.infer<typeof updateDoctorSchema>;
