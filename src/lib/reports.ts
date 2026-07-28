import "server-only";
import { prisma } from "@/lib/prisma";
import { Prisma, type AppointmentStatus, type PaymentMethod } from "@/generated/prisma/client";
import {
  endOfDay,
  endOfYear,
  formatCurrency,
  formatShortDate,
  startOfDay,
  startOfMonth,
  startOfYear,
} from "@/lib/date-utils";
import { startOfWeekSaturday, getWeekDays, addMonths } from "@/lib/calendar-utils";
import { APPOINTMENT_STATUSES, APPOINTMENT_STATUS_LABELS } from "@/lib/appointment-status";
import { PAYMENT_METHOD_LABELS } from "@/lib/billing-labels";
import type { ExportTable } from "@/components/admin/reports/export-buttons";

export type ReportRangePreset = "today" | "week" | "month" | "year" | "custom";
export const REPORT_RANGE_PRESETS: ReportRangePreset[] = ["today", "week", "month", "year", "custom"];

export type LabelValue = { label: string; value: number };

export type ReportsData = {
  from: Date;
  to: Date;
  cards: {
    todayRevenue: number;
    monthlyRevenue: number;
    yearlyRevenue: number;
    totalPatients: number;
    newPatientsThisMonth: number;
    appointmentsToday: number;
    upcomingAppointments: number;
    outstandingBalance: number;
    completedTreatments: number;
    activeTreatmentPlans: number;
  };
  revenueByMonth: LabelValue[];
  newPatientsTrend: LabelValue[];
  patientGrowth: LabelValue[];
  revenueByService: LabelValue[];
  appointmentStatusDistribution: { status: AppointmentStatus; count: number }[];
  paymentMethods: { method: PaymentMethod; amount: number }[];
  topTreatments: LabelValue[];
  doctorPerformance:
    | { doctorId: string; name: string; appointmentsCompleted: number; revenue: number }[]
    | null;
};

/** Resolves a filter preset (+ optional custom bounds) to a concrete [from, to] range. */
export function resolveReportRange(
  preset: ReportRangePreset,
  fromParam?: string | null,
  toParam?: string | null
): { from: Date; to: Date } {
  const now = new Date();

  if (preset === "today") {
    return { from: startOfDay(now), to: endOfDay(now) };
  }
  if (preset === "week") {
    const weekDays = getWeekDays(now);
    return { from: startOfWeekSaturday(now), to: endOfDay(weekDays[weekDays.length - 1]) };
  }
  if (preset === "year") {
    return { from: startOfYear(now), to: endOfDay(now) };
  }
  if (preset === "custom" && fromParam && toParam) {
    const from = startOfDay(new Date(fromParam));
    const to = endOfDay(new Date(toParam));
    if (!Number.isNaN(from.getTime()) && !Number.isNaN(to.getTime()) && from <= to) {
      return { from, to };
    }
  }
  // default / "month"
  return { from: startOfMonth(now), to: endOfDay(now) };
}

const monthLabelFormatter = new Intl.DateTimeFormat("ar-SY", { month: "short", year: "2-digit" });

