"use client";

import { Clock, Hourglass, ListChecks } from "lucide-react";
import { cn } from "@/lib/utils";
import { formatShortDate, formatTime } from "@/lib/date-utils";
import {
  APPOINTMENT_STATUS_BADGE_CLASSES,
  APPOINTMENT_STATUS_LABELS,
} from "@/lib/appointment-status";
import type { AppointmentStatus } from "@/generated/prisma/client";

export type SidebarAppointment = {
  id: string;
  patientName: string;
  startTime: Date;
  status: AppointmentStatus;
};

function SidebarSection({
  icon: Icon,
  title,
  items,
  emptyLabel,
  onSelect,
}: {
  icon: typeof Clock;
  title: string;
  items: SidebarAppointment[];
  emptyLabel: string;
  onSelect: (id: string) => void;
}) {
  return (
    <div className="rounded-2xl border border-border/70 bg-card p-4">
      <div className="flex items-center gap-2">
        <span className="flex size-7 items-center justify-center rounded-lg bg-primary/10 text-primary">
          <Icon className="size-3.5" />
        </span>
        <h3 className="text-sm font-semibold">{title}</h3>
        <span className="text-xs text-muted-foreground">({items.length})</span>
      </div>

      <div className="mt-3 space-y-2">
        {items.length === 0 && (
          <p className="text-xs text-muted-foreground">{emptyLabel}</p>
        )}
        {items.slice(0, 6).map((item) => (
          <button
            key={item.id}
            type="button"
            onClick={() => onSelect(item.id)}
            className="flex w-full items-center justify-between gap-2 rounded-xl border border-border/60 px-2.5 py-2 text-right text-xs hover:border-primary/40 hover:bg-muted"
          >
            <span className="min-w-0 truncate font-medium">{item.patientName}</span>
            <span className="flex shrink-0 items-center gap-1.5 text-muted-foreground">
              {formatShortDate(item.startTime)} {formatTime(item.startTime)}
              <span
                className={cn(
                  "rounded-full px-1.5 py-0.5 font-medium",
                  APPOINTMENT_STATUS_BADGE_CLASSES[item.status]
                )}
              >
                {APPOINTMENT_STATUS_LABELS[item.status]}
              </span>
            </span>
          </button>
        ))}
      </div>
    </div>
  );
}

export function CalendarSidebar({
  today,
  upcoming,
  waiting,
  onSelect,
}: {
  today: SidebarAppointment[];
  upcoming: SidebarAppointment[];
  waiting: SidebarAppointment[];
  onSelect: (id: string) => void;
}) {
  return (
    <div className="w-full shrink-0 space-y-4 lg:w-72">
      <SidebarSection
        icon={Clock}
        title="مواعيد اليوم"
        items={today}
        emptyLabel="لا توجد مواعيد اليوم."
        onSelect={onSelect}
      />
      <SidebarSection
        icon={ListChecks}
        title="المواعيد القادمة"
        items={upcoming}
        emptyLabel="لا توجد مواعيد قادمة."
        onSelect={onSelect}
      />
      <SidebarSection
        icon={Hourglass}
        title="قائمة الانتظار"
        items={waiting}
        emptyLabel="لا توجد مواعيد بانتظار التأكيد."
        onSelect={onSelect}
      />
    </div>
  );
}
