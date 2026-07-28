import "server-only";
import type { Locale } from "@/lib/i18n/config";
import type { Dictionary } from "@/lib/i18n/dictionaries/ar";

const dictionaries: Record<Locale, () => Promise<Dictionary>> = {
  ar: () => import("@/lib/i18n/dictionaries/ar").then((m) => m.default),
  en: () => import("@/lib/i18n/dictionaries/en").then((m) => m.default),
};

export async function getDictionary(locale: Locale): Promise<Dictionary> {
  return dictionaries[locale]();
}
