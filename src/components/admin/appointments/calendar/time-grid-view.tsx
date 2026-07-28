"use client";

import { useEffect, useRef, useState } from "react";
import { toast } from "sonner";
import { formatWeekdayLabel, isSameDay, toDateKey } from "@/lib/calendar-utils";
import {
  getWorkingHoursForDate,
  isRangeWithinWorkingHours,
  isWithinWorkingHours,
} from "@/lib/calendar-working-hours";
import { CalendarEvent } from "@/components/admin/appointments/calendar/calendar-event";
import type { CalendarAppointment } from "@/components/admin/appointments/calendar/types";
import type { WorkingHourEntry } from "@/lib/clinic-settings-types";

const HOUR_HEIGHT = 60;
const PIXELS_PER_MINUTE = HOUR_HEIGHT / 60;
const SNAP_MINUTES = 15;

function yToMinutesFromStart(y: number): number {
  const raw = y / PIXELS_PER_MINUTE;
  return Math.round(raw / SNAP_MINUTES) * SNAP_MINUTES;
}

function layoutDayEvents(appointments: CalendarAppointment[]) {
  const sorted = [...appointments].sort(
    (a, b) => a.startTime.getTime() - b.startTime.getTime()
  );
  const columnEnds: number[] = [];
  const placed: { appointment: CalendarAppointment; column: number }[] = [];

  for (const appointment of sorted) {
    let column = columnEnds.findIndex((end) => end <= appointment.startTime.getTime());
    if (column === -1) {
      column = columnEnds.length;
      columnEnds.push(appointment.endTime.getTime());
    } else {
      columnEnds[column] = appointment.endTime.getTime();
    }
    placed.push({ appointment, column });
  }

  const totalColumns = Math.max(columnEnds.length, 1);
  return placed.map(({ appointment, column }) => ({
    appointment,
    left: (column / totalColumns) * 100,
    width: 100 / totalColumns,
  }));
}

