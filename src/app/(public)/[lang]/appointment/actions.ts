"use server";

import { prisma } from "@/lib/prisma";
import {
  getAppointmentFormSchema,
  type AppointmentFormValues,
} from "@/lib/validations/appointment";
import { combineDateAndTime } from "@/lib/appointment-slots";
import { createNotification } from "@/lib/create-notification";
import { formatDateTime } from "@/lib/date-utils";
import { getDictionary } from "@/lib/i18n/get-dictionary";
import { isLocale, defaultLocale, type Locale } from "@/lib/i18n/config";

const dateOnlyRegex = /^\d{4}-\d{2}-\d{2}$/;

export async function getBookedSlots(dateStr: string): Promise<string[]> {
  if (!dateOnlyRegex.test(dateStr)) return [];

  const dayStart = new Date(`${dateStr}T00:00:00`);
  const dayEnd = new Date(`${dateStr}T23:59:59`);

  const appointments = await prisma.appointment.findMany({
    where: {
      startTime: { gte: dayStart, lte: dayEnd },
      status: { not: "CANCELLED" },
    },
    select: { startTime: true },
  });

  return appointments.map((appointment) => {
    const hours = String(appointment.startTime.getHours()).padStart(2, "0");
    const minutes = String(appointment.startTime.getMinutes()).padStart(2, "0");
    return `${hours}:${minutes}`;
  });
}

type CreateAppointmentResult =
  | { success: true }
  | {
      success: false;
      error: string;
      fieldErrors?: Partial<Record<keyof AppointmentFormValues, string[]>>;
    };

export async function createAppointment(
  input: AppointmentFormValues,
  locale: string
): Promise<CreateAppointmentResult> {
  const resolvedLocale: Locale = isLocale(locale) ? locale : defaultLocale;
  const dict = await getDictionary(resolvedLocale);
  const schema = getAppointmentFormSchema(dict);
  const parsed = schema.safeParse(input);

  if (!parsed.success) {
    return {
      success: false,
      error: dict.booking.result.parseError,
      fieldErrors: parsed.error.flatten()
        .fieldErrors as Partial<Record<keyof AppointmentFormValues, string[]>>,
    };
  }

  const data = parsed.data;
  const startTime = combineDateAndTime(data.date, data.time);
  const endTime = new Date(startTime.getTime() + 30 * 60 * 1000);

  try {
    const doctor =
      (await prisma.doctor.findFirst()) ??
      (await prisma.doctor.create({
        data: {
          firstName: "خليل",
          lastName: "الجمعة",
          specialty: "طب وتجميل الأسنان",
        },
      }));

    const existing = await prisma.appointment.findFirst({
      where: {
        doctorId: doctor.id,
        startTime,
        status: { not: "CANCELLED" },
      },
    });

    if (existing) {
      return {
        success: false,
        error: dict.booking.result.slotTaken,
        fieldErrors: { time: [dict.booking.result.slotTakenFieldError] },
      };
    }

    const isNewPatient = !(await prisma.patient.findUnique({
      where: { phone: data.phone },
      select: { id: true },
    }));

    await prisma.$transaction(async (tx) => {
      const patient = await tx.patient.upsert({
        where: { phone: data.phone },
        create: {
          fullName: data.fullName,
          phone: data.phone,
          email: data.email || undefined,
          age: data.age,
          gender: data.gender,
        },
        update: {
          fullName: data.fullName,
          email: data.email || undefined,
          age: data.age,
          gender: data.gender,
        },
      });

      await tx.appointment.create({
        data: {
          patientId: patient.id,
          doctorId: doctor.id,
          startTime,
          endTime,
          reason: data.reason,
          notes: data.notes || undefined,
        },
      });
    });

    // Admin-facing notifications always stay Arabic regardless of the public
    // visitor's chosen site language — the admin dashboard is Arabic-only.
    if (isNewPatient) {
      await createNotification({
        type: "PATIENT_CREATED",
        priority: "LOW",
        title: "مريض جديد",
        message: `تم تسجيل مريض جديد: ${data.fullName} (عبر الحجز العام)`,
        link: "/admin/patients",
      });
    }

    await createNotification({
      type: "APPOINTMENT_CREATED",
      priority: "MEDIUM",
      title: "موعد جديد",
      message: `حجز جديد عبر الموقع العام: ${data.fullName} في ${formatDateTime(startTime)}`,
      link: "/admin/appointments",
    });

    return { success: true };
  } catch {
    return {
      success: false,
      error: dict.booking.result.genericError,
    };
  }
}
