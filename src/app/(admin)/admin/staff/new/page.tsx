import { redirect } from "next/navigation";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { getCurrentStaff } from "@/lib/auth/current-staff";
import { hasPermission } from "@/lib/auth/permissions";
import { NewStaffForm } from "@/components/admin/staff/new-staff-form";

export const dynamic = "force-dynamic";

export default async function NewStaffPage() {
  const staff = await getCurrentStaff();
  if (!hasPermission(staff.role, "manageStaff")) redirect("/admin");

  return (
    <div className="max-w-2xl space-y-5">
      <div>
        <Link
          href="/admin/staff"
          className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-primary"
        >
          <ArrowRight className="size-4" />
          العودة إلى قائمة الموظفين
        </Link>
        <h1 className="mt-4 text-2xl font-bold tracking-tight">إضافة موظف جديد</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          سيتم إنشاء حساب دخول للموظف بالبريد الإلكتروني وكلمة المرور المحددة.
        </p>
      </div>

      <NewStaffForm />
    </div>
  );
}
