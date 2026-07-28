import { redirect } from "next/navigation";
import { getCurrentStaff } from "@/lib/auth/current-staff";
import { hasPermission } from "@/lib/auth/permissions";
import { getClinicSettings } from "@/lib/clinic-settings";
import { ClinicSettingsForm } from "@/components/admin/settings/clinic/clinic-settings-form";

export const dynamic = "force-dynamic";

export default async function ClinicSettingsPage() {
  const staff = await getCurrentStaff();
  if (!hasPermission(staff.role, "viewClinicSettings")) redirect("/admin");

  const canEdit = hasPermission(staff.role, "manageSettings");
  const settings = await getClinicSettings();

  return (
    <div className="space-y-5">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">إعدادات هوية العيادة</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          {canEdit
            ? "هذه البيانات تُستخدم تلقائيًا في كل أنحاء الموقع: الصفحة الرئيسية، صفحة الحجز، لوحة الإدارة، الفواتير، وتسجيل الدخول."
            : "عرض فقط — التعديل متاح للطبيب."}
        </p>
      </div>

      <ClinicSettingsForm settings={settings} canEdit={canEdit} />
    </div>
  );
}
