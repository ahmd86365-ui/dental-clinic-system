import { z } from "zod";

const optionalUrl = z
  .union([z.literal(""), z.string().trim().url("رابط غير صحيح")])
  .optional();

const optionalEmail = z
  .union([z.literal(""), z.string().trim().email("بريد إلكتروني غير صحيح")])
  .optional();

const timeRegex = /^([01]\d|2[0-3]):[0-5]\d$/;

export const workingHourEntrySchema = z.object({
  day: z.number().int().min(0).max(6),
  open: z.string().regex(timeRegex, "وقت غير صحيح"),
  close: z.string().regex(timeRegex, "وقت غير صحيح"),
  closed: z.boolean(),
});

export const clinicSettingsSchema = z.object({
  // General
  clinicName: z.string().trim().min(2, "اسم العيادة مطلوب"),
  doctorName: z.string().trim().min(2, "اسم الطبيب مطلوب"),
  clinicDescription: z.string().trim().max(500).optional(),
  licenseNumber: z.string().trim().max(100).optional(),

  // Branding
  logoUrl: optionalUrl,
  faviconUrl: optionalUrl,
  heroImageUrl: optionalUrl,
  doctorPhotoUrl: optionalUrl,
  primaryColor: z
    .union([z.literal(""), z.string().regex(/^#[0-9a-fA-F]{6}$/, "لون غير صحيح")])
    .optional(),
  secondaryColor: z
    .union([z.literal(""), z.string().regex(/^#[0-9a-fA-F]{6}$/, "لون غير صحيح")])
    .optional(),

  // Contact
  phone: z.string().trim().min(7, "رقم الهاتف مطلوب"),
  whatsapp: z.string().trim().optional(),
  email: optionalEmail,
  website: optionalUrl,

  // Address
  country: z.string().trim().optional(),
  city: z.string().trim().optional(),
  address: z.string().trim().optional(),
  googleMapsUrl: optionalUrl,

  // Working hours
  workingHours: z.array(workingHourEntrySchema).length(7),

  // Social
  facebookUrl: optionalUrl,
  instagramUrl: optionalUrl,
  tiktokUrl: optionalUrl,
  xUrl: optionalUrl,
  linkedinUrl: optionalUrl,
  youtubeUrl: optionalUrl,
});

export type ClinicSettingsFormValues = z.infer<typeof clinicSettingsSchema>;
