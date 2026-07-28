import { notFound, redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { getCurrentStaff } from "@/lib/auth/current-staff";
import { hasPermission } from "@/lib/auth/permissions";
import { StaffProfileHeader } from "@/components/admin/staff/staff-profile-header";
import { StaffProfileForm } from "@/components/admin/staff/staff-profile-form";

export const dynamic = "force-dynamic";

export default async function StaffProfilePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const staff = await getCurrentStaff();
  if (!hasPermission(staff.role, "manageStaff")) redirect("/admin");

  const { id } = await params;
  const member = await prisma.staff.findUnique({ where: { id } });
  if (!member) notFound();

  const isSelf = member.id === staff.id;

  return (
    <div className="max-w-2xl space-y-6">
      <StaffProfileHeader staff={member} isSelf={isSelf} />
      <StaffProfileForm staff={member} isSelf={isSelf} />
    </div>
  );
}
