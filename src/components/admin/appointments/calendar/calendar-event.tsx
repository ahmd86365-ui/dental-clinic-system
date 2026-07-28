"use client";

import { cn } from "@/lib/utils";
import { formatTime } from "@/lib/date-utils";
import { APPOINTMENT_STATUS_LABELS } from "@/lib/appointment-status";
import type { CalendarAppointment } from "@/components/admin/appointments/calendar/types";

export function CalendarEvent({
  appointment,
  top,
  height,
  left,
  width,
  color,
  canEdit,
  isDragging,
  onClick,
  onDragStart,
  onDragEnd,
  onResizeStart,
}: {
  appointment: CalendarAppointment;
  top: number;
  height: number;
  left: number;
  width: number;
  color: string;
  canEdit: boolean;
  isDragging: boolean;
  onClick: () => void;
  onDragStart: (event: React.DragEvent) => void;
  onDragEnd: () => void;
  onResizeStart: (event: React.MouseEvent) => void;
}) {
  const isCancelled = appointment.status === "CANCELLED";

  return (
    <div
      draggable={canEdit}
      onDragStart={onDragStart}
      onDragEnd={onDragEnd}
      onClick={(event) => {
        event.stopPropagation();
        onClick();
      }}
      onDoubleClick={(event) => event.stopPropagation()}
      style={{
        top,
        height: Math.max(height, 20),
        insetInlineStart: `calc(${left}% + 2px)`,
        width: `calc(${width}% - 4px)`,
        borderInlineStartColor: color,
        opacity: isDragging ? 0.4 : isCancelled ? 0.55 : 1,
      }}
      className={cn(
        "group absolute z-10 overflow-hidden rounded-lg border border-border/60 border-s-4 bg-card px-1.5 py-1 text-right shadow-sm transition-opacity",
        canEdit ? "cursor-grab active:cursor-grabbing" : "cursor-pointer",
        isCancelled && "line-through"
      )}
    >
      <p className="truncate text-[0.7rem] font-semibold leading-tight">
        {appointment.patient.fullName}
      </p>
      <p className="truncate text-[0.65rem] leading-tight text-muted-foreground">
        {formatTime(appointment.startTime)} · {APPOINTMENT_STATUS_LABELS[appointment.status]}
      </p>

      {canEdit && (
        <div
          draggable={false}
          onMouseDown={(event) => {
            event.stopPropagation();
            onResizeStart(event);
          }}
          className="absolute inset-x-0 bottom-0 h-1.5 cursor-ns-resize opacity-0 group-hover:opacity-100"
        >
          <div className="mx-auto h-0.5 w-6 rounded-full bg-muted-foreground/50" />
        </div>
      )}
    </div>
  );
}
