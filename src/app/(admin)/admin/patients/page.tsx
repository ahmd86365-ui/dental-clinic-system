import { redirect } from "next/navigation";
import { Prisma } from "@/generated/prisma/client";
import { prisma } from "@/lib/prisma";
import { getCurrentStaff } from "@/lib/auth/current-staff";
import { hasPermission } from "@/lib/auth/permissions";
import { PatientsToolbar } from "@/components/admin/patients/patients-toolbar";
import { PatientsTable } from "@/components/admin/patients/patients-table";
import { Pagination } from "@/components/admin/pagination";

export const dynamic = "force-dynamic";

const PAGE_SIZE = 10;

type SearchParams = {
  q?: string;
  sort?: string;
  page?: string;
};

export default async function PatientsPage({
  searchParams,
}: {
  searchParams: Promise<SearchParams>;
}) {
  const staff = await getCurrentStaff();
  if (!hasPermission(staff.role, "viewPatients")) redirect("/admin");
  const params = await searchParams;

  const q = params.q?.trim() ?? "";
  const page = Math.max(1, Number(params.page) || 1);
  const [sortField, sortDir] = (params.sort ?? "createdAt:desc").split(":") as [
    "fullName" | "createdAt",
    "asc" | "desc",
  ];

  const where: Prisma.PatientWhereInput = q
    ? {
        OR: [
          { fullName: { contains: q, mode: "insensitive" } },
          { phone: { contains: q } },
        ],
      }
    : {};

  const [patients, total] = await Promise.all([
    prisma.patient.findMany({
      where,
      orderBy: { [sortField]: sortDir },
      skip: (page - 1) * PAGE_SIZE,
      take: PAGE_SIZE,
      include: { _count: { select: { appointments: true } } },
    }),
    prisma.patient.count({ where }),
  ]);

  const visitStats = await prisma.appointment.groupBy({
    by: ["patientId"],
    where: { patientId: { in: patients.map((p) => p.id) } },
    _min: { startTime: true },
    _max: { startTime: true },
  });

  const visitStatsMap = new Map(
    visitStats.map((stat) => [stat.patientId, stat])
  );

  const rows = patients.map((patient) => ({
    ...patient,
    visitCount: patient._count.appointments,
    firstVisit: visitStatsMap.get(patient.id)?._min.startTime ?? null,
    lastVisit: visitStatsMap.get(patient.id)?._max.startTime ?? null,
  }));

  return (
    <div className="space-y-5">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">إدارة المرضى</h1>
        <p className="mt-1 text-sm text-muted-foreground">{total} مريض مسجّل</p>
      </div>

      <PatientsToolbar role={staff.role} />

      <PatientsTable patients={rows} role={staff.role} sortField={sortField} sortDir={sortDir} />

      <Pagination page={page} pageSize={PAGE_SIZE} total={total} />
    </div>
  );
}
