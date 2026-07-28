import { redirect } from "next/navigation";
import Link from "next/link";
import { Plus } from "lucide-react";
import { prisma } from "@/lib/prisma";
import { getCurrentStaff } from "@/lib/auth/current-staff";
import { hasPermission } from "@/lib/auth/permissions";
import { Button } from "@/components/ui/button";
import { StaffTable } from "@/components/admin/staff/staff-table";

export const dynamic = "force-dynamic";

export default async function StaffPage() {
  const staff = await getCurrentStaff();
  if (!hasPermission(staff.role, "manageStaff")) redirect("/admin");

  const allStaff = await prisma.staff.findMany({ orderBy: { createdAt: "asc" } });

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">إدارة الموظفين</h1>
          <p className="mt-1 text-sm text-muted-foreground">{allStaff.length} موظف</p>
        </div>
        <Button render={<Link href="/admin/staff/new" />} className="gap-1.5">
          <Plus className="size-4" />
          إضافة موظف
        </Button>
      </div>

      <StaffTable staff={allStaff} currentStaffId={staff.id} />
    </div>
  );
}
