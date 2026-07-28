import { redirect } from "next/navigation";
import {
  CalendarCheck,
  CalendarClock,
  CheckCircle2,
  ClipboardCheck,
  ClipboardList,
  UserPlus,
  Users,
  Wallet,
} from "lucide-react";
import { prisma } from "@/lib/prisma";
import { getCurrentStaff } from "@/lib/auth/current-staff";
import { hasPermission } from "@/lib/auth/permissions";
import { formatCurrency } from "@/lib/date-utils";
import { StatCard } from "@/components/admin/stat-card";
import { StatusDonutChart } from "@/components/admin/charts/status-donut-chart";
import { GenericBarChart } from "@/components/admin/reports/generic-bar-chart";
import { GenericAreaChart } from "@/components/admin/reports/generic-area-chart";
import { GenericDonutChart } from "@/components/admin/reports/generic-donut-chart";
import { DoctorPerformanceChart } from "@/components/admin/reports/doctor-performance-chart";
import { ReportsFilterBar } from "@/components/admin/reports/reports-filter-bar";
import { ExportButtons } from "@/components/admin/reports/export-buttons";
import { PAYMENT_METHOD_CHART_COLORS, PAYMENT_METHOD_LABELS } from "@/lib/billing-labels";
import {
  buildExportTables,
  getReportsData,
  resolveReportRange,
  type ReportRangePreset,
} from "@/lib/reports";

export const dynamic = "force-dynamic";

