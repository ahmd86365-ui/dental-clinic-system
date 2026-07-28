import { redirect } from "next/navigation";
import Link from "next/link";
import { Plus } from "lucide-react";
import { prisma } from "@/lib/prisma";
import { getCurrentStaff } from "@/lib/auth/current-staff";
import { hasPermission } from "@/lib/auth/permissions";
import { Button } from "@/components/ui/button";
import { DoctorTable } from "@/components/admin/doctors/doctor-table";

export const dynamic = "force-dynamic";

export default async function DoctorsPage() {
  const staff = await getCurrentStaff();
  if (!hasPermission(staff.role, "manageStaff")) redirect("/admin");

  const doctors = await prisma.doctor.findMany({ orderBy: { createdAt: "asc" } });

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">إدارة الأطباء</h1>
          <p className="mt-1 text-sm text-muted-foreground">{doctors.length} طبيب</p>
        </div>
        <Button render={<Link href="/admin/doctors/new" />} className="gap-1.5">
          <Plus className="size-4" />
          إضافة طبيب
        </Button>
      </div>

      <DoctorTable doctors={doctors} />
    </div>
  );
}
