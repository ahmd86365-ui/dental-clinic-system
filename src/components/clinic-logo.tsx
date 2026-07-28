"use client";

import { SmilePlus } from "lucide-react";
import { cn } from "@/lib/utils";
import { useClinicSettings } from "@/components/clinic-settings-provider";

const SIZE_CLASSES = {
  sm: "size-9",
  md: "size-10",
  lg: "size-14",
};

const ICON_SIZE_CLASSES = {
  sm: "size-4",
  md: "size-5",
  lg: "size-6",
};

export function ClinicLogo({
  size = "md",
  className,
}: {
  size?: "sm" | "md" | "lg";
  className?: string;
}) {
  const settings = useClinicSettings();

  if (settings.logoUrl) {
    return (
      // eslint-disable-next-line @next/next/no-img-element
      <img
        src={settings.logoUrl}
        alt={settings.clinicName}
        className={cn(SIZE_CLASSES[size], "rounded-2xl object-cover", className)}
      />
    );
  }

  return (
    <span
      className={cn(
        SIZE_CLASSES[size],
        "flex items-center justify-center rounded-2xl bg-primary text-primary-foreground shadow-sm",
        className
      )}
    >
      <SmilePlus className={ICON_SIZE_CLASSES[size]} />
    </span>
  );
}
