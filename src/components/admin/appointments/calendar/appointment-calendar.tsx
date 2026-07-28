"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { hasPermission } from "@/lib/auth/permissions";
import { useStaffRole } from "@/components/admin/staff-role-context";
import {
  getMonthGridDays,
  getWeekDays,
  toDateKey,
  type CalendarView,
} from "@/lib/calendar-utils";
import { getDisplayHourRange } from "@/lib/calendar-working-hours";
import { buildDoctorColorMap } from "@/lib/doctor-colors";
import { rescheduleAppointment } from "@/app/(admin)/admin/appointments/actions";
import { CalendarToolbar } from "@/components/admin/appointments/calendar/calendar-toolbar";
import { CalendarSidebar, type SidebarAppointment } from "@/components/admin/appointments/calendar/calendar-sidebar";
import { TimeGridView } from "@/components/admin/appointments/calendar/time-grid-view";
import { MonthView } from "@/components/admin/appointments/calendar/month-view";
import { AppointmentDetailsDialog } from "@/components/admin/appointments/calendar/appointment-details-dialog";
import { NewAppointmentDialog } from "@/components/admin/appointments/new-appointment-dialog";
import type { CalendarAppointment, DoctorOption } from "@/components/admin/appointments/calendar/types";
import type { WorkingHourEntry } from "@/lib/clinic-settings-types";

export function AppointmentCalendar({
  view,
  anchorDate,
  appointments,
  doctors,
  selectedDoctorId,
  workingHours,
  sidebarToday,
  sidebarUpcoming,
  sidebarWaiting,
}: {
  view: CalendarView;
  anchorDate: Date;
  appointments: CalendarAppointment[];
  doctors: DoctorOption[];
  selectedDoctorId: string | null;
  workingHours: WorkingHourEntry[];
  sidebarToday: SidebarAppointment[];
  sidebarUpcoming: SidebarAppointment[];
  sidebarWaiting: SidebarAppointment[];
}) {
  const router = useRouter();
  const role = useStaffRole();
  const canEdit = hasPermission(role, "editAppointment");
  const canCreate = hasPermission(role, "createAppointment");

  const [createState, setCreateState] = useState<{ date: string; time: string } | null>(null);
  const [detailsAppointment, setDetailsAppointment] = useState<CalendarAppointment | null>(null);
  const [detailsOpen, setDetailsOpen] = useState(false);

  const doctorColorMap = useMemo(
    () => buildDoctorColorMap(doctors.map((d) => d.id)),
    [doctors]
  );

  const days = useMemo(() => {
    if (view === "month") return getMonthGridDays(anchorDate);
    if (view === "week") return getWeekDays(anchorDate);
    return [anchorDate];
  }, [view, anchorDate]);

  const { startHour, endHour } = useMemo(
    () => getDisplayHourRange(workingHours, view === "month" ? [anchorDate] : days),
    [workingHours, view, days, anchorDate]
  );

  const openDetails = (appointment: CalendarAppointment) => {
    setDetailsAppointment(appointment);
    setDetailsOpen(true);
  };

  const openDetailsById = (id: string) => {
    const appointment = appointments.find((a) => a.id === id);
    if (appointment) openDetails(appointment);
  };

  const openCreateAt = (date: Date) => {
    const hours = String(date.getHours()).padStart(2, "0");
    const minutes = String(date.getMinutes()).padStart(2, "0");
    setCreateState({ date: toDateKey(date), time: `${hours}:${minutes}` });
  };

  const handleReschedule = async (id: string, startTime: Date, endTime: Date) => {
    const result = await rescheduleAppointment(id, {
      startTime: startTime.toISOString(),
      endTime: endTime.toISOString(),
    });
    if (result.success) {
      toast.success("تم نقل الموعد بنجاح");
      router.refresh();
    } else {
      toast.error(result.error);
    }
  };

  return (
    <div className="space-y-4">
      <CalendarToolbar
        view={view}
        anchorDate={anchorDate}
        doctors={doctors}
        selectedDoctorId={selectedDoctorId}
        onNewAppointment={() => setCreateState({ date: toDateKey(new Date()), time: "" })}
        onSwitchToList={() => {
          const params = new URLSearchParams(window.location.search);
          params.set("mode", "list");
          router.push(`${window.location.pathname}?${params.toString()}`);
        }}
      />

      <div className="flex flex-col gap-4 lg:flex-row">
        <div className="min-w-0 flex-1">
          {view === "month" ? (
            <MonthView
              monthDays={days}
              anchorDate={anchorDate}
              appointments={appointments}
              workingHours={workingHours}
              doctorColorMap={doctorColorMap}
              canCreate={canCreate}
              onEventClick={openDetails}
              onDayClick={(date) => {
                const params = new URLSearchParams(window.location.search);
                params.set("view", "day");
                params.set("date", toDateKey(date));
                router.push(`${window.location.pathname}?${params.toString()}`);
              }}
              onCreateAt={openCreateAt}
            />
          ) : (
            <TimeGridView
              days={days}
              appointments={appointments}
              workingHours={workingHours}
              startHour={startHour}
              endHour={endHour}
              doctorColorMap={doctorColorMap}
              canEdit={canEdit}
              canCreate={canCreate}
              onEventClick={openDetails}
              onCreateAt={openCreateAt}
              onReschedule={handleReschedule}
            />
          )}
        </div>

        <CalendarSidebar
          today={sidebarToday}
          upcoming={sidebarUpcoming}
          waiting={sidebarWaiting}
          onSelect={openDetailsById}
        />
      </div>

      <NewAppointmentDialog
        open={createState !== null}
        onOpenChange={(open) => !open && setCreateState(null)}
        initialDate={createState?.date}
        initialTime={createState?.time}
        initialDoctorId={selectedDoctorId ?? undefined}
        doctors={doctors}
      />

      <AppointmentDetailsDialog
        open={detailsOpen}
        onOpenChange={setDetailsOpen}
        appointment={detailsAppointment}
      />
    </div>
  );
}