/** Fetches everything the reports dashboard needs in one batch, aggregated in-database. */
export async function getReportsData(params: {
  from: Date;
  to: Date;
  doctorId: string | null;
  includeDoctorPerformance: boolean;
  activeDoctors: { id: string; firstName: string; lastName: string }[];
}): Promise<ReportsData> {
  const { from, to, doctorId, includeDoctorPerformance, activeDoctors } = params;
  const now = new Date();
  const todayStart = startOfDay(now);
  const todayEnd = endOfDay(now);
  const monthStart = startOfMonth(now);
  const yearStart = startOfYear(now);
  const yearEnd = endOfYear(now);

  const invoiceDoctorFilter = doctorId ? { doctorId } : {};
  const treatmentPlanDoctorFilter = doctorId ? { treatmentPlan: { doctorId } } : {};

  const [
    todayRevenue,
    monthlyRevenue,
    yearlyRevenue,
    totalPatients,
    newPatientsThisMonth,
    appointmentsToday,
    upcomingAppointments,
    outstandingBalance,
    completedTreatments,
    activeTreatmentPlans,
  ] = await Promise.all([
    prisma.payment.aggregate({
      where: { paidAt: { gte: todayStart, lte: todayEnd }, invoice: invoiceDoctorFilter },
      _sum: { amount: true },
    }),
    prisma.payment.aggregate({
      where: { paidAt: { gte: monthStart, lte: todayEnd }, invoice: invoiceDoctorFilter },
      _sum: { amount: true },
    }),
    prisma.payment.aggregate({
      where: { paidAt: { gte: yearStart, lte: yearEnd }, invoice: invoiceDoctorFilter },
      _sum: { amount: true },
    }),
    doctorId
      ? prisma.patient.count({ where: { appointments: { some: { doctorId } } } })
      : prisma.patient.count(),
    prisma.patient.count({
      where: {
        createdAt: { gte: monthStart },
        ...(doctorId ? { appointments: { some: { doctorId } } } : {}),
      },
    }),
    prisma.appointment.count({
      where: { startTime: { gte: todayStart, lte: todayEnd }, ...(doctorId ? { doctorId } : {}) },
    }),
    prisma.appointment.count({
      where: {
        startTime: { gt: now },
        status: { notIn: ["CANCELLED", "COMPLETED"] },
        ...(doctorId ? { doctorId } : {}),
      },
    }),
    prisma.invoice.aggregate({
      where: { remainingBalance: { gt: 0 }, ...(doctorId ? { doctorId } : {}) },
      _sum: { remainingBalance: true },
    }),
    prisma.treatmentItem.count({
      where: { status: "COMPLETED", ...treatmentPlanDoctorFilter },
    }),
    prisma.treatmentPlan.count({
      where: { status: { in: ["PLANNED", "IN_PROGRESS"] }, ...(doctorId ? { doctorId } : {}) },
    }),
  ]);

  // 12-month trailing trends, each a single grouped raw query instead of 12 per-month round trips.
  const trendWindowStart = startOfMonth(addMonths(now, -11));

  const revenueByMonthRaw = await prisma.$queryRaw<{ bucket: Date; total: number | null }[]>(
    Prisma.sql`
      SELECT date_trunc('month', p."paidAt") AS bucket, SUM(p.amount)::float AS total
      FROM "Payment" p
      JOIN "Invoice" i ON i.id = p."invoiceId"
      WHERE p."paidAt" >= ${trendWindowStart}
        ${doctorId ? Prisma.sql`AND i."doctorId" = ${doctorId}` : Prisma.empty}
      GROUP BY bucket
      ORDER BY bucket
    `
  );

  const newPatientsTrendRaw = await prisma.$queryRaw<{ bucket: Date; total: number }[]>(
    Prisma.sql`
      SELECT date_trunc('month', pt."createdAt") AS bucket, COUNT(*)::int AS total
      FROM "Patient" pt
      WHERE pt."createdAt" >= ${trendWindowStart}
        ${
          doctorId
            ? Prisma.sql`AND EXISTS (SELECT 1 FROM "Appointment" a WHERE a."patientId" = pt.id AND a."doctorId" = ${doctorId})`
            : Prisma.empty
        }
      GROUP BY bucket
      ORDER BY bucket
    `
  );

  const patientsBeforeWindow = await prisma.patient.count({
    where: {
      createdAt: { lt: trendWindowStart },
      ...(doctorId ? { appointments: { some: { doctorId } } } : {}),
    },
  });

  const months = Array.from({ length: 12 }, (_, index) => addMonths(trendWindowStart, index));
  const revenueByMonth: LabelValue[] = months.map((month) => {
    const match = revenueByMonthRaw.find((row) => sameMonth(row.bucket, month));
    return { label: monthLabelFormatter.format(month), value: match?.total ?? 0 };
  });
  const newPatientsTrend: LabelValue[] = months.map((month) => {
    const match = newPatientsTrendRaw.find((row) => sameMonth(row.bucket, month));
    return { label: monthLabelFormatter.format(month), value: Number(match?.total ?? 0) };
  });
  let running = patientsBeforeWindow;
  const patientGrowth: LabelValue[] = newPatientsTrend.map((point) => {
    running += point.value;
    return { label: point.label, value: running };
  });

  // Range-filtered breakdown charts (respect the selected filter window + doctor).
  const [
    revenueByServiceRaw,
    statusGroups,
    paymentMethodGroups,
    topTreatmentsRaw,
    invoiceRevenueGroups,
    completedAppointmentGroups,
  ] = await Promise.all([
    prisma.invoiceItem.groupBy({
      by: ["description"],
      where: { invoice: { issueDate: { gte: from, lte: to }, ...invoiceDoctorFilter } },
      _sum: { total: true },
      orderBy: { _sum: { total: "desc" } },
      take: 10,
    }),
    prisma.appointment.groupBy({
      by: ["status"],
      where: { startTime: { gte: from, lte: to }, ...(doctorId ? { doctorId } : {}) },
      _count: { _all: true },
    }),
    prisma.payment.groupBy({
      by: ["method"],
      where: { paidAt: { gte: from, lte: to }, invoice: invoiceDoctorFilter },
      _sum: { amount: true },
    }),
    prisma.treatmentItem.groupBy({
      by: ["procedureName"],
      where: { createdAt: { gte: from, lte: to }, ...treatmentPlanDoctorFilter },
      _count: { _all: true },
      orderBy: { _count: { procedureName: "desc" } },
      take: 10,
    }),
    includeDoctorPerformance
      ? prisma.invoice.groupBy({
          by: ["doctorId"],
          where: { issueDate: { gte: from, lte: to } },
          _sum: { total: true },
        })
      : Promise.resolve([]),
    includeDoctorPerformance
      ? prisma.appointment.groupBy({
          by: ["doctorId"],
          where: { status: "COMPLETED", startTime: { gte: from, lte: to } },
          _count: { _all: true },
        })
      : Promise.resolve([]),
  ]);

  const revenueByService: LabelValue[] = revenueByServiceRaw.map((row) => ({
    label: row.description,
    value: row._sum.total ?? 0,
  }));

  const appointmentStatusDistribution = APPOINTMENT_STATUSES.map((status) => ({
    status,
    count: statusGroups.find((g) => g.status === status)?._count._all ?? 0,
  }));

  const paymentMethods = paymentMethodGroups.map((g) => ({
    method: g.method,
    amount: g._sum.amount ?? 0,
  }));

  const topTreatments: LabelValue[] = topTreatmentsRaw.map((row) => ({
    label: row.procedureName,
    value: row._count._all,
  }));

  const doctorPerformance = includeDoctorPerformance
    ? activeDoctors.map((doctor) => ({
        doctorId: doctor.id,
        name: `${doctor.firstName} ${doctor.lastName}`,
        revenue: invoiceRevenueGroups.find((g) => g.doctorId === doctor.id)?._sum.total ?? 0,
        appointmentsCompleted:
          completedAppointmentGroups.find((g) => g.doctorId === doctor.id)?._count._all ?? 0,
      }))
    : null;

  return {
    from,
    to,
    cards: {
      todayRevenue: todayRevenue._sum.amount ?? 0,
      monthlyRevenue: monthlyRevenue._sum.amount ?? 0,
      yearlyRevenue: yearlyRevenue._sum.amount ?? 0,
      totalPatients,
      newPatientsThisMonth,
      appointmentsToday,
      upcomingAppointments,
      outstandingBalance: outstandingBalance._sum.remainingBalance ?? 0,
      completedTreatments,
      activeTreatmentPlans,
    },
    revenueByMonth,
    newPatientsTrend,
    patientGrowth,
    revenueByService,
    appointmentStatusDistribution,
    paymentMethods,
    topTreatments,
    doctorPerformance,
  };
}

