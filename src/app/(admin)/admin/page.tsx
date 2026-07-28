import Link from "next/link";
import {
  CalendarCheck,
  CalendarClock,
  CalendarX,
  CheckCircle2,
  ClipboardCheck,
  Users,
  Wallet,
} from "lucide-react";
import { prisma } from "@/lib/prisma";
import { getCurrentStaff } from "@/lib/auth/current-staff";
import { hasPermission } from "@/lib/auth/permissions";
import { StatCard } from "@/components/admin/stat-card";
import { formatCurrency } from "@/lib/date-utils";
import { AppointmentsBarChart } from "@/components/admin/charts/appointments-bar-chart";
import { StatusDonutChart } from "@/components/admin/charts/status-donut-chart";
import {
  APPOINTMENT_STATUS_BADGE_CLASSES,
  APPOINTMENT_STATUS_LABELS,
  APPOINTMENT_STATUSES,
} from "@/lib/appointment-status";
import { addDays, endOfDay, formatDateTime, formatShortDate, startOfDay, startOfMonth } from "@/lib/date-utils";
import { cn } from "@/lib/utils";

export const dynamic = "force-dynamic";

export default async function AdminDashboardPage() {
  const staff = await getCurrentStaff();

  const now = new Date();
  const todayStart = startOfDay(now);
  const todayEnd = endOfDay(now);
  const monthStart = startOfMonth(now);

  const [
    todayCount,
    upcomingCount,
    patientsCount,
    cancelledThisMonth,
    completedThisMonth,
    statusGroups,
    recentAppointments,
    recentActivity,
  ] = await Promise.all([
    prisma.appointment.count({
      where: { startTime: { gte: todayStart, lte: todayEnd } },
    }),
    prisma.appointment.count({
      where: {
        startTime: { gt: now },
        status: { notIn: ["CANCELLED", "COMPLETED"] },
      },
    }),
    prisma.patient.count(),
    prisma.appointment.count({
      where: { status: "CANCELLED", createdAt: { gte: monthStart } },
    }),
    prisma.appointment.count({
      where: { status: "COMPLETED", createdAt: { gte: monthStart } },
    }),
    prisma.appointment.groupBy({ by: ["status"], _count: { _all: true } }),
    prisma.appointment.findMany({
      orderBy: { createdAt: "desc" },
      take: 5,
      include: { patient: true },
    }),
    prisma.activityLog.findMany({ orderBy: { createdAt: "desc" }, take: 6 }),
  ]);

  const canViewBilling = hasPermission(staff.role, "viewBilling");

  const [revenueTodayResult, revenueMonthResult, outstandingResult, completedTreatmentsCount] =
    canViewBilling
      ? await Promise.all([
          prisma.payment.aggregate({
            where: { paidAt: { gte: todayStart, lte: todayEnd } },
            _sum: { amount: true },
          }),
          prisma.payment.aggregate({
            where: { paidAt: { gte: monthStart } },
            _sum: { amount: true },
          }),
          prisma.invoice.aggregate({
            where: { remainingBalance: { gt: 0 } },
            _sum: { remainingBalance: true },
          }),
          prisma.treatmentItem.count({ where: { status: "COMPLETED" } }),
        ])
      : [null, null, null, 0];

  const dailyCounts = await Promise.all(
    Array.from({ length: 7 }).map(async (_, index) => {
      const day = addDays(todayStart, index - 6);
      const dayEnd = endOfDay(day);
      const count = await prisma.appointment.count({
        where: { startTime: { gte: day, lte: dayEnd } },
      });
      return { label: formatShortDate(day), count };
    })
  );

  const statusData = APPOINTMENT_STATUSES.map((status) => ({
    status,
    count:
      statusGroups.find((group) => group.status === status)?._count._all ?? 0,
  }));

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">
          مرحبًا، {staff.fullName.split(" ")[0]}
        </h1>
        <p className="mt-1 text-sm text-muted-foreground">
          نظرة عامة على أداء العيادة اليوم.
        </p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
        <StatCard label="حجوزات اليوم" value={todayCount} icon={CalendarClock} accent="primary" />
        <StatCard label="حجوزات قادمة" value={upcomingCount} icon={CalendarCheck} accent="turquoise" />
        <StatCard label="إجمالي المرضى" value={patientsCount} icon={Users} accent="primary" />
        <StatCard label="مكتملة هذا الشهر" value={completedThisMonth} icon={CheckCircle2} accent="emerald" />
        <StatCard label="ملغاة هذا الشهر" value={cancelledThisMonth} icon={CalendarX} accent="destructive" />
      </div>

      {canViewBilling && (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <StatCard
            label="إيرادات اليوم"
            value={formatCurrency(revenueTodayResult?._sum.amount ?? 0)}
            icon={Wallet}
            accent="emerald"
          />
          <StatCard
            label="إيرادات هذا الشهر"
            value={formatCurrency(revenueMonthResult?._sum.amount ?? 0)}
            icon={Wallet}
            accent="primary"
          />
          <StatCard
            label="مستحقات غير مسدّدة"
            value={formatCurrency(outstandingResult?._sum.remainingBalance ?? 0)}
            icon={CalendarX}
            accent="destructive"
          />
          <StatCard
            label="علاجات مكتملة"
            value={completedTreatmentsCount}
            icon={ClipboardCheck}
            accent="turquoise"
          />
        </div>
      )}

      <div className="grid gap-4 lg:grid-cols-3">
        <div className="rounded-2xl border border-border/70 bg-card p-5 lg:col-span-2">
          <h2 className="text-sm font-semibold">الحجوزات خلال آخر 7 أيام</h2>
          <div className="mt-4">
            <AppointmentsBarChart data={dailyCounts} />
          </div>
        </div>

        <div className="rounded-2xl border border-border/70 bg-card p-5">
          <h2 className="text-sm font-semibold">توزيع حالات المواعيد</h2>
          <div className="mt-4">
            <StatusDonutChart data={statusData} />
          </div>
        </div>
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        <div className="rounded-2xl border border-border/70 bg-card p-5">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-semibold">أحدث الحجوزات</h2>
            <Link
              href="/admin/appointments"
              className="text-xs font-medium text-primary hover:underline"
            >
              عرض الكل
            </Link>
          </div>
          <div className="mt-4 space-y-3">
            {recentAppointments.length === 0 && (
              <p className="text-sm text-muted-foreground">لا توجد حجوزات بعد.</p>
            )}
            {recentAppointments.map((appointment) => (
              <div
                key={appointment.id}
                className="flex items-center justify-between gap-3 rounded-xl border border-border/60 px-3 py-2.5"
              >
                <div className="min-w-0">
                  <p className="truncate text-sm font-medium">
                    {appointment.patient.fullName}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {formatDateTime(appointment.startTime)}
                  </p>
                </div>
                <span
                  className={cn(
                    "shrink-0 rounded-full px-2.5 py-1 text-xs font-medium",
                    APPOINTMENT_STATUS_BADGE_CLASSES[appointment.status]
                  )}
                >
                  {APPOINTMENT_STATUS_LABELS[appointment.status]}
                </span>
              </div>
            ))}
          </div>
        </div>

        <div className="rounded-2xl border border-border/70 bg-card p-5">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-semibold">آخر النشاطات</h2>
            <Link
              href="/admin/activity"
              className="text-xs font-medium text-primary hover:underline"
            >
              عرض الكل
            </Link>
          </div>
          <div className="mt-4 space-y-3">
            {recentActivity.length === 0 && (
              <p className="text-sm text-muted-foreground">لا يوجد نشاط بعد.</p>
            )}
            {recentActivity.map((entry) => (
              <div key={entry.id} className="flex items-start gap-3">
                <span className="mt-1.5 size-1.5 shrink-0 rounded-full bg-primary" />
                <div className="min-w-0">
                  <p className="text-sm leading-6">{entry.description}</p>
                  <p className="text-xs text-muted-foreground">
                    {entry.actorName} — {formatDateTime(entry.createdAt)}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
