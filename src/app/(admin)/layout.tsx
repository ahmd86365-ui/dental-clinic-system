import type { Metadata } from "next";
import { Cairo } from "next/font/google";
import { Toaster } from "@/components/ui/sonner";
import { ClinicSettingsProvider } from "@/components/clinic-settings-provider";
import { getClinicSettings } from "@/lib/clinic-settings";
import "@/app/globals.css";

export const dynamic = "force-dynamic";

const cairo = Cairo({
  variable: "--font-sans",
  subsets: ["arabic", "latin"],
  weight: ["400", "500", "600", "700", "800"],
});

export async function generateMetadata(): Promise<Metadata> {
  const settings = await getClinicSettings();

  return {
    title: `${settings.clinicName} لطب وتجميل الأسنان`,
    description:
      settings.clinicDescription ||
      `${settings.clinicName} — رعاية أسنان متكاملة بأحدث التقنيات وأيدٍ خبيرة.`,
    ...(settings.faviconUrl ? { icons: { icon: settings.faviconUrl } } : {}),
  };
}

export default async function AdminRootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const settings = await getClinicSettings();

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
      lang="ar"
      dir="rtl"
      className={`${cairo.variable} h-full antialiased`}
      style={themeOverrides as React.CSSProperties}
    >
      <body className="min-h-full flex flex-col">
        <ClinicSettingsProvider settings={settings}>
          {children}
          <Toaster position="top-center" richColors dir="rtl" />
        </ClinicSettingsProvider>
      </body>
    </html>
  );
}
