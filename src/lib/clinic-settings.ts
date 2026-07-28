import "server-only";
import { prisma } from "@/lib/prisma";
import {
  DEFAULT_CLINIC_SETTINGS,
  DEFAULT_WORKING_HOURS,
  isValidWorkingHours,
  type ClinicSettingsData,
} from "@/lib/clinic-settings-types";

export type { ClinicSettingsData, WorkingHourEntry } from "@/lib/clinic-settings-types";
export { DEFAULT_CLINIC_SETTINGS, DEFAULT_WORKING_HOURS } from "@/lib/clinic-settings-types";

export async function getClinicSettings(): Promise<ClinicSettingsData> {
  const row = await prisma.clinicSettings.findUnique({ where: { id: 1 } });

  if (!row) return DEFAULT_CLINIC_SETTINGS;

  return {
    clinicName: row.clinicName || DEFAULT_CLINIC_SETTINGS.clinicName,
    doctorName: row.doctorName || DEFAULT_CLINIC_SETTINGS.doctorName,
    doctorTitle: DEFAULT_CLINIC_SETTINGS.doctorTitle,
    clinicDescription: row.clinicDescription || DEFAULT_CLINIC_SETTINGS.clinicDescription,
    licenseNumber: row.licenseNumber || "",
    logoUrl: row.logoUrl || "",
    faviconUrl: row.faviconUrl || "",
    heroImageUrl: row.heroImageUrl || "",
    doctorPhotoUrl: row.doctorPhotoUrl || "",
    primaryColor: row.primaryColor || "",
    secondaryColor: row.secondaryColor || "",
    phone: row.phone || DEFAULT_CLINIC_SETTINGS.phone,
    whatsapp: row.whatsapp || DEFAULT_CLINIC_SETTINGS.whatsapp,
    email: row.email || DEFAULT_CLINIC_SETTINGS.email,
    website: row.website || "",
    country: row.country || DEFAULT_CLINIC_SETTINGS.country,
    city: row.city || DEFAULT_CLINIC_SETTINGS.city,
    address: row.address || DEFAULT_CLINIC_SETTINGS.address,
    googleMapsUrl: row.googleMapsUrl || "",
    workingHours: isValidWorkingHours(row.workingHours)
      ? row.workingHours
      : DEFAULT_WORKING_HOURS,
    facebookUrl: row.facebookUrl || "",
    instagramUrl: row.instagramUrl || "",
    tiktokUrl: row.tiktokUrl || "",
    xUrl: row.xUrl || "",
    linkedinUrl: row.linkedinUrl || "",
    youtubeUrl: row.youtubeUrl || "",
  };
}
