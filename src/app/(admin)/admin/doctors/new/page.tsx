import { redirect } from "next/navigation";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { getCurrentStaff } from "@/lib/auth/current-staff";
import { hasPermission } from "@/lib/auth/permissions";
import { NewDoctorForm } from "@/components/admin/doctors/new-doctor-form";

export const dynamic = "force-dynamic";

export default async function NewDoctorPage() {
  const staff = await getCurrentStaff();
  if (!hasPermission(staff.role, "manageStaff")) redirect("/admin");

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
        <h1 className="mt-4 text-2xl font-bold tracking-tight">إضافة طبيب جديد</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          سيظهر الطبيب فورًا في تقويم المواعيد بلون خاص به وكخيار عند الحجز.
        </p>
      </div>

      <NewDoctorForm />
    </div>
  );
}
