"use client";

import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { DAY_LABELS, WEEK_ORDER } from "@/lib/working-hours";
import type { WorkingHourEntry } from "@/lib/clinic-settings-types";

export function WorkingHoursEditor({
  value,
  onChange,
  disabled,
}: {
  value: WorkingHourEntry[];
  onChange: (value: WorkingHourEntry[]) => void;
  disabled?: boolean;
}) {
  const update = (day: number, patch: Partial<WorkingHourEntry>) => {
    onChange(value.map((entry) => (entry.day === day ? { ...entry, ...patch } : entry)));
  };

  return (
    <div className="space-y-2">
      {WEEK_ORDER.map((day) => {
        const entry = value.find((e) => e.day === day);
        if (!entry) return null;

        return (
          <div
            key={day}
            className="grid grid-cols-[5rem_1fr_1fr_auto] items-center gap-3 rounded-lg border border-border/60 px-3 py-2"
          >
            <span className="text-sm font-medium">{DAY_LABELS[day]}</span>
            <Input
              type="time"
              value={entry.open}
              disabled={disabled || entry.closed}
              onChange={(e) => update(day, { open: e.target.value })}
            />
            <Input
              type="time"
              value={entry.close}
              disabled={disabled || entry.closed}
              onChange={(e) => update(day, { close: e.target.value })}
            />
            <div className="flex items-center gap-1.5">
              <Label className="text-xs text-muted-foreground">إغلاق</Label>
              <Switch
                checked={entry.closed}
                disabled={disabled}
                onCheckedChange={(checked) => update(day, { closed: checked })}
              />
            </div>
          </div>
        );
      })}
    </div>
  );
}
