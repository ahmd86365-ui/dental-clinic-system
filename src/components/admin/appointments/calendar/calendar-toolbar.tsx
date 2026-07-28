"use client";

import { useRef } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { ChevronLeft, ChevronRight, ListTodo, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { hasPermission } from "@/lib/auth/permissions";
import { useStaffRole } from "@/components/admin/staff-role-context";
import {
  addMonths,
  addWeeks,
  formatMonthYear,
  formatWeekRangeLabel,
  getWeekDays,
  toDateKey,
  type CalendarView,
} from "@/lib/calendar-utils";
import { addDays, formatShortDate } from "@/lib/date-utils";

type DoctorOption = { id: string; firstName: string; lastName: string };

export function CalendarToolbar({
  view,
  anchorDate,
  doctors,
  selectedDoctorId,
  onNewAppointment,
  onSwitchToList,
}: {
  view: CalendarView;
  anchorDate: Date;
  doctors: DoctorOption[];
  selectedDoctorId: string | null;
  onNewAppointment: () => void;
  onSwitchToList: () => void;
}) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const role = useStaffRole();
  const dateInputRef = useRef<HTMLInputElement>(null);

  const pushParams = (updates: Record<string, string | null>) => {
    const params = new URLSearchParams(searchParams.toString());
    for (const [key, value] of Object.entries(updates)) {
      if (value === null) params.delete(key);
      else params.set(key, value);
    }
    router.push(`${pathname}?${params.toString()}`);
  };

  const goToday = () => pushParams({ date: toDateKey(new Date()) });

  const goPrev = () => {
    const next =
      view === "month"
        ? addMonths(anchorDate, -1)
        : view === "week"
          ? addWeeks(anchorDate, -1)
          : addDays(anchorDate, -1);
    pushParams({ date: toDateKey(next) });
  };

  const goNext = () => {
    const next =
      view === "month"
        ? addMonths(anchorDate, 1)
        : view === "week"
          ? addWeeks(anchorDate, 1)
          : addDays(anchorDate, 1);
    pushParams({ date: toDateKey(next) });
  };

  const setView = (nextView: CalendarView) => pushParams({ view: nextView });

  const label =
    view === "month"
      ? formatMonthYear(anchorDate)
      : view === "week"
        ? formatWeekRangeLabel(getWeekDays(anchorDate))
        : formatShortDate(anchorDate);

  return (
    <div className="flex flex-col gap-3 sm:flex-row sm:flex-wrap sm:items-center sm:justify-between">
      <div className="flex flex-wrap items-center gap-2">
        <Button variant="outline" size="sm" onClick={goToday}>
          اليوم
        </Button>
        <div className="flex items-center gap-1">
          <Button variant="ghost" size="icon-sm" onClick={goNext} aria-label="التالي">
            <ChevronRight className="size-4" />
          </Button>
          <Button variant="ghost" size="icon-sm" onClick={goPrev} aria-label="السابق">
            <ChevronLeft className="size-4" />
          </Button>
        </div>
        <button
          type="button"
          onClick={() => dateInputRef.current?.showPicker?.() ?? dateInputRef.current?.click()}
          className="rounded-lg px-2 py-1 text-sm font-semibold hover:bg-muted"
        >
          {label}
        </button>
        <input
          ref={dateInputRef}
          type="date"
          className="sr-only"
          value={toDateKey(anchorDate)}
          onChange={(e) => e.target.value && pushParams({ date: e.target.value })}
        />
      </div>

      <div className="flex flex-wrap items-center gap-2">
        {doctors.length > 1 && (
          <Select
            value={selectedDoctorId ?? "ALL"}
            onValueChange={(v) => pushParams({ doctorId: !v || v === "ALL" ? null : v })}
          >
            <SelectTrigger className="w-full sm:w-44">
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

        <div className="flex rounded-lg border border-border/70 p-0.5">
          {(["day", "week", "month"] as CalendarView[]).map((v) => (
            <button
              key={v}
              type="button"
              onClick={() => setView(v)}
              className={`rounded-md px-2.5 py-1 text-xs font-medium transition-colors ${
                view === v
                  ? "bg-primary text-primary-foreground"
                  : "text-muted-foreground hover:bg-muted"
              }`}
            >
              {v === "day" ? "يوم" : v === "week" ? "أسبوع" : "شهر"}
            </button>
          ))}
        </div>

        <Button variant="outline" size="sm" className="gap-1.5" onClick={onSwitchToList}>
          <ListTodo className="size-3.5" />
          عرض القائمة
        </Button>

        {hasPermission(role, "createAppointment") && (
          <Button size="sm" className="gap-1.5" onClick={onNewAppointment}>
            <Plus className="size-4" />
            حجز جديد
          </Button>
        )}
      </div>
    </div>
  );
}
