"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { getCurrentStaff } from "@/lib/auth/current-staff";
import { assertPermission } from "@/lib/auth/permissions";
import { logActivity } from "@/lib/activity-log";
import { createNotification } from "@/lib/create-notification";
import {
  treatmentItemSchema,
  treatmentPlanSchema,
  type TreatmentItemInput,
  type TreatmentPlanValues,
} from "@/lib/validations/billing";

type ActionResult = { success: true } | { success: false; error: string };

function revalidateProfile(patientId: string) {
  revalidatePath(`/admin/patients/${patientId}`);
}

function computeItemTotal(quantity: number, unitPrice: number, discount: number) {
  return Math.max(0, quantity * unitPrice - discount);
}

// ---------------------------------------------------------------------------
// Treatment plans
// ---------------------------------------------------------------------------

export async function createTreatmentPlan(
  patientId: string,
  input: TreatmentPlanValues
): Promise<ActionResult> {
  const staff = await getCurrentStaff();

  try {
    assertPermission(staff.role, "manageTreatmentPlans");
  } catch {
    return { success: false, error: "لا تملك صلاحية إنشاء خطة علاج" };
  }

  const parsed = treatmentPlanSchema.safeParse(input);
  if (!parsed.success) return { success: false, error: "الرجاء التحقق من البيانات" };
  const data = parsed.data;

  const patient = await prisma.patient.findUnique({ where: { id: patientId } });
  if (!patient) return { success: false, error: "المريض غير موجود" };

  const doctor =
    (await prisma.doctor.findFirst()) ??
    (await prisma.doctor.create({
      data: { firstName: "خليل", lastName: "الجمعة", specialty: "طب وتجميل الأسنان" },
    }));

  const plan = await prisma.treatmentPlan.create({
    data: {
      patientId,
      doctorId: doctor.id,
      title: data.title,
      diagnosis: data.diagnosis || undefined,
      priority: data.priority,
      status: data.status,
      startDate: data.startDate ? new Date(data.startDate) : undefined,
      estimatedEndDate: data.estimatedEndDate ? new Date(data.estimatedEndDate) : undefined,
      notes: data.notes || undefined,
      createdByStaffId: staff.id,
    },
  });

  await logActivity(staff, {
    action: "CREATE_TREATMENT_PLAN",
    entityType: "TreatmentPlan",
    entityId: plan.id,
    description: `تم إنشاء خطة علاج "${data.title}" للمريض: ${patient.fullName}`,
  });

  await createNotification({
    type: "TREATMENT_PLAN_CREATED",
    priority: "MEDIUM",
    title: "خطة علاج جديدة",
    message: `تم إنشاء خطة علاج "${data.title}" للمريض ${patient.fullName}`,
    link: `/admin/patients/${patientId}`,
  });

  revalidateProfile(patientId);
  return { success: true };
}

export async function updateTreatmentPlan(
  planId: string,
  patientId: string,
  input: TreatmentPlanValues
): Promise<ActionResult> {
  const staff = await getCurrentStaff();

  try {
    assertPermission(staff.role, "manageTreatmentPlans");
  } catch {
    return { success: false, error: "لا تملك صلاحية تعديل خطة العلاج" };
  }

  const parsed = treatmentPlanSchema.safeParse(input);
  if (!parsed.success) return { success: false, error: "الرجاء التحقق من البيانات" };
  const data = parsed.data;

  const plan = await prisma.treatmentPlan.findUnique({ where: { id: planId } });
  if (!plan) return { success: false, error: "خطة العلاج غير موجودة" };

  await prisma.treatmentPlan.update({
    where: { id: planId },
    data: {
      title: data.title,
      diagnosis: data.diagnosis || null,
      priority: data.priority,
      status: data.status,
      startDate: data.startDate ? new Date(data.startDate) : null,
      estimatedEndDate: data.estimatedEndDate ? new Date(data.estimatedEndDate) : null,
      notes: data.notes || null,
    },
  });

  await logActivity(staff, {
    action: "UPDATE_TREATMENT_PLAN",
    entityType: "TreatmentPlan",
    entityId: planId,
    description: `تم تعديل خطة العلاج "${data.title}"`,
  });

  revalidateProfile(patientId);
  return { success: true };
}

