"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { getCurrentStaff } from "@/lib/auth/current-staff";
import { assertPermission } from "@/lib/auth/permissions";
import { logActivity } from "@/lib/activity-log";
import { createNotification } from "@/lib/create-notification";
import { createAdminClient } from "@/lib/supabase/admin";
import { STAFF_ROLE_LABELS } from "@/lib/staff-roles";
import {
  createStaffSchema,
  resetPasswordSchema,
  updateStaffSchema,
  type CreateStaffInput,
  type UpdateStaffInput,
} from "@/lib/validations/staff";

type ActionResult = { success: true } | { success: false; error: string };

const STORAGE_BUCKET = "clinic-assets";
const MAX_AVATAR_SIZE = 5 * 1024 * 1024;
const ALLOWED_MIME_TYPES = new Set(["image/jpeg", "image/png", "image/webp"]);

function parseHireDate(value: string | undefined): Date | undefined {
  if (!value) return undefined;
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? undefined : date;
}

export async function createStaff(input: CreateStaffInput): Promise<ActionResult> {
  const staff = await getCurrentStaff();

  try {
    assertPermission(staff.role, "manageStaff");
  } catch {
    return { success: false, error: "لا تملك صلاحية إنشاء موظفين" };
  }

  const parsed = createStaffSchema.safeParse(input);
  if (!parsed.success) {
    return { success: false, error: parsed.error.issues[0]?.message ?? "بيانات غير صحيحة" };
  }
  const data = parsed.data;

  const existing = await prisma.staff.findUnique({ where: { email: data.email } });
  if (existing) return { success: false, error: "يوجد موظف مسجّل بهذا البريد الإلكتروني مسبقًا" };

  const admin = createAdminClient();
  const { data: created, error } = await admin.auth.admin.createUser({
    email: data.email,
    password: data.password,
    email_confirm: true,
  });

  if (error || !created.user) {
    return { success: false, error: error?.message ?? "تعذّر إنشاء حساب الدخول" };
  }

  await prisma.staff.create({
    data: {
      id: created.user.id,
      fullName: data.fullName,
      email: data.email,
      phone: data.phone || undefined,
      role: data.role,
      jobTitle: data.jobTitle || undefined,
      notes: data.notes || undefined,
      hireDate: parseHireDate(data.hireDate),
      avatarUrl: data.avatarUrl || undefined,
    },
  });

  await logActivity(staff, {
    action: "CREATE_STAFF",
    entityType: "Staff",
    entityId: created.user.id,
    description: `تم إنشاء حساب موظف جديد: ${data.fullName}`,
  });

  await createNotification({
    type: "STAFF_CREATED",
    priority: "HIGH",
    title: "موظف جديد",
    message: `تم إنشاء حساب موظف جديد: ${data.fullName} (${STAFF_ROLE_LABELS[data.role]})`,
    link: `/admin/staff/${created.user.id}`,
  });

  revalidatePath("/admin/staff");
  return { success: true };
}

export async function updateStaff(
  id: string,
  input: UpdateStaffInput
): Promise<ActionResult> {
  const staff = await getCurrentStaff();

  try {
    assertPermission(staff.role, "manageStaff");
  } catch {
    return { success: false, error: "لا تملك صلاحية تعديل الموظفين" };
  }

  const parsed = updateStaffSchema.safeParse(input);
  if (!parsed.success) {
    return { success: false, error: parsed.error.issues[0]?.message ?? "بيانات غير صحيحة" };
  }
  const data = parsed.data;

  const target = await prisma.staff.findUnique({ where: { id } });
  if (!target) return { success: false, error: "الموظف غير موجود" };

  if (id === staff.id && (data.role !== target.role || !data.isActive)) {
    return { success: false, error: "لا يمكنك تعديل دورك الوظيفي أو تعطيل حسابك الخاص" };
  }

  if (data.email !== target.email) {
    const existing = await prisma.staff.findUnique({ where: { email: data.email } });
    if (existing && existing.id !== id) {
      return { success: false, error: "يوجد موظف مسجّل بهذا البريد الإلكتروني مسبقًا" };
    }

    const admin = createAdminClient();
    const { error } = await admin.auth.admin.updateUserById(id, { email: data.email });
    if (error) {
      return { success: false, error: "تعذّر تحديث البريد الإلكتروني لحساب الدخول" };
    }
  }

  await prisma.staff.update({
    where: { id },
    data: {
      fullName: data.fullName,
      email: data.email,
      phone: data.phone || null,
      role: data.role,
      jobTitle: data.jobTitle || null,
      notes: data.notes || null,
      hireDate: parseHireDate(data.hireDate) ?? null,
      avatarUrl: data.avatarUrl || null,
      isActive: data.isActive,
    },
  });

  await logActivity(staff, {
    action: "UPDATE_STAFF",
    entityType: "Staff",
    entityId: id,
    description: `تم تعديل بيانات الموظف: ${data.fullName}`,
  });

  revalidatePath("/admin/staff");
  revalidatePath(`/admin/staff/${id}`);
  return { success: true };
}

