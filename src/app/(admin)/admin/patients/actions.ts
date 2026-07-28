"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { getCurrentStaff } from "@/lib/auth/current-staff";
import { assertPermission } from "@/lib/auth/permissions";
import { logActivity } from "@/lib/activity-log";
import { createNotification } from "@/lib/create-notification";

type ActionResult = { success: true } | { success: false; error: string };

const patientSchema = z.object({
  fullName: z.string().trim().min(3),
  phone: z.string().trim().min(7),
  age: z.coerce.number().int().min(0).max(120).optional(),
  gender: z.enum(["MALE", "FEMALE"]).optional(),
  email: z.union([z.literal(""), z.string().email()]).optional(),
  notes: z.string().trim().optional(),
});

export async function createPatient(
  input: z.infer<typeof patientSchema>
): Promise<ActionResult> {
  const staff = await getCurrentStaff();

  try {
    assertPermission(staff.role, "createPatient");
  } catch {
    return { success: false, error: "لا تملك صلاحية إضافة مريض" };
  }

  const parsed = patientSchema.safeParse(input);
  if (!parsed.success) return { success: false, error: "الرجاء التحقق من البيانات" };
  const data = parsed.data;

  const existing = await prisma.patient.findUnique({ where: { phone: data.phone } });
  if (existing) return { success: false, error: "يوجد مريض مسجّل بهذا الرقم مسبقًا" };

  const patient = await prisma.patient.create({
    data: {
      fullName: data.fullName,
      phone: data.phone,
      age: data.age,
      gender: data.gender,
      email: data.email || undefined,
      notes: data.notes || undefined,
    },
  });

  await logActivity(staff, {
    action: "CREATE_PATIENT",
    entityType: "Patient",
    entityId: patient.id,
    description: `تم إضافة مريض جديد: ${patient.fullName}`,
  });

  await createNotification({
    type: "PATIENT_CREATED",
    priority: "LOW",
    title: "مريض جديد",
    message: `تم إضافة مريض جديد: ${patient.fullName}`,
    link: `/admin/patients/${patient.id}`,
  });

  revalidatePath("/admin/patients");
  return { success: true };
}

export async function updatePatient(
  id: string,
  input: z.infer<typeof patientSchema>
): Promise<ActionResult> {
  const staff = await getCurrentStaff();

  try {
    assertPermission(staff.role, "editPatient");
  } catch {
    return { success: false, error: "لا تملك صلاحية تعديل بيانات المرضى" };
  }

  const parsed = patientSchema.safeParse(input);
  if (!parsed.success) return { success: false, error: "الرجاء التحقق من البيانات" };
  const data = parsed.data;

  const patient = await prisma.patient.findUnique({ where: { id } });
  if (!patient) return { success: false, error: "المريض غير موجود" };

  await prisma.patient.update({
    where: { id },
    data: {
      fullName: data.fullName,
      phone: data.phone,
      age: data.age,
      gender: data.gender,
      email: data.email || undefined,
      notes: data.notes || undefined,
    },
  });

  await logActivity(staff, {
    action: "UPDATE_PATIENT",
    entityType: "Patient",
    entityId: id,
    description: `تم تعديل بيانات المريض: ${data.fullName}`,
  });

  revalidatePath("/admin/patients");
  return { success: true };
}

export async function deletePatient(id: string): Promise<ActionResult> {
  const staff = await getCurrentStaff();

  try {
    assertPermission(staff.role, "deletePatient");
  } catch {
    return { success: false, error: "لا تملك صلاحية حذف المرضى" };
  }

  const patient = await prisma.patient.findUnique({
    where: { id },
    include: { _count: { select: { appointments: true } } },
  });
  if (!patient) return { success: false, error: "المريض غير موجود" };

  if (patient._count.appointments > 0) {
    return {
      success: false,
      error: "لا يمكن حذف مريض لديه مواعيد مسجّلة. يرجى حذف مواعيده أولًا من صفحة المواعيد.",
    };
  }

  await prisma.patient.delete({ where: { id } });

  await logActivity(staff, {
    action: "DELETE_PATIENT",
    entityType: "Patient",
    entityId: id,
    description: `تم حذف المريض: ${patient.fullName}`,
  });

  revalidatePath("/admin/patients");
  return { success: true };
}
