import type { ReactNode } from "react";
import { getCurrentStaff } from "@/lib/auth/current-staff";
import { AdminShell } from "@/components/admin/admin-shell";
import { StaffRoleProvider } from "@/components/admin/staff-role-context";

export const dynamic = "force-dynamic";

export default async function AdminLayout({
  children,
}: {
  children: ReactNode;
}) {
  const staff = await getCurrentStaff();

  return (
    <StaffRoleProvider role={staff.role}>
      <AdminShell staff={staff}>{children}</AdminShell>
    </StaffRoleProvider>
  );
}
