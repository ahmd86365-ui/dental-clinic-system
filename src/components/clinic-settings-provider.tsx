"use client";

import { createContext, useContext, type ReactNode } from "react";
import { DEFAULT_CLINIC_SETTINGS, type ClinicSettingsData } from "@/lib/clinic-settings-types";

const ClinicSettingsContext = createContext<ClinicSettingsData>(DEFAULT_CLINIC_SETTINGS);

export function ClinicSettingsProvider({
  settings,
  children,
}: {
  settings: ClinicSettingsData;
  children: ReactNode;
}) {
  return (
    <ClinicSettingsContext.Provider value={settings}>
      {children}
    </ClinicSettingsContext.Provider>
  );
}

export function useClinicSettings(): ClinicSettingsData {
  return useContext(ClinicSettingsContext);
}