function sameMonth(a: Date, b: Date): boolean {
  const dateA = new Date(a);
  return dateA.getFullYear() === b.getFullYear() && dateA.getMonth() === b.getMonth();
}

const CARD_LABELS: Record<keyof ReportsData["cards"], string> = {
  todayRevenue: "إيرادات اليوم",
  monthlyRevenue: "إيرادات هذا الشهر",
  yearlyRevenue: "إيرادات هذا العام",
  totalPatients: "إجمالي المرضى",
  newPatientsThisMonth: "مرضى جدد هذا الشهر",
  appointmentsToday: "مواعيد اليوم",
  upcomingAppointments: "مواعيد قادمة",
  outstandingBalance: "أرصدة مستحقة",
  completedTreatments: "علاجات مكتملة",
  activeTreatmentPlans: "خطط علاج نشطة",
};

const CURRENCY_CARD_KEYS = new Set<keyof ReportsData["cards"]>([
  "todayRevenue",
  "monthlyRevenue",
  "yearlyRevenue",
  "outstandingBalance",
]);

/** Flattens the computed reports data into named tables for CSV/Excel export. */
export function buildExportTables(data: ReportsData): ExportTable[] {
  const tables: ExportTable[] = [];

  tables.push({
    title: `ملخص (${formatShortDate(data.from)} — ${formatShortDate(data.to)})`,
    rows: (Object.keys(CARD_LABELS) as (keyof ReportsData["cards"])[]).map((key) => ({
      label: CARD_LABELS[key],
      value: CURRENCY_CARD_KEYS.has(key)
        ? formatCurrency(data.cards[key])
        : String(data.cards[key]),
    })),
  });

  tables.push({
    title: "الإيرادات الشهرية (آخر 12 شهرًا)",
    rows: data.revenueByMonth.map((p) => ({ label: p.label, value: formatCurrency(p.value) })),
  });

  tables.push({
    title: "اتجاه المرضى الجدد (آخر 12 شهرًا)",
    rows: data.newPatientsTrend.map((p) => ({ label: p.label, value: String(p.value) })),
  });

  tables.push({
    title: "نمو المرضى التراكمي (آخر 12 شهرًا)",
    rows: data.patientGrowth.map((p) => ({ label: p.label, value: String(p.value) })),
  });

  tables.push({
    title: "الإيرادات حسب الخدمة",
    rows: data.revenueByService.map((p) => ({ label: p.label, value: formatCurrency(p.value) })),
  });

  tables.push({
    title: "توزيع حالات المواعيد",
    rows: data.appointmentStatusDistribution.map((p) => ({
      label: APPOINTMENT_STATUS_LABELS[p.status],
      value: String(p.count),
    })),
  });

  tables.push({
    title: "طرق الدفع",
    rows: data.paymentMethods.map((p) => ({
      label: PAYMENT_METHOD_LABELS[p.method],
      value: formatCurrency(p.amount),
    })),
  });

  tables.push({
    title: "أكثر الإجراءات شيوعًا",
    rows: data.topTreatments.map((p) => ({ label: p.label, value: String(p.value) })),
  });

  if (data.doctorPerformance) {
    tables.push({
      title: "أداء الأطباء",
      rows: data.doctorPerformance.map((d) => ({
        label: d.name,
        value: `${formatCurrency(d.revenue)} — ${d.appointmentsCompleted} موعد مكتمل`,
      })),
    });
  }

  return tables;
}
