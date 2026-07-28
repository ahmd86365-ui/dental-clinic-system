"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { getCurrentStaff } from "@/lib/auth/current-staff";
import { assertPermission } from "@/lib/auth/permissions";
import { logActivity } from "@/lib/activity-log";
import {
  createDoctorSchema,
  updateDoctorSchema,
  type CreateDoctorInput,
  type UpdateDoctorInput,
} from "@/lib/validations/doctor";

type ActionResult = { success: true } | { success: false; error: string };

export async function createDoctor(input: CreateDoctorInput): Promise<ActionResult> {
  const staff = await getCurrentStaff();

  try {
    assertPermission(staff.role, "manageStaff");
  } catch {
    return { success: false, error: "لا تملك صلاحية إضافة أطباء" };
  }

  const parsed = createDoctorSchema.safeParse(input);
  if (!parsed.success) {
    return { success: false, error: parsed.error.issues[0]?.message ?? "بيانات غير صحيحة" };
  }
  const data = parsed.data;

  if (data.phone) {
    const existing = await prisma.doctor.findUnique({ where: { phone: data.phone } });
    if (existing) return { success: false, error: "يوجد طبيب مسجّل بهذا الهاتف مسبقًا" };
  }

  if (data.email) {
    const existing = await prisma.doctor.findUnique({ where: { email: data.email } });
    if (existing) return { success: false, error: "يوجد طبيب مسجّل بهذا البريد الإلكتروني مسبقًا" };
  }

  const created = await prisma.doctor.create({
    data: {
      firstName: data.firstName,
      lastName: data.lastName,
      specialty: data.specialty || undefined,
      phone: data.phone || undefined,
      email: data.email || undefined,
    },
  });

  await logActivity(staff, {
    action: "CREATE_DOCTOR",
    entityType: "Doctor",
    entityId: created.id,
    description: `تم إضافة طبيب جديد: ${data.firstName} ${data.lastName}`,
  });

  revalidatePath("/admin/doctors");
  revalidatePath("/admin/appointments");
  return { success: true };
}

export async function updateDoctor(
  id: string,
  input: UpdateDoctorInput
): Promise<ActionResult> {
  const staff = await getCurrentStaff();

  try {
    assertPermission(staff.role, "manageStaff");
  } catch {
    return { success: false, error: "لا تملك صلاحية تعديل الأطباء" };
  }

  const parsed = updateDoctorSchema.safeParse(input);
  if (!parsed.success) {
    return { success: false, error: parsed.error.issues[0]?.message ?? "بيانات غير صحيحة" };
  }
  const data = parsed.data;

  const target = await prisma.doctor.findUnique({ where: { id } });
  if (!target) return { success: false, error: "الطبيب غير موجود" };

  if (data.phone) {
    const existing = await prisma.doctor.findUnique({ where: { phone: data.phone } });
    if (existing && existing.id !== id) {
      return { success: false, error: "يوجد طبيب مسجّل بهذا الهاتف مسبقًا" };
    }
  }

  if (data.email) {
    const existing = await prisma.doctor.findUnique({ where: { email: data.email } });
    if (existing && existing.id !== id) {
      return { success: false, error: "يوجد طبيب مسجّل بهذا البريد الإلكتروني مسبقًا" };
    }
  }

  await prisma.doctor.update({
    where: { id },
    data: {
      firstName: data.firstName,
      lastName: data.lastName,
      specialty: data.specialty || null,
      phone: data.phone || null,
      email: data.email || null,
      isActive: data.isActive,
    },
  });

  await logActivity(staff, {
    action: "UPDATE_DOCTOR",
    entityType: "Doctor",
    entityId: id,
    description: `تم تعديل بيانات الطبيب: ${data.firstName} ${data.lastName}`,
  });

  revalidatePath("/admin/doctors");
  revalidatePath(`/admin/doctors/${id}`);
  revalidatePath("/admin/appointments");
  return { success: true };
}

export async function toggleDoctorActive(id: string, isActive: boolean): Promise<ActionResult> {
  const staff = await getCurrentStaff();

  try {
    assertPermission(staff.role, "manageStaff");
  } catch {
    return { success: false, error: "لا تملك صلاحية تعديل حالة الأطباء" };
  }

  const target = await prisma.doctor.findUnique({ where: { id } });
  if (!target) return { success: false, error: "الطبيب غير موجود" };

  await prisma.doctor.update({ where: { id }, data: { isActive } });

  await logActivity(staff, {
    action: isActive ? "ENABLE_DOCTOR" : "DISABLE_DOCTOR",
    entityType: "Doctor",
    entityId: id,
    description: `تم ${isActive ? "تفعيل" : "تعطيل"} الطبيب: ${target.firstName} ${target.lastName}`,
  });

  revalidatePath("/admin/doctors");
  revalidatePath(`/admin/doctors/${id}`);
  revalidatePath("/admin/appointments");
  return { success: true };
}
