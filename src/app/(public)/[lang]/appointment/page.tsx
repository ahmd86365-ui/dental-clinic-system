import type { Metadata } from "next";
import { CalendarCheck } from "lucide-react";
import { AppointmentForm } from "@/components/appointment/appointment-form";
import { getClinicSettings } from "@/lib/clinic-settings";
import { getDictionary } from "@/lib/i18n/get-dictionary";
import { isLocale, type Locale } from "@/lib/i18n/config";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ lang: string }>;
}): Promise<Metadata> {
  const { lang } = await params;
  const locale: Locale = isLocale(lang) ? lang : "ar";
  const settings = await getClinicSettings();
  const dict = await getDictionary(locale);

  return {
    title: `${dict.appointmentPage.metaTitle} | ${settings.clinicName}`,
    description: `${dict.appointmentPage.metaDescription} ${settings.clinicName} ${dict.meta.homeTitleSuffix}.`,
    alternates: {
      languages: { ar: "/appointment", en: "/en/appointment", "x-default": "/appointment" },
    },
  };
}

export default async function AppointmentPage({
  params,
}: {
  params: Promise<{ lang: string }>;
}) {
  const { lang } = await params;
  const locale: Locale = isLocale(lang) ? lang : "ar";
  const [settings, dict] = await Promise.all([
    getClinicSettings(),
    getDictionary(locale),
  ]);

  return (
    <section className="relative overflow-hidden py-16 sm:py-20">
      <div className="pointer-events-none absolute inset-0 -z-10 bg-[radial-gradient(circle_at_50%_-10%,color-mix(in_oklch,var(--primary),transparent_88%),transparent_55%)]" />

      <div className="mx-auto max-w-2xl px-4 text-center sm:px-6">
        <span className="mx-auto flex size-14 items-center justify-center rounded-2xl bg-primary text-primary-foreground">
          <CalendarCheck className="size-6" />
        </span>
        <h1 className="mt-5 text-3xl font-extrabold tracking-tight text-primary sm:text-4xl">
          {dict.booking.dialogTitle}
        </h1>
        <p className="mt-3 text-muted-foreground">
          {dict.booking.descriptionBefore}{" "}
          {settings.clinicName}.
        </p>
      </div>

      <div className="mx-auto mt-12 max-w-2xl px-4 sm:px-6">
        <div className="rounded-3xl border border-border/70 bg-card p-6 shadow-sm sm:p-10">
          <AppointmentForm />
        </div>
      </div>
    </section>
  );
}