export default async function ReportsPage({
  searchParams,
}: {
  searchParams: Promise<{ range?: string; from?: string; to?: string; doctorId?: string }>;
}) {
  const staff = await getCurrentStaff();
  if (!hasPermission(staff.role, "viewReports")) redirect("/admin");

  const params = await searchParams;
  const preset: ReportRangePreset = (
    ["today", "week", "month", "year", "custom"] as ReportRangePreset[]
  ).includes(params.range as ReportRangePreset)
    ? (params.range as ReportRangePreset)
    : "month";

  const { from, to } = resolveReportRange(preset, params.from, params.to);
  const selectedDoctorId = params.doctorId || null;

  // Only DOCTOR has full access to reports; RECEPTIONIST sees everything except
  // the per-doctor performance breakdown (agreed scope for "limited reports").
  const isFullAccess = staff.role === "DOCTOR";

  const activeDoctors = await prisma.doctor.findMany({
    where: { isActive: true },
    select: { id: true, firstName: true, lastName: true },
    orderBy: { firstName: "asc" },
  });

  const data = await getReportsData({
    from,
    to,
    doctorId: selectedDoctorId,
    includeDoctorPerformance: isFullAccess,
    activeDoctors,
  });

  const exportTables = buildExportTables(data);

  return (
    <div className="space-y-6">
      <div className="no-print flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">التقارير والتحليلات</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            تقارير مالية وإحصائية شاملة عن أداء العيادة.
          </p>
        </div>
        <ExportButtons tables={exportTables} fileNamePrefix="clinic-report" />
      </div>

      <div className="no-print">
        <ReportsFilterBar
          preset={preset}
          from={from}
          to={to}
          doctors={activeDoctors}
          selectedDoctorId={selectedDoctorId}
        />
      </div>

      <div className="print-area space-y-6">
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
          <StatCard
            label="إيرادات اليوم"
            value={formatCurrency(data.cards.todayRevenue)}
            icon={Wallet}
            accent="emerald"
          />
          <StatCard
            label="إيرادات هذا الشهر"
            value={formatCurrency(data.cards.monthlyRevenue)}
            icon={Wallet}
            accent="primary"
          />
          <StatCard
            label="إيرادات هذا العام"
            value={formatCurrency(data.cards.yearlyRevenue)}
            icon={Wallet}
            accent="turquoise"
          />
          <StatCard label="إجمالي المرضى" value={data.cards.totalPatients} icon={Users} accent="primary" />
          <StatCard
            label="مرضى جدد هذا الشهر"
            value={data.cards.newPatientsThisMonth}
            icon={UserPlus}
            accent="turquoise"
          />
        </div>

        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
          <StatCard
            label="مواعيد اليوم"
            value={data.cards.appointmentsToday}
            icon={CalendarClock}
            accent="primary"
          />
          <StatCard
            label="مواعيد قادمة"
            value={data.cards.upcomingAppointments}
            icon={CalendarCheck}
            accent="turquoise"
          />
          <StatCard
            label="أرصدة مستحقة"
            value={formatCurrency(data.cards.outstandingBalance)}
            icon={Wallet}
            accent="destructive"
          />
          <StatCard
            label="علاجات مكتملة"
            value={data.cards.completedTreatments}
            icon={CheckCircle2}
            accent="emerald"
          />
          <StatCard
            label="خطط علاج نشطة"
            value={data.cards.activeTreatmentPlans}
            icon={ClipboardList}
            accent="amber"
          />
        </div>

        <div className="grid gap-4 lg:grid-cols-2">
          <div className="rounded-2xl border border-border/70 bg-card p-5">
            <h2 className="text-sm font-semibold">الإيرادات الشهرية</h2>
            <p className="text-xs text-muted-foreground">آخر 12 شهرًا، بغض النظر عن الفلتر أعلاه</p>
            <div className="mt-4">
              <GenericBarChart
                data={data.revenueByMonth}
                valueLabel="الإيراد"
                color="var(--chart-1)"
                valueFormat="currency"
              />
            </div>
          </div>
          <div className="rounded-2xl border border-border/70 bg-card p-5">
            <h2 className="text-sm font-semibold">نمو المرضى (تراكمي)</h2>
            <p className="text-xs text-muted-foreground">آخر 12 شهرًا، بغض النظر عن الفلتر أعلاه</p>
            <div className="mt-4">
              <GenericAreaChart data={data.patientGrowth} valueLabel="إجمالي المرضى" />
            </div>
          </div>
        </div>

        <div className="grid gap-4 lg:grid-cols-2">
          <div className="rounded-2xl border border-border/70 bg-card p-5">
            <h2 className="text-sm font-semibold">اتجاه المرضى الجدد</h2>
            <p className="text-xs text-muted-foreground">آخر 12 شهرًا، بغض النظر عن الفلتر أعلاه</p>
            <div className="mt-4">
              <GenericBarChart
                data={data.newPatientsTrend}
                valueLabel="مرضى جدد"
                color="var(--chart-2)"
              />
            </div>
          </div>
          <div className="rounded-2xl border border-border/70 bg-card p-5">
            <h2 className="text-sm font-semibold">توزيع حالات المواعيد</h2>
            <p className="text-xs text-muted-foreground">ضمن النطاق المحدَّد أعلاه</p>
            <div className="mt-4">
              <StatusDonutChart data={data.appointmentStatusDistribution} />
            </div>
          </div>
        </div>

        <div className="grid gap-4 lg:grid-cols-2">
          <div className="rounded-2xl border border-border/70 bg-card p-5">
            <h2 className="text-sm font-semibold">الإيرادات حسب الخدمة</h2>
            <p className="text-xs text-muted-foreground">ضمن النطاق المحدَّد أعلاه</p>
            <div className="mt-4">
              <GenericBarChart
                data={data.revenueByService}
                valueLabel="الإيراد"
                color="var(--chart-3)"
                layout="horizontal"
                valueFormat="currency"
              />
            </div>
          </div>
          <div className="rounded-2xl border border-border/70 bg-card p-5">
            <h2 className="text-sm font-semibold">طرق الدفع</h2>
            <p className="text-xs text-muted-foreground">ضمن النطاق المحدَّد أعلاه</p>
            <div className="mt-4">
              <GenericDonutChart
                data={data.paymentMethods.map((p) => ({
                  name: PAYMENT_METHOD_LABELS[p.method],
                  value: p.amount,
                  color: PAYMENT_METHOD_CHART_COLORS[p.method],
                }))}
              />
            </div>
          </div>
        </div>

        <div className={`grid gap-4 ${data.doctorPerformance ? "lg:grid-cols-2" : ""}`}>
          <div className="rounded-2xl border border-border/70 bg-card p-5">
            <h2 className="text-sm font-semibold">أكثر الإجراءات شيوعًا</h2>
            <p className="text-xs text-muted-foreground">ضمن النطاق المحدَّد أعلاه</p>
            <div className="mt-4">
              <GenericBarChart
                data={data.topTreatments}
                valueLabel="عدد الإجراءات"
                color="var(--chart-4)"
                layout="horizontal"
              />
            </div>
          </div>

          {data.doctorPerformance && (
            <div className="rounded-2xl border border-border/70 bg-card p-5">
              <div className="flex items-center gap-2">
                <ClipboardCheck className="size-4 text-muted-foreground" />
                <h2 className="text-sm font-semibold">أداء الأطباء</h2>
              </div>
              <p className="text-xs text-muted-foreground">ضمن النطاق المحدَّد أعلاه</p>
              <div className="mt-4">
                <DoctorPerformanceChart data={data.doctorPerformance} />
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
