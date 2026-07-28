"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { getCurrentStaff } from "@/lib/auth/current-staff";
import { assertPermission } from "@/lib/auth/permissions";
import { logActivity } from "@/lib/activity-log";
import { createNotification } from "@/lib/create-notification";
import { APPOINTMENT_STATUS_LABELS } from "@/lib/appointment-status";
import { getClinicSettings } from "@/lib/clinic-settings";
import { isRangeWithinWorkingHours } from "@/lib/calendar-working-hours";
import { formatDateTime } from "@/lib/date-utils";
import type { AppointmentStatus } from "@/generated/prisma/client";

type ActionResult = { success: true } | { success: false; error: string };

function revalidateAppointments() {
  revalidatePath("/admin/appointments");
  revalidatePath("/admin");
}

const STATUS_PERMISSION = {
  NEW: "editAppointment",
  PENDING: "editAppointment",
  CONFIRMED: "confirmAppointment",
  COMPLETED: "editAppointment",
  CANCELLED: "cancelAppointment",
  NO_SHOW: "editAppointment",
} as const;

export async function updateAppointmentStatus(
  id: string,
  status: AppointmentStatus
): Promise<ActionResult> {
  const staff = await getCurrentStaff();

  try {
    assertPermission(staff.role, STATUS_PERMISSION[status]);
  } catch {
    return { success: false, error: "لا تملك صلاحية تنفيذ هذا الإجراء" };
  }

  const appointment = await prisma.appointment.findUnique({
    where: { id },
    include: { patient: true },
  });
  if (!appointment) return { success: false, error: "الموعد غير موجود" };

  await prisma.appointment.update({ where: { id }, data: { status } });

  await logActivity(staff, {
    action: "UPDATE_APPOINTMENT_STATUS",
    entityType: "Appointment",
    entityId: id,
    description: `تم تغيير حالة موعد ${appointment.patient.fullName} إلى "${APPOINTMENT_STATUS_LABELS[status]}"`,
  });

  if (status === "CANCELLED") {
    await createNotification({
      type: "APPOINTMENT_CANCELLED",
      priority: "HIGH",
      title: "إلغاء موعد",
      message: `تم إلغاء موعد ${appointment.patient.fullName} في ${formatDateTime(appointment.startTime)}`,
      link: "/admin/appointments",
    });
  } else if (status === "COMPLETED") {
    await createNotification({
      type: "APPOINTMENT_COMPLETED",
      priority: "LOW",
      title: "اكتمال موعد",
      message: `اكتمل موعد ${appointment.patient.fullName}`,
      link: "/admin/appointments",
    });
  }

  revalidateAppointments();
  return { success: true };
}

const updateDetailsSchema = z.object({
  id: z.string().min(1),
  date: z.string().min(1),
  time: z.string().min(1),
  reason: z.string().trim().min(3),
  notes: z.string().trim().optional(),
});

export async function updateAppointmentDetails(
  input: z.infer<typeof updateDetailsSchema>
): Promise<ActionResult> {
  const staff = await getCurrentStaff();

  try {
    assertPermission(staff.role, "editAppointment");
  } catch {
    return { success: false, error: "لا تملك صلاحية تنفيذ هذا الإجراء" };
  }

  const parsed = updateDetailsSchema.safeParse(input);
  if (!parsed.success) return { success: false, error: "بيانات غير صحيحة" };

  const { id, date, time, reason, notes } = parsed.data;
  const startTime = new Date(`${date}T${time}:00`);
  const endTime = new Date(startTime.getTime() + 30 * 60 * 1000);

  const appointment = await prisma.appointment.findUnique({
    where: { id },
    include: { patient: true },
  });
  if (!appointment) return { success: false, error: "الموعد غير موجود" };

  await prisma.appointment.update({
    where: { id },
    data: { startTime, endTime, reason, notes: notes || null },
  });

  await logActivity(staff, {
    action: "UPDATE_APPOINTMENT",
    entityType: "Appointment",
    entityId: id,
    description: `تم تعديل بيانات موعد ${appointment.patient.fullName}`,
  });

  revalidateAppointments();
  return { success: true };
}

const rescheduleSchema = z.object({
  startTime: z.string().min(1),
  endTime: z.string().min(1),
});

/**
 * Used by the calendar's drag-to-move and drag-to-resize interactions. Unlike
 * updateAppointmentDetails (which also edits reason/notes and always forces a
 * fixed 30-minute duration), this only touches the time range so a resized
 * duration is preserved.
 */
