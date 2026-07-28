import type { Metadata } from "next";
import { LoginForm } from "@/app/(admin)/login/login-form";
import { getClinicSettings } from "@/lib/clinic-settings";
import { ClinicLogo } from "@/components/clinic-logo";

export async function generateMetadata(): Promise<Metadata> {
  const settings = await getClinicSettings();

  return {
    title: `تسجيل الدخول | ${settings.clinicName}`,
    description: "تسجيل الدخول إلى لوحة إدارة العيادة.",
  };
}

export default async function LoginPage() {
  const settings = await getClinicSettings();

  return (
    <div className="relative flex min-h-svh flex-1 items-center justify-center overflow-hidden px-4 py-12">
      <div className="pointer-events-none absolute inset-0 -z-10 bg-[radial-gradient(circle_at_50%_-10%,color-mix(in_oklch,var(--primary),transparent_88%),transparent_55%),radial-gradient(circle_at_100%_100%,color-mix(in_oklch,var(--turquoise),transparent_88%),transparent_55%)]" />

      <div className="w-full max-w-sm">
        <div className="mb-8 flex flex-col items-center text-center">
          <ClinicLogo size="lg" />
          <h1 className="mt-4 text-xl font-bold tracking-tight">
            {settings.clinicName}
          </h1>
          <p className="mt-1 text-sm text-muted-foreground">
            لوحة الإدارة — للموظفين فقط
          </p>
        </div>

        <div className="rounded-3xl border border-border/70 bg-card p-6 shadow-sm sm:p-8">
          <LoginForm />
        </div>
      </div>
    </div>
  );
}