export function TimeGridView({
  days,
  appointments,
  workingHours,
  startHour,
  endHour,
  doctorColorMap,
  canEdit,
  canCreate,
  onEventClick,
  onCreateAt,
  onReschedule,
}: {
  days: Date[];
  appointments: CalendarAppointment[];
  workingHours: WorkingHourEntry[];
  startHour: number;
  endHour: number;
  doctorColorMap: Map<string, string>;
  canEdit: boolean;
  canCreate: boolean;
  onEventClick: (appointment: CalendarAppointment) => void;
  onCreateAt: (date: Date) => void;
  onReschedule: (id: string, startTime: Date, endTime: Date) => Promise<void>;
}) {
  const [draggingId, setDraggingId] = useState<string | null>(null);
  const [resizing, setResizing] = useState<{
    id: string;
    startClientY: number;
    originalDurationMinutes: number;
    previewDeltaMinutes: number;
  } | null>(null);
  const columnRefs = useRef(new Map<string, HTMLDivElement>());

  const totalHeight = (endHour - startHour) * HOUR_HEIGHT;
  const hourMarks = Array.from({ length: endHour - startHour }, (_, i) => startHour + i);
  const now = new Date();

  useEffect(() => {
    if (!resizing) return;

    const handleMove = (event: MouseEvent) => {
      const deltaY = event.clientY - resizing.startClientY;
      const deltaMinutes = Math.round(deltaY / PIXELS_PER_MINUTE / SNAP_MINUTES) * SNAP_MINUTES;
      setResizing((prev) => (prev ? { ...prev, previewDeltaMinutes: deltaMinutes } : prev));
    };

    const handleUp = async () => {
      const appointment = appointments.find((a) => a.id === resizing.id);
      setResizing(null);
      if (!appointment) return;

      const newDuration = Math.max(
        SNAP_MINUTES,
        resizing.originalDurationMinutes + resizing.previewDeltaMinutes
      );
      const newEnd = new Date(appointment.startTime.getTime() + newDuration * 60000);
      if (newEnd.getTime() === appointment.endTime.getTime()) return;

      if (!isRangeWithinWorkingHours(workingHours, appointment.startTime, newEnd)) {
        toast.error("لا يمكن تمديد الموعد خارج ساعات الدوام");
        return;
      }

      await onReschedule(appointment.id, appointment.startTime, newEnd);
    };

    window.addEventListener("mousemove", handleMove);
    window.addEventListener("mouseup", handleUp);
    return () => {
      window.removeEventListener("mousemove", handleMove);
      window.removeEventListener("mouseup", handleUp);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [resizing]);

  const handleDrop = async (event: React.DragEvent<HTMLDivElement>, day: Date) => {
    event.preventDefault();
    const id = event.dataTransfer.getData("text/plain");
    const appointment = appointments.find((a) => a.id === id);
    setDraggingId(null);
    if (!appointment) return;

    const column = columnRefs.current.get(toDateKey(day));
    if (!column) return;
    const rect = column.getBoundingClientRect();
    const offsetY = event.clientY - rect.top;
    const minutesFromStart = Math.max(0, yToMinutesFromStart(offsetY));

    const newStart = new Date(day);
    newStart.setHours(startHour, 0, 0, 0);
    newStart.setMinutes(newStart.getMinutes() + minutesFromStart);

    const durationMs = appointment.endTime.getTime() - appointment.startTime.getTime();
    const newEnd = new Date(newStart.getTime() + durationMs);

    if (newStart.getTime() === appointment.startTime.getTime()) return;

    if (!isRangeWithinWorkingHours(workingHours, newStart, newEnd)) {
      toast.error("لا يمكن جدولة الموعد خارج ساعات الدوام");
      return;
    }

    await onReschedule(appointment.id, newStart, newEnd);
  };

  return (
    <div className="flex overflow-x-auto rounded-2xl border border-border/70 bg-card">
      <div className="w-12 shrink-0 border-e border-border/60 sm:w-14">
        <div className="h-10 border-b border-border/60" />
        {hourMarks.map((hour) => (
          <div key={hour} style={{ height: HOUR_HEIGHT }} className="relative">
            <span className="absolute -top-2 right-1 text-[0.65rem] text-muted-foreground">
              {String(hour).padStart(2, "0")}:00
            </span>
          </div>
        ))}
      </div>

      {days.map((day) => {
        const entry = getWorkingHoursForDate(workingHours, day);
        const isClosed = !entry || entry.closed;
        const dayAppointments = appointments.filter((a) => isSameDay(a.startTime, day));
        const laidOut = layoutDayEvents(dayAppointments);
        const isToday = isSameDay(day, now);

        return (
          <div key={toDateKey(day)} className="min-w-32 flex-1 border-e border-border/60 last:border-e-0">
            <div className="flex h-10 flex-col items-center justify-center border-b border-border/60 bg-muted/30 text-xs">
              <span className="font-medium">{formatWeekdayLabel(day)}</span>
              <span className={isToday ? "font-bold text-primary" : "text-muted-foreground"}>
                {day.getDate()}
              </span>
            </div>

            <div
              ref={(el) => {
                if (el) columnRefs.current.set(toDateKey(day), el);
                else columnRefs.current.delete(toDateKey(day));
              }}
              style={{ height: totalHeight }}
              className="relative"
              onDragOver={(event) => {
                if (!canEdit) return;
                event.preventDefault();
                event.dataTransfer.dropEffect = "move";
              }}
              onDrop={(event) => canEdit && handleDrop(event, day)}
              onDoubleClick={(event) => {
                if (!canCreate || isClosed) return;
                const rect = event.currentTarget.getBoundingClientRect();
                const minutesFromStart = Math.max(
                  0,
                  yToMinutesFromStart(event.clientY - rect.top)
                );
                const target = new Date(day);
                target.setHours(startHour, 0, 0, 0);
                target.setMinutes(target.getMinutes() + minutesFromStart);

                if (!isWithinWorkingHours(workingHours, target)) {
                  toast.error("العيادة مغلقة في هذا الوقت");
                  return;
                }
                onCreateAt(target);
              }}
            >
              {hourMarks.map((hour, index) => (
                <div
                  key={hour}
                  style={{ top: index * HOUR_HEIGHT, height: HOUR_HEIGHT }}
                  className="absolute inset-x-0 border-b border-border/40"
                />
              ))}

              {isClosed && (
                <div className="absolute inset-0 bg-muted/50" title="يوم مغلق" />
              )}
              {!isClosed && entry && (
                <>
                  <ClosedBand
                    workingHours={workingHours}
                    entry={entry}
                    startHour={startHour}
                    hourHeight={HOUR_HEIGHT}
                    before
                  />
                  <ClosedBand
                    workingHours={workingHours}
                    entry={entry}
                    startHour={startHour}
                    hourHeight={HOUR_HEIGHT}
                  />
                </>
              )}

              {isToday && (
                <div
                  style={{
                    top:
                      (now.getHours() * 60 + now.getMinutes() - startHour * 60) *
                      PIXELS_PER_MINUTE,
                  }}
                  className="absolute inset-x-0 z-20 h-px bg-destructive"
                />
              )}

              {laidOut.map(({ appointment, left, width }) => {
                const isBeingResized = resizing?.id === appointment.id;
                const effectiveEnd = isBeingResized
                  ? new Date(
                      appointment.startTime.getTime() +
                        Math.max(
                          SNAP_MINUTES,
                          (appointment.endTime.getTime() - appointment.startTime.getTime()) /
                            60000 +
                            resizing.previewDeltaMinutes
                        ) *
                          60000
                    )
                  : appointment.endTime;

                const top =
                  (appointment.startTime.getHours() * 60 +
                    appointment.startTime.getMinutes() -
                    startHour * 60) *
                  PIXELS_PER_MINUTE;
                const height =
                  ((effectiveEnd.getTime() - appointment.startTime.getTime()) / 60000) *
                  PIXELS_PER_MINUTE;

                return (
                  <CalendarEvent
                    key={appointment.id}
                    appointment={appointment}
                    top={top}
                    height={height}
                    left={left}
                    width={width}
                    color={doctorColorMap.get(appointment.doctorId) ?? "var(--primary)"}
                    canEdit={canEdit}
                    isDragging={draggingId === appointment.id}
                    onClick={() => onEventClick(appointment)}
                    onDragStart={(event) => {
                      event.dataTransfer.setData("text/plain", appointment.id);
                      event.dataTransfer.effectAllowed = "move";
                      setDraggingId(appointment.id);
                    }}
                    onDragEnd={() => setDraggingId(null)}
                    onResizeStart={(event) => {
                      setResizing({
                        id: appointment.id,
                        startClientY: event.clientY,
                        originalDurationMinutes:
                          (appointment.endTime.getTime() - appointment.startTime.getTime()) /
                          60000,
                        previewDeltaMinutes: 0,
                      });
                    }}
                  />
                );
              })}
            </div>
          </div>
        );
      })}
    </div>
  );
}

function ClosedBand({
  entry,
  startHour,
  hourHeight,
  before,
}: {
  workingHours: WorkingHourEntry[];
  entry: WorkingHourEntry;
  startHour: number;
  hourHeight: number;
  before?: boolean;
}) {
  const [openH, openM] = entry.open.split(":").map(Number);
  const [closeH, closeM] = entry.close.split(":").map(Number);
  const pixelsPerMinute = hourHeight / 60;
  const openTop = (openH * 60 + openM - startHour * 60) * pixelsPerMinute;
  const closeTop = (closeH * 60 + closeM - startHour * 60) * pixelsPerMinute;

  if (before) {
    if (openTop <= 0) return null;
    return (
      <div
        style={{ top: 0, height: openTop }}
        className="pointer-events-none absolute inset-x-0 bg-muted/40"
      />
    );
  }

  return (
    <div
      style={{ top: closeTop, bottom: 0 }}
      className="pointer-events-none absolute inset-x-0 bg-muted/40"
    />
  );
}
