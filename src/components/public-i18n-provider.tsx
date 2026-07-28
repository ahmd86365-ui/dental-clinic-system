"use client";

import { createContext, useContext, type ReactNode } from "react";
import type { Locale } from "@/lib/i18n/config";
import type { Dictionary } from "@/lib/i18n/dictionaries/ar";

type PublicI18nValue = {
  locale: Locale;
  dict: Dictionary;
};

const PublicI18nContext = createContext<PublicI18nValue | null>(null);

export function PublicI18nProvider({
  locale,
  dict,
  children,
}: PublicI18nValue & { children: ReactNode }) {
  return (
    <PublicI18nContext.Provider value={{ locale, dict }}>
      {children}
    </PublicI18nContext.Provider>
  );
}

export function usePublicI18n(): PublicI18nValue {
  const value = useContext(PublicI18nContext);
  if (!value) {
    throw new Error("usePublicI18n must be used within a PublicI18nProvider");
  }
  return value;
}
