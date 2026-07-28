"use client";

import { toast } from "sonner";
import { cn } from "@/lib/utils";
import { formatTime } from "@/lib/date-utils";
import { formatWeekdayLabel, isSameDay, toDateKey } from "@/lib/calendar-utils";
import { getWorkingHoursForDate } from "@/lib/calendar-working-hours";
import { APPOINTMENT_STATUS_BADGE_CLASSES } from "@/lib/appointment-status";
import type { CalendarAppointment } from "@/components/admin/appointments/calendar/types";
import type { WorkingHourEntry } from "@/lib/clinic-settings-types";

const MAX_VISIBLE_PER_DAY = 3;

export function MonthView({
  monthDays,
  anchorDate,
  appointments,
  workingHours,
  doctorColorMap,
  canCreate,
  onEventClick,
  onDayClick,
  onCreateAt,
}: {
  monthDays: Date[];
  anchorDate: Date;
  appointments: CalendarAppointment[];
  workingHours: WorkingHourEntry[];
  doctorColorMap: Map<string, string>;
  canCreate: boolean;
  onEventClick: (appointment: CalendarAppointment) => void;
  onDayClick: (date: Date) => void;
  onCreateAt: (date: Date) => void;
}) {
  const now = new Date();
  const weekHeaderDays = monthDays.slice(0, 7);

  return (
    <div className="overflow-hidden rounded-2xl border border-border/70 bg-card">
      <div className="grid grid-cols-7 border-b border-border/60 bg-muted/30">
        {weekHeaderDays.map((day) => (
          <div key={toDateKey(day)} className="px-2 py-2 text-center text-xs font-medium">
            {formatWeekdayLabel(day)}
          </div>
        ))}
      </div>

      <div className="grid grid-cols-7">
        {monthDays.map((day) => {
          const inMonth = day.getMonth() === anchorDate.getMonth();
          const entry = getWorkingHoursForDate(workingHours, day);
          const isClosed = !entry || entry.closed;
          const dayAppointments = appointments
            .filter((a) => isSameDay(a.startTime, day))
            .sort((a, b) => a.startTime.getTime() - b.startTime.getTime());
          const visible = dayAppointments.slice(0, MAX_VISIBLE_PER_DAY);
          const overflowCount = dayAppointments.length - visible.length;
          const isToday = isSameDay(day, now);

          return (
            <div
              key={toDateKey(day)}
              onDoubleClick={() => {
                if (!canCreate) return;
                if (isClosed) {
                  toast.error("العيادة مغلقة في هذا اليوم");
                  return;
                }
                const target = new Date(day);
                const [openH, openM] = (entry?.open ?? "09:00").split(":").map(Number);
                target.setHours(openH, openM, 0, 0);
                onCreateAt(target);
              }}
              className={cn(
                "min-h-24 border-b border-e border-border/50 p-1.5 last:border-e-0 sm:min-h-28",
                !inMonth && "bg-muted/20",
                isClosed && inMonth && "bg-muted/40"
              )}
            >
              <button
                type="button"
                onClick={() => onDayClick(day)}
                className={cn(
                  "mb-1 inline-flex size-6 items-center justify-center rounded-full text-xs font-medium hover:bg-muted",
                  !inMonth && "text-muted-foreground/60",
                  isToday && "bg-primary text-primary-foreground hover:bg-primary/90"
                )}
              >
                {day.getDate()}
              </button>

              <div className="space-y-1">
                {visible.map((appointment) => (
                  <button
                    key={appointment.id}
                    type="button"
                    onClick={(event) => {
                      event.stopPropagation();
                      onEventClick(appointment);
                    }}
                    style={{
                      borderInlineStartColor:
                        doctorColorMap.get(appointment.doctorId) ?? "var(--primary)",
                    }}
                    className={cn(
                      "block w-full truncate rounded border-s-2 bg-muted/60 px-1.5 py-0.5 text-right text-[0.65rem] leading-tight hover:bg-muted",
                      APPOINTMENT_STATUS_BADGE_CLASSES[appointment.status]
                    )}
                  >
                    {formatTime(appointment.startTime)} {appointment.patient.fullName}
                  </button>
                ))}
                {overflowCount > 0 && (
                  <button
                    type="button"
                    onClick={() => onDayClick(day)}
                    className="text-[0.65rem] font-medium text-primary hover:underline"
                  >
                    +{overflowCount} أخرى
                  </button>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
