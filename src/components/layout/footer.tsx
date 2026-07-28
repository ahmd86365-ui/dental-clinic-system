import { Mail, MapPin, Phone } from "lucide-react";
import { siteConfig } from "@/config/site";
import { getClinicSettings } from "@/lib/clinic-settings";
import { ClinicLogo } from "@/components/clinic-logo";
import type { Dictionary } from "@/lib/i18n/dictionaries/ar";

export async function Footer({ dict }: { dict: Dictionary }) {
  const settings = await getClinicSettings();
  // Mirrors the first 4 items of the main Services section so the footer's
  // "Our Services" list stays in sync with one source of translated content.
  const services = dict.services.items.slice(0, 4).map((item) => item.title);

  const socialLinks = [
    { label: dict.footer.social.facebook, url: settings.facebookUrl },
    { label: dict.footer.social.instagram, url: settings.instagramUrl },
    { label: dict.footer.social.tiktok, url: settings.tiktokUrl },
    { label: dict.footer.social.x, url: settings.xUrl },
    { label: dict.footer.social.linkedin, url: settings.linkedinUrl },
    { label: dict.footer.social.youtube, url: settings.youtubeUrl },
  ].filter((item) => item.url);

  return (
    <footer className="border-t border-border/70 bg-secondary/40">
      <div className="mx-auto max-w-6xl px-4 py-14 sm:px-6">
        <div className="grid gap-10 sm:grid-cols-2 lg:grid-cols-4">
          <div>
            <a href="#home" className="flex items-center gap-2.5 font-bold">
              <ClinicLogo size="md" />
              <span>{settings.clinicName}</span>
            </a>
            <p className="mt-4 text-sm leading-6 text-muted-foreground">
              {settings.clinicDescription}
            </p>
            {socialLinks.length > 0 && (
              <div className="mt-5 flex flex-wrap gap-2">
                {socialLinks.map((item) => (
                  <a
                    key={item.label}
                    href={item.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="rounded-full border border-border px-3 py-1.5 text-xs text-muted-foreground transition-colors hover:border-primary hover:text-primary"
                  >
                    {item.label}
                  </a>
                ))}
              </div>
            )}
          </div>

          <div>
            <h4 className="text-sm font-semibold">{dict.footer.quickLinksTitle}</h4>
            <ul className="mt-4 space-y-3">
              {siteConfig.nav.map((item) => (
                <li key={item.href}>
                  <a
                    href={item.href}
                    className="text-sm text-muted-foreground transition-colors hover:text-primary"
                  >
                    {dict.nav[item.key]}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h4 className="text-sm font-semibold">{dict.footer.servicesTitle}</h4>
            <ul className="mt-4 space-y-3">
              {services.map((service) => (
                <li key={service}>
                  <a
                    href="#services"
                    className="text-sm text-muted-foreground transition-colors hover:text-primary"
                  >
                    {service}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h4 className="text-sm font-semibold">{dict.footer.contactTitle}</h4>
            <ul className="mt-4 space-y-3 text-sm text-muted-foreground">
              <li className="flex items-center gap-2">
                <Phone className="size-4 text-primary" />
                {settings.phone}
              </li>
              <li className="flex items-center gap-2">
                <Mail className="size-4 text-primary" />
                {settings.email}
              </li>
              <li className="flex items-center gap-2">
                <MapPin className="size-4 text-primary" />
                {settings.address}
              </li>
            </ul>
          </div>
        </div>

        <div className="mt-12 flex flex-col items-center gap-4 border-t border-border/70 pt-6 text-center sm:flex-row sm:justify-between sm:text-start">
          <p className="text-sm text-muted-foreground">
            © {new Date().getFullYear()} {settings.clinicName}.{" "}
            {dict.footer.rightsReserved}
          </p>
        </div>
      </div>
    </footer>
  );
}
