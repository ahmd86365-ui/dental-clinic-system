import { CalendarClock } from "lucide-react";
import { cn } from "@/lib/utils";
import { formatDateTime } from "@/lib/date-utils";
import {
  APPOINTMENT_STATUS_BADGE_CLASSES,
  APPOINTMENT_STATUS_LABELS,
} from "@/lib/appointment-status";
import type { Appointment } from "@/generated/prisma/client";

export function PatientAppointmentsSection({
  upcoming,
  previous,
}: {
  upcoming: Appointment[];
  previous: Appointment[];
}) {
  return (
    <div className="rounded-2xl border border-border/70 bg-card p-5">
      <h2 className="flex items-center gap-2 text-sm font-semibold">
        <CalendarClock className="size-4 text-primary" />
        المواعيد
      </h2>

      <div className="mt-4 space-y-4">
        <div>
          <p className="text-xs font-medium text-muted-foreground">القادمة</p>
          {upcoming.length === 0 ? (
            <p className="mt-1 text-sm text-muted-foreground">لا توجد مواعيد قادمة.</p>
          ) : (
            <div className="mt-2 space-y-2">
              {upcoming.map((appt) => (
                <div
                  key={appt.id}
                  className="flex items-center justify-between rounded-lg border border-border/60 px-3 py-2 text-sm"
                >
                  <span>{formatDateTime(appt.startTime)}</span>
                  <span
                    className={cn(
                      "rounded-full px-2 py-0.5 text-xs font-medium",
                      APPOINTMENT_STATUS_BADGE_CLASSES[appt.status]
                    )}
                  >
                    {APPOINTMENT_STATUS_LABELS[appt.status]}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>

        <div>
          <p className="text-xs font-medium text-muted-foreground">السابقة</p>
          {previous.length === 0 ? (
            <p className="mt-1 text-sm text-muted-foreground">لا توجد مواعيد سابقة.</p>
          ) : (
            <div className="mt-2 space-y-2">
              {previous.slice(0, 5).map((appt) => (
                <div
                  key={appt.id}
                  className="flex items-center justify-between rounded-lg border border-border/60 px-3 py-2 text-sm"
                >
                  <span>{formatDateTime(appt.startTime)}</span>
                  <span
                    className={cn(
                      "rounded-full px-2 py-0.5 text-xs font-medium",
                      APPOINTMENT_STATUS_BADGE_CLASSES[appt.status]
                    )}
                  >
                    {APPOINTMENT_STATUS_LABELS[appt.status]}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
