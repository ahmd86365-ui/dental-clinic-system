import { notFound, redirect } from "next/navigation";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { prisma } from "@/lib/prisma";
import { getCurrentStaff } from "@/lib/auth/current-staff";
import { hasPermission } from "@/lib/auth/permissions";
import { DoctorEditForm } from "@/components/admin/doctors/doctor-edit-form";

export const dynamic = "force-dynamic";

export default async function DoctorEditPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const staff = await getCurrentStaff();
  if (!hasPermission(staff.role, "manageStaff")) redirect("/admin");

  const { id } = await params;
  const doctor = await prisma.doctor.findUnique({ where: { id } });
  if (!doctor) notFound();

  return (
    <div className="max-w-2xl space-y-5">
      <div>
        <Link
          href="/admin/doctors"
          className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-primary"
        >
          <ArrowRight className="size-4" />
          العودة إلى قائمة الأطباء
        </Link>
        <h1 className="mt-4 text-2xl font-bold tracking-tight">
          {doctor.firstName} {doctor.lastName}
        </h1>
      </div>

      <DoctorEditForm doctor={doctor} />
    </div>
  );
}