export async function toggleStaffActive(id: string, isActive: boolean): Promise<ActionResult> {
  const staff = await getCurrentStaff();

  try {
    assertPermission(staff.role, "manageStaff");
  } catch {
    return { success: false, error: "لا تملك صلاحية تعديل حالة الموظفين" };
  }

  if (id === staff.id && !isActive) {
    return { success: false, error: "لا يمكنك تعطيل حسابك الخاص" };
  }

  const target = await prisma.staff.findUnique({ where: { id } });
  if (!target) return { success: false, error: "الموظف غير موجود" };

  await prisma.staff.update({ where: { id }, data: { isActive } });

  await logActivity(staff, {
    action: isActive ? "ENABLE_STAFF" : "DISABLE_STAFF",
    entityType: "Staff",
    entityId: id,
    description: `تم ${isActive ? "تفعيل" : "تعطيل"} حساب الموظف: ${target.fullName}`,
  });

  revalidatePath("/admin/staff");
  revalidatePath(`/admin/staff/${id}`);
  return { success: true };
}

export async function resetStaffPassword(
  id: string,
  input: { password: string }
): Promise<ActionResult> {
  const staff = await getCurrentStaff();

  try {
    assertPermission(staff.role, "manageStaff");
  } catch {
    return { success: false, error: "لا تملك صلاحية إعادة تعيين كلمات المرور" };
  }

  const parsed = resetPasswordSchema.safeParse(input);
  if (!parsed.success) {
    return { success: false, error: parsed.error.issues[0]?.message ?? "كلمة مرور غير صحيحة" };
  }

  const target = await prisma.staff.findUnique({ where: { id } });
  if (!target) return { success: false, error: "الموظف غير موجود" };

  const admin = createAdminClient();
  const { error } = await admin.auth.admin.updateUserById(id, {
    password: parsed.data.password,
  });

  if (error) {
    return { success: false, error: "تعذّر إعادة تعيين كلمة المرور" };
  }

  await logActivity(staff, {
    action: "RESET_STAFF_PASSWORD",
    entityType: "Staff",
    entityId: id,
    description: `تمت إعادة تعيين كلمة مرور الموظف: ${target.fullName}`,
  });

  return { success: true };
}

export async function deleteStaff(id: string): Promise<ActionResult> {
  const staff = await getCurrentStaff();

  try {
    assertPermission(staff.role, "manageStaff");
  } catch {
    return { success: false, error: "لا تملك صلاحية حذف الموظفين" };
  }

  if (id === staff.id) {
    return { success: false, error: "لا يمكنك حذف حسابك الخاص" };
  }

  const target = await prisma.staff.findUnique({ where: { id } });
  if (!target) return { success: false, error: "الموظف غير موجود" };

  const admin = createAdminClient();
  await admin.auth.admin.deleteUser(id);
  await prisma.staff.delete({ where: { id } });

  await logActivity(staff, {
    action: "DELETE_STAFF",
    entityType: "Staff",
    entityId: id,
    description: `تم حذف الموظف: ${target.fullName}`,
  });

  revalidatePath("/admin/staff");
  return { success: true };
}

export async function uploadStaffAvatar(
  formData: FormData
): Promise<{ success: true; url: string } | { success: false; error: string }> {
  const staff = await getCurrentStaff();

  try {
    assertPermission(staff.role, "manageStaff");
  } catch {
    return { success: false, error: "لا تملك صلاحية رفع الصور" };
  }

  const file = formData.get("file");
  if (!(file instanceof File)) {
    return { success: false, error: "ملف غير صحيح" };
  }

  if (file.size > MAX_AVATAR_SIZE) {
    return { success: false, error: "حجم الصورة يتجاوز 5 ميغابايت" };
  }

  if (!ALLOWED_MIME_TYPES.has(file.type)) {
    return { success: false, error: "نوع الملف غير مدعوم" };
  }

  const admin = createAdminClient();
  const extension = file.name.split(".").pop() || "png";
  const storagePath = `staff-avatars/${crypto.randomUUID()}.${extension}`;

  const { error: uploadError } = await admin.storage
    .from(STORAGE_BUCKET)
    .upload(storagePath, file, { contentType: file.type, upsert: true });

  if (uploadError) {
    return { success: false, error: "تعذّر رفع الصورة، الرجاء المحاولة مرة أخرى" };
  }

  const { data } = admin.storage.from(STORAGE_BUCKET).getPublicUrl(storagePath);
  return { success: true, url: data.publicUrl };
}
