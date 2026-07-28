import { redirect } from "next/navigation";
import Link from "next/link";
import { CalendarDays } from "lucide-react";
import { Prisma } from "@/generated/prisma/client";
import { prisma } from "@/lib/prisma";
import { getCurrentStaff } from "@/lib/auth/current-staff";
import { hasPermission } from "@/lib/auth/permissions";
import { getClinicSettings } from "@/lib/clinic-settings";
import { AppointmentsToolbar } from "@/components/admin/appointments/appointments-toolbar";
import { AppointmentsTable } from "@/components/admin/appointments/appointments-table";
import { Pagination } from "@/components/admin/pagination";
import { Button } from "@/components/ui/button";
import { AppointmentCalendar } from "@/components/admin/appointments/calendar/appointment-calendar";
import {
  getMonthGridDays,
  getWeekDays,
  type CalendarView,
} from "@/lib/calendar-utils";
import { endOfDay, startOfDay } from "@/lib/date-utils";
import type { AppointmentStatus } from "@/generated/prisma/client";
import type { CalendarAppointment } from "@/components/admin/appointments/calendar/types";
import type { SidebarAppointment } from "@/components/admin/appointments/calendar/calendar-sidebar";

export const dynamic = "force-dynamic";

const PAGE_SIZE = 10;

type SearchParams = {
  q?: string;
  status?: string;
  sort?: string;
  page?: string;
  mode?: string;
  view?: string;
  date?: string;
  doctorId?: string;
};

function withFallbackEndTime(endTime: Date | null, startTime: Date): Date {
  return endTime ?? new Date(startTime.getTime() + 30 * 60 * 1000);
}

export default async function AppointmentsPage({
  searchParams,
}: {
  searchParams: Promise<SearchParams>;
}) {
  const staff = await getCurrentStaff();
  if (!hasPermission(staff.role, "viewAppointments")) redirect("/admin");
  const params = await searchParams;
  const mode = params.mode === "list" ? "list" : "calendar";

  if (mode === "list") {
    const q = params.q?.trim() ?? "";
    const status = params.status as AppointmentStatus | undefined;
    const page = Math.max(1, Number(params.page) || 1);

    const [sortField, sortDir] = (params.sort ?? "startTime:desc").split(":") as [
      "startTime" | "createdAt" | "patientName",
      "asc" | "desc",
    ];

    const where: Prisma.AppointmentWhereInput = {
      ...(status ? { status } : {}),
      ...(q
        ? {
            OR: [
              { patient: { fullName: { contains: q, mode: "insensitive" } } },
              { patient: { phone: { contains: q } } },
            ],
          }
        : {}),
    };

    const orderBy: Prisma.AppointmentOrderByWithRelationInput =
      sortField === "patientName"
        ? { patient: { fullName: sortDir } }
        : { [sortField]: sortDir };

    const [appointments, total] = await Promise.all([
      prisma.appointment.findMany({
        where,
        orderBy,
        skip: (page - 1) * PAGE_SIZE,
        take: PAGE_SIZE,
        include: { patient: true },
      }),
      prisma.appointment.count({ where }),
    ]);

    return (
      <div className="space-y-5">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold tracking-tight">إدارة المواعيد</h1>
            <p className="mt-1 text-sm text-muted-foreground">
              {total} موعد إجمالًا
            </p>
          </div>
          <Button variant="outline" size="sm" className="gap-1.5" render={<Link href="/admin/appointments?mode=calendar" />}>
            <CalendarDays className="size-4" />
            عرض التقويم
          </Button>
        </div>

        <AppointmentsToolbar role={staff.role} />

        <AppointmentsTable
          appointments={appointments}
          role={staff.role}
          sortField={sortField}
          sortDir={sortDir}
        />

        <Pagination page={page} pageSize={PAGE_SIZE} total={total} />
      </div>
    );
  }

  // --- Calendar mode ---
  const view: CalendarView =
    params.view === "day" || params.view === "month" ? params.view : "week";
  const anchorDate = params.date ? new Date(`${params.date}T00:00:00`) : new Date();
  const selectedDoctorId = params.doctorId || null;

  const [rangeStart, rangeEnd] =
    view === "month"
      ? (() => {
          const monthDays = getMonthGridDays(anchorDate);
          return [startOfDay(monthDays[0]), endOfDay(monthDays[monthDays.length - 1])];
        })()
      : view === "week"
        ? (() => {
            const weekDays = getWeekDays(anchorDate);
            return [startOfDay(weekDays[0]), endOfDay(weekDays[weekDays.length - 1])];
          })()
        : [startOfDay(anchorDate), endOfDay(anchorDate)];

  const now = new Date();

  const [doctors, rangeAppointments, todayRows, upcomingRows, waitingRows, settings] =
    await Promise.all([
      prisma.doctor.findMany({
        where: { isActive: true },
        select: { id: true, firstName: true, lastName: true },
        orderBy: { firstName: "asc" },
      }),
      prisma.appointment.findMany({
        where: {
          startTime: { gte: rangeStart, lte: rangeEnd },
          ...(selectedDoctorId ? { doctorId: selectedDoctorId } : {}),
        },
        include: { patient: true },
      }),
      prisma.appointment.findMany({
        where: {
          startTime: { gte: startOfDay(now), lte: endOfDay(now) },
          status: { not: "CANCELLED" },
        },
        orderBy: { startTime: "asc" },
        select: { id: true, startTime: true, status: true, patient: { select: { fullName: true } } },
      }),
      prisma.appointment.findMany({
        where: {
          startTime: { gt: now },
          status: { notIn: ["CANCELLED", "COMPLETED", "NO_SHOW"] },
        },
        orderBy: { startTime: "asc" },
        take: 10,
        select: { id: true, startTime: true, status: true, patient: { select: { fullName: true } } },
      }),
      prisma.appointment.findMany({
        where: {
          status: { in: ["NEW", "PENDING"] },
          startTime: { gte: now },
        },
        orderBy: { startTime: "asc" },
        take: 10,
        select: { id: true, startTime: true, status: true, patient: { select: { fullName: true } } },
      }),
      getClinicSettings(),
    ]);

  const calendarAppointments: CalendarAppointment[] = rangeAppointments.map((appointment) => ({
    id: appointment.id,
    startTime: appointment.startTime,
    endTime: withFallbackEndTime(appointment.endTime, appointment.startTime),
    status: appointment.status,
    reason: appointment.reason,
    notes: appointment.notes,
    doctorId: appointment.doctorId,
    patient: {
      id: appointment.patient.id,
      fullName: appointment.patient.fullName,
      phone: appointment.patient.phone,
      age: appointment.patient.age,
      gender: appointment.patient.gender,
    },
  }));

  const toSidebarRow = (row: {
    id: string;
    startTime: Date;
    status: AppointmentStatus;
    patient: { fullName: string };
  }): SidebarAppointment => ({
    id: row.id,
    patientName: row.patient.fullName,
    startTime: row.startTime,
    status: row.status,
  });

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">إدارة المواعيد</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            {rangeAppointments.length} موعد ضمن الفترة المعروضة
          </p>
        </div>
      </div>

      <AppointmentCalendar
        view={view}
        anchorDate={anchorDate}
        appointments={calendarAppointments}
        doctors={doctors}
        selectedDoctorId={selectedDoctorId}
        workingHours={settings.workingHours}
        sidebarToday={todayRows.map(toSidebarRow)}
        sidebarUpcoming={upcomingRows.map(toSidebarRow)}
        sidebarWaiting={waitingRows.map(toSidebarRow)}
      />
    </div>
  );
}
