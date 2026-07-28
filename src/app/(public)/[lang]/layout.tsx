import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { Cairo } from "next/font/google";
import { Toaster } from "@/components/ui/sonner";
import { BookingDialogProvider } from "@/components/appointment/booking-dialog";
import { ClinicSettingsProvider } from "@/components/clinic-settings-provider";
import { PublicI18nProvider } from "@/components/public-i18n-provider";
import { Navbar } from "@/components/layout/navbar";
import { Footer } from "@/components/layout/footer";
import { getClinicSettings } from "@/lib/clinic-settings";
import { getDictionary } from "@/lib/i18n/get-dictionary";
import { isLocale, getDir, type Locale } from "@/lib/i18n/config";
import "@/app/globals.css";

const cairo = Cairo({
  variable: "--font-sans",
  subsets: ["arabic", "latin"],
  weight: ["400", "500", "600", "700", "800"],
});

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
    title: `${settings.clinicName} ${dict.meta.homeTitleSuffix}`,
    description:
      settings.clinicDescription ||
      `${settings.clinicName} ${dict.meta.homeTitleSuffix}.`,
    ...(settings.faviconUrl ? { icons: { icon: settings.faviconUrl } } : {}),
    alternates: {
      languages: { ar: "/", en: "/en", "x-default": "/" },
    },
    openGraph: {
      title: `${settings.clinicName} ${dict.meta.homeTitleSuffix}`,
      description:
        settings.clinicDescription ||
        `${settings.clinicName} ${dict.meta.homeTitleSuffix}.`,
      locale: locale === "ar" ? "ar_SY" : "en_US",
      type: "website",
    },
  };
}

export default async function PublicRootLayout({
  children,
  params,
}: Readonly<{
  children: React.ReactNode;
  params: Promise<{ lang: string }>;
}>) {
  const { lang } = await params;
  if (!isLocale(lang)) notFound();

  const [settings, dict] = await Promise.all([
    getClinicSettings(),
    getDictionary(lang),
  ]);

  const dir = getDir(lang);

  const themeOverrides: Record<string, string> = {};
  if (settings.primaryColor) {
    themeOverrides["--primary"] = settings.primaryColor;
    themeOverrides["--ring"] = settings.secondaryColor || settings.primaryColor;
  }
  if (settings.secondaryColor) {
    themeOverrides["--turquoise"] = settings.secondaryColor;
  }

  return (
    <html
      lang={lang}
      dir={dir}
      className={`${cairo.variable} h-full antialiased`}
      style={themeOverrides as React.CSSProperties}
    >
      <body className="min-h-full flex flex-col">
        <ClinicSettingsProvider settings={settings}>
          <PublicI18nProvider locale={lang} dict={dict}>
            <BookingDialogProvider>
              <Navbar />
              <main className="flex-1">{children}</main>
              <Footer dict={dict} />
            </BookingDialogProvider>
            <Toaster position="top-center" richColors dir={dir} />
          </PublicI18nProvider>
        </ClinicSettingsProvider>
      </body>
    </html>
  );
}
