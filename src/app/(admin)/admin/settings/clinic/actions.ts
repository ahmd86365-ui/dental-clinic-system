"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { getCurrentStaff } from "@/lib/auth/current-staff";
import { assertPermission } from "@/lib/auth/permissions";
import { logActivity } from "@/lib/activity-log";
import { createNotification } from "@/lib/create-notification";
import { createAdminClient } from "@/lib/supabase/admin";
import {
  clinicSettingsSchema,
  type ClinicSettingsFormValues,
} from "@/lib/validations/clinic-settings";

type ActionResult = { success: true } | { success: false; error: string };

const STORAGE_BUCKET = "clinic-assets";
const MAX_FILE_SIZE = 5 * 1024 * 1024;
const ALLOWED_MIME_TYPES = new Set(["image/jpeg", "image/png", "image/webp", "image/x-icon", "image/vnd.microsoft.icon"]);

function revalidateEverywhere() {
  revalidatePath("/", "layout");
}

export async function updateClinicSettings(
  input: ClinicSettingsFormValues
): Promise<ActionResult> {
  const staff = await getCurrentStaff();

  try {
    assertPermission(staff.role, "manageSettings");
  } catch {
    return { success: false, error: "لا تملك صلاحية تعديل إعدادات العيادة" };
  }

  const parsed = clinicSettingsSchema.safeParse(input);
  if (!parsed.success) {
    return {
      success: false,
      error: parsed.error.issues[0]?.message ?? "الرجاء التحقق من البيانات",
    };
  }
  const data = parsed.data;

  await prisma.clinicSettings.upsert({
    where: { id: 1 },
    create: {
      id: 1,
      clinicName: data.clinicName,
      doctorName: data.doctorName,
      clinicDescription: data.clinicDescription || undefined,
      licenseNumber: data.licenseNumber || undefined,
      logoUrl: data.logoUrl || undefined,
      faviconUrl: data.faviconUrl || undefined,
      heroImageUrl: data.heroImageUrl || undefined,
      doctorPhotoUrl: data.doctorPhotoUrl || undefined,
      primaryColor: data.primaryColor || undefined,
      secondaryColor: data.secondaryColor || undefined,
      phone: data.phone,
      whatsapp: data.whatsapp || undefined,
      email: data.email || undefined,
      website: data.website || undefined,
      country: data.country || undefined,
      city: data.city || undefined,
      address: data.address || undefined,
      googleMapsUrl: data.googleMapsUrl || undefined,
      workingHours: data.workingHours,
      facebookUrl: data.facebookUrl || undefined,
      instagramUrl: data.instagramUrl || undefined,
      tiktokUrl: data.tiktokUrl || undefined,
      xUrl: data.xUrl || undefined,
      linkedinUrl: data.linkedinUrl || undefined,
      youtubeUrl: data.youtubeUrl || undefined,
    },
    update: {
      clinicName: data.clinicName,
      doctorName: data.doctorName,
      clinicDescription: data.clinicDescription || null,
      licenseNumber: data.licenseNumber || null,
      logoUrl: data.logoUrl || null,
      faviconUrl: data.faviconUrl || null,
      heroImageUrl: data.heroImageUrl || null,
      doctorPhotoUrl: data.doctorPhotoUrl || null,
      primaryColor: data.primaryColor || null,
      secondaryColor: data.secondaryColor || null,
      phone: data.phone,
      whatsapp: data.whatsapp || null,
      email: data.email || null,
      website: data.website || null,
      country: data.country || null,
      city: data.city || null,
      address: data.address || null,
      googleMapsUrl: data.googleMapsUrl || null,
      workingHours: data.workingHours,
      facebookUrl: data.facebookUrl || null,
      instagramUrl: data.instagramUrl || null,
      tiktokUrl: data.tiktokUrl || null,
      xUrl: data.xUrl || null,
      linkedinUrl: data.linkedinUrl || null,
      youtubeUrl: data.youtubeUrl || null,
    },
  });

  await logActivity(staff, {
    action: "UPDATE_CLINIC_SETTINGS",
    entityType: "ClinicSettings",
    description: "تم تحديث إعدادات هوية العيادة",
  });

  await createNotification({
    type: "CLINIC_SETTINGS_UPDATED",
    priority: "LOW",
    title: "تحديث إعدادات العيادة",
    message: `قام ${staff.fullName} بتحديث إعدادات هوية العيادة`,
    link: "/admin/settings/clinic",
  });

  revalidateEverywhere();
  return { success: true };
}

export type ClinicAssetKind = "logo" | "favicon" | "hero" | "doctorPhoto";

export async function uploadClinicAsset(
  formData: FormData
): Promise<{ success: true; url: string } | { success: false; error: string }> {
  const staff = await getCurrentStaff();

  try {
    assertPermission(staff.role, "manageSettings");
  } catch {
    return { success: false, error: "لا تملك صلاحية رفع الملفات" };
  }

  const kind = String(formData.get("kind") || "") as ClinicAssetKind;
  const file = formData.get("file");

  if (!(file instanceof File)) {
    return { success: false, error: "ملف غير صحيح" };
  }

  if (file.size > MAX_FILE_SIZE) {
    return { success: false, error: "حجم الملف يتجاوز 5 ميغابايت" };
  }

  if (!ALLOWED_MIME_TYPES.has(file.type)) {
    return { success: false, error: "نوع الملف غير مدعوم" };
  }

  const admin = createAdminClient();
  const extension = file.name.split(".").pop() || "png";
  const storagePath = `${kind}/${crypto.randomUUID()}.${extension}`;

  const { error: uploadError } = await admin.storage
    .from(STORAGE_BUCKET)
    .upload(storagePath, file, { contentType: file.type, upsert: true });

  if (uploadError) {
    return { success: false, error: "تعذّر رفع الملف، الرجاء المحاولة مرة أخرى" };
  }

  const { data } = admin.storage.from(STORAGE_BUCKET).getPublicUrl(storagePath);

  await logActivity(staff, {
    action: "UPLOAD_CLINIC_ASSET",
    entityType: "ClinicSettings",
    description: `تم رفع ملف (${kind}) لهوية العيادة`,
  });

  return { success: true, url: data.publicUrl };
}
