"use client";

import { usePathname, useRouter } from "next/navigation";
import { cn } from "@/lib/utils";
import { usePublicI18n } from "@/components/public-i18n-provider";
import { defaultLocale, type Locale } from "@/lib/i18n/config";

const LOCALE_COOKIE = "NEXT_LOCALE";
const LOCALE_COOKIE_MAX_AGE = 60 * 60 * 24 * 365;

const OPTIONS: { locale: Locale; flag: string; label: string }[] = [
  { locale: "ar", flag: "🇸🇦", label: "العربية" },
  { locale: "en", flag: "🇬🇧", label: "English" },
];

function getLocalizedPath(pathname: string, target: Locale): string {
  const segments = pathname.split("/").filter(Boolean);
  const hasEnPrefix = segments[0] === "en";
  const rest = hasEnPrefix ? segments.slice(1) : segments;

  if (target === defaultLocale) {
    return `/${rest.join("/")}`;
  }
  return `/${[target, ...rest].join("/")}`;
}

function persistLocaleCookie(target: Locale) {
  document.cookie = `${LOCALE_COOKIE}=${target}; path=/; max-age=${LOCALE_COOKIE_MAX_AGE}`;
}

export function LanguageSwitcher({ className }: { className?: string }) {
  const { locale } = usePublicI18n();
  const pathname = usePathname();
  const router = useRouter();

  const switchTo = (target: Locale) => {
    if (target === locale) return;
    persistLocaleCookie(target);
    router.push(getLocalizedPath(pathname, target));
  };

  return (
    <div className={cn("flex items-center gap-1", className)}>
      {OPTIONS.map((option) => (
        <button
          key={option.locale}
          type="button"
          onClick={() => switchTo(option.locale)}
          className={cn(
            "flex items-center gap-1.5 rounded-lg px-2.5 py-1.5 text-xs font-medium transition-colors",
            option.locale === locale
              ? "bg-primary/10 text-primary"
              : "text-muted-foreground hover:bg-accent hover:text-accent-foreground"
          )}
          aria-current={option.locale === locale}
        >
          <span aria-hidden="true">{option.flag}</span>
          {option.label}
        </button>
      ))}
    </div>
  );
}
