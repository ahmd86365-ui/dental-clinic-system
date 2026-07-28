"use client";

import { usePathname, useRouter, useSearchParams } from "next/navigation";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { toDateKey } from "@/lib/calendar-utils";
import type { ReportRangePreset } from "@/lib/reports";

type DoctorOption = { id: string; firstName: string; lastName: string };

const PRESET_LABELS: Record<ReportRangePreset, string> = {
  today: "اليوم",
  week: "هذا الأسبوع",
  month: "هذا الشهر",
  year: "هذا العام",
  custom: "نطاق مخصص",
};

const PRESETS: ReportRangePreset[] = ["today", "week", "month", "year", "custom"];

export function ReportsFilterBar({
  preset,
  from,
  to,
  doctors,
  selectedDoctorId,
}: {
  preset: ReportRangePreset;
  from: Date;
  to: Date;
  doctors: DoctorOption[];
  selectedDoctorId: string | null;
}) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const pushParams = (updates: Record<string, string | null>) => {
    const params = new URLSearchParams(searchParams.toString());
    for (const [key, value] of Object.entries(updates)) {
      if (value === null) params.delete(key);
      else params.set(key, value);
    }
    router.push(`${pathname}?${params.toString()}`);
  };

  return (
    <div className="flex flex-col gap-3 sm:flex-row sm:flex-wrap sm:items-center sm:justify-between">
      <div className="flex flex-wrap items-center gap-1 rounded-lg border border-border/70 p-0.5">
        {PRESETS.map((p) => (
          <button
            key={p}
            type="button"
            onClick={() => pushParams({ range: p })}
            className={`rounded-md px-2.5 py-1 text-xs font-medium transition-colors ${
              preset === p
                ? "bg-primary text-primary-foreground"
                : "text-muted-foreground hover:bg-muted"
            }`}
          >
            {PRESET_LABELS[p]}
          </button>
        ))}
      </div>

      {preset === "custom" && (
        <div className="flex flex-wrap items-center gap-2">
          <input
            type="date"
            value={toDateKey(from)}
            onChange={(e) => e.target.value && pushParams({ range: "custom", from: e.target.value })}
            className="h-9 rounded-lg border border-border/70 bg-background px-2.5 text-sm"
          />
          <span className="text-sm text-muted-foreground">إلى</span>
          <input
            type="date"
            value={toDateKey(to)}
            onChange={(e) => e.target.value && pushParams({ range: "custom", to: e.target.value })}
            className="h-9 rounded-lg border border-border/70 bg-background px-2.5 text-sm"
          />
        </div>
      )}

      {doctors.length > 1 && (
        <Select
          value={selectedDoctorId ?? "ALL"}
          onValueChange={(v) => pushParams({ doctorId: !v || v === "ALL" ? null : v })}
        >
          <SelectTrigger className="w-full sm:w-48">
            <SelectValue placeholder="كل الأطباء" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="ALL">كل الأطباء</SelectItem>
            {doctors.map((doctor) => (
              <SelectItem key={doctor.id} value={doctor.id}>
                {doctor.firstName} {doctor.lastName}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      )}
    </div>
  );
}