export async function deleteTreatmentPlan(
  planId: string,
  patientId: string
): Promise<ActionResult> {
  const staff = await getCurrentStaff();

  try {
    assertPermission(staff.role, "manageTreatmentPlans");
  } catch {
    return { success: false, error: "لا تملك صلاحية حذف خطة العلاج" };
  }

  const plan = await prisma.treatmentPlan.findUnique({ where: { id: planId } });
  if (!plan) return { success: false, error: "خطة العلاج غير موجودة" };

  await prisma.treatmentPlan.delete({ where: { id: planId } });

  await logActivity(staff, {
    action: "DELETE_TREATMENT_PLAN",
    entityType: "TreatmentPlan",
    entityId: planId,
    description: `تم حذف خطة العلاج "${plan.title}"`,
  });

  revalidateProfile(patientId);
  return { success: true };
}

// ---------------------------------------------------------------------------
// Treatment items
// ---------------------------------------------------------------------------

export async function createTreatmentItem(
  treatmentPlanId: string,
  patientId: string,
  input: TreatmentItemInput
): Promise<ActionResult> {
  const staff = await getCurrentStaff();

  try {
    assertPermission(staff.role, "manageTreatmentPlans");
  } catch {
    return { success: false, error: "لا تملك صلاحية إضافة إجراء" };
  }

  const parsed = treatmentItemSchema.safeParse(input);
  if (!parsed.success) return { success: false, error: "الرجاء التحقق من البيانات" };
  const data = parsed.data;

  const plan = await prisma.treatmentPlan.findUnique({ where: { id: treatmentPlanId } });
  if (!plan) return { success: false, error: "خطة العلاج غير موجودة" };

  const total = computeItemTotal(data.quantity, data.unitPrice, data.discount);

  await prisma.treatmentItem.create({
    data: {
      treatmentPlanId,
      procedureName: data.procedureName,
      toothNumber: data.toothNumber,
      quantity: data.quantity,
      unitPrice: data.unitPrice,
      discount: data.discount,
      total,
      notes: data.notes || undefined,
      status: data.status,
    },
  });

  await logActivity(staff, {
    action: "CREATE_TREATMENT_ITEM",
    entityType: "TreatmentItem",
    entityId: treatmentPlanId,
    description: `تم إضافة إجراء "${data.procedureName}" إلى خطة علاج`,
  });

  revalidateProfile(patientId);
  return { success: true };
}

export async function updateTreatmentItem(
  itemId: string,
  patientId: string,
  input: TreatmentItemInput
): Promise<ActionResult> {
  const staff = await getCurrentStaff();

  try {
    assertPermission(staff.role, "manageTreatmentPlans");
  } catch {
    return { success: false, error: "لا تملك صلاحية تعديل الإجراء" };
  }

  const parsed = treatmentItemSchema.safeParse(input);
  if (!parsed.success) return { success: false, error: "الرجاء التحقق من البيانات" };
  const data = parsed.data;

  const item = await prisma.treatmentItem.findUnique({ where: { id: itemId } });
  if (!item) return { success: false, error: "الإجراء غير موجود" };

  const total = computeItemTotal(data.quantity, data.unitPrice, data.discount);

  await prisma.treatmentItem.update({
    where: { id: itemId },
    data: {
      procedureName: data.procedureName,
      toothNumber: data.toothNumber ?? null,
      quantity: data.quantity,
      unitPrice: data.unitPrice,
      discount: data.discount,
      total,
      notes: data.notes || null,
      status: data.status,
    },
  });

  await logActivity(staff, {
    action: "UPDATE_TREATMENT_ITEM",
    entityType: "TreatmentItem",
    entityId: itemId,
    description: `تم تعديل إجراء "${data.procedureName}"`,
  });

  revalidateProfile(patientId);
  return { success: true };
}

export async function deleteTreatmentItem(
  itemId: string,
  patientId: string
): Promise<ActionResult> {
  const staff = await getCurrentStaff();

  try {
    assertPermission(staff.role, "manageTreatmentPlans");
  } catch {
    return { success: false, error: "لا تملك صلاحية حذف الإجراء" };
  }

  const item = await prisma.treatmentItem.findUnique({ where: { id: itemId } });
  if (!item) return { success: false, error: "الإجراء غير موجود" };

  await prisma.treatmentItem.delete({ where: { id: itemId } });

  await logActivity(staff, {
    action: "DELETE_TREATMENT_ITEM",
    entityType: "TreatmentItem",
    entityId: itemId,
    description: `تم حذف إجراء "${item.procedureName}"`,
  });

  revalidateProfile(patientId);
  return { success: true };
}