export async function rescheduleAppointment(
  id: string,
  input: { startTime: string; endTime: string }
): Promise<ActionResult> {
  const staff = await getCurrentStaff();

  try {
    assertPermission(staff.role, "editAppointment");
  } catch {
    return { success: false, error: "لا تملك صلاحية تعديل المواعيد" };
  }

  const parsed = rescheduleSchema.safeParse(input);
  if (!parsed.success) return { success: false, error: "بيانات غير صحيحة" };

  const startTime = new Date(parsed.data.startTime);
  const endTime = new Date(parsed.data.endTime);
  if (Number.isNaN(startTime.getTime()) || Number.isNaN(endTime.getTime())) {
    return { success: false, error: "تاريخ غير صحيح" };
  }
  if (endTime <= startTime) {
    return { success: false, error: "وقت الانتهاء يجب أن يكون بعد وقت البدء" };
  }

  const appointment = await prisma.appointment.findUnique({
    where: { id },
    include: { patient: true },
  });
  if (!appointment) return { success: false, error: "الموعد غير موجود" };

  const settings = await getClinicSettings();
  if (!isRangeWithinWorkingHours(settings.workingHours, startTime, endTime)) {
    return { success: false, error: "لا يمكن جدولة موعد خارج ساعات الدوام" };
  }

  const conflict = await prisma.appointment.findFirst({
    where: {
      id: { not: id },
      doctorId: appointment.doctorId,
      status: { not: "CANCELLED" },
      startTime: { lt: endTime },
      OR: [{ endTime: { gt: startTime } }, { endTime: null }],
    },
  });
  if (conflict) {
    return { success: false, error: "يوجد موعد آخر متعارض مع هذا الوقت" };
  }

  await prisma.appointment.update({ where: { id }, data: { startTime, endTime } });

  await logActivity(staff, {
    action: "RESCHEDULE_APPOINTMENT",
    entityType: "Appointment",
    entityId: id,
    description: `تم نقل موعد ${appointment.patient.fullName} إلى ${formatDateTime(startTime)}`,
  });

  await createNotification({
    type: "APPOINTMENT_RESCHEDULED",
    priority: "MEDIUM",
    title: "تعديل موعد",
    message: `تم نقل موعد ${appointment.patient.fullName} إلى ${formatDateTime(startTime)}`,
    link: "/admin/appointments",
  });

  revalidateAppointments();
  return { success: true };
}

export async function deleteAppointment(id: string): Promise<ActionResult> {
  const staff = await getCurrentStaff();

  try {
    assertPermission(staff.role, "deleteAppointment");
  } catch {
    return { success: false, error: "لا تملك صلاحية حذف المواعيد" };
  }

  const appointment = await prisma.appointment.findUnique({
    where: { id },
    include: { patient: true },
  });
  if (!appointment) return { success: false, error: "الموعد غير موجود" };

  await prisma.appointment.delete({ where: { id } });

  await logActivity(staff, {
    action: "DELETE_APPOINTMENT",
    entityType: "Appointment",
    entityId: id,
    description: `تم حذف موعد ${appointment.patient.fullName}`,
  });

  revalidateAppointments();
  return { success: true };
}

const createManualSchema = z.object({
  fullName: z.string().trim().min(3),
  phone: z.string().trim().min(7),
  age: z.coerce.number().int().min(0).max(120).optional(),
  gender: z.enum(["MALE", "FEMALE"]).optional(),
  reason: z.string().trim().min(3),
  date: z.string().min(1),
  time: z.string().min(1),
  notes: z.string().trim().optional(),
  doctorId: z.string().trim().optional(),
});

export async function createManualAppointment(
  input: z.infer<typeof createManualSchema>
): Promise<ActionResult> {
  const staff = await getCurrentStaff();

  try {
    assertPermission(staff.role, "createAppointment");
  } catch {
    return { success: false, error: "لا تملك صلاحية إضافة حجز" };
  }

  const parsed = createManualSchema.safeParse(input);
  if (!parsed.success) return { success: false, error: "الرجاء التحقق من البيانات" };

  const data = parsed.data;
  const startTime = new Date(`${data.date}T${data.time}:00`);
  const endTime = new Date(startTime.getTime() + 30 * 60 * 1000);

  const doctor = data.doctorId
    ? await prisma.doctor.findUnique({ where: { id: data.doctorId } })
    : ((await prisma.doctor.findFirst()) ??
      (await prisma.doctor.create({
        data: { firstName: "خليل", lastName: "الجمعة", specialty: "طب وتجميل الأسنان" },
      })));

  if (!doctor) return { success: false, error: "الطبيب المحدد غير موجود" };

  const existing = await prisma.appointment.findFirst({
    where: { doctorId: doctor.id, startTime, status: { not: "CANCELLED" } },
  });
  if (existing) {
    return { success: false, error: "يوجد حجز آخر في هذا الوقت بالفعل" };
  }

  const isNewPatient = !(await prisma.patient.findUnique({
    where: { phone: data.phone },
    select: { id: true },
  }));

  const appointment = await prisma.$transaction(async (tx) => {
    const patient = await tx.patient.upsert({
      where: { phone: data.phone },
      create: {
        fullName: data.fullName,
        phone: data.phone,
        age: data.age,
        gender: data.gender,
      },
      update: {
        fullName: data.fullName,
        age: data.age,
        gender: data.gender,
      },
    });

    return tx.appointment.create({
      data: {
        patientId: patient.id,
        doctorId: doctor.id,
        startTime,
        endTime,
        reason: data.reason,
        notes: data.notes || undefined,
        status: "CONFIRMED",
        seenAt: new Date(),
      },
    });
  });

  await logActivity(staff, {
    action: "CREATE_APPOINTMENT",
    entityType: "Appointment",
    entityId: appointment.id,
    description: `تم إضافة حجز جديد لـ ${data.fullName}`,
  });

  if (isNewPatient) {
    await createNotification({
      type: "PATIENT_CREATED",
      priority: "LOW",
      title: "مريض جديد",
      message: `تم إضافة مريض جديد: ${data.fullName}`,
      link: "/admin/patients",
    });
  }

  await createNotification({
    type: "APPOINTMENT_CREATED",
    priority: "MEDIUM",
    title: "موعد جديد",
    message: `تم إضافة حجز جديد لـ ${data.fullName} في ${formatDateTime(startTime)}`,
    link: "/admin/appointments",
  });

  revalidateAppointments();
  return { success: true };
}
