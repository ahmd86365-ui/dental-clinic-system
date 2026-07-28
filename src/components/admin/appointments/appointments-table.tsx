import { SortableHead } from "@/components/admin/sortable-head";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { cn } from "@/lib/utils";
import { formatShortDate, formatTime } from "@/lib/date-utils";
import {
  APPOINTMENT_STATUS_BADGE_CLASSES,
  APPOINTMENT_STATUS_LABELS,
} from "@/lib/appointment-status";
import { AppointmentActionsMenu } from "@/components/admin/appointments/appointment-actions-menu";
import type { AppointmentStatus, Gender, Staff } from "@/generated/prisma/client";

type AppointmentRow = {
  id: string;
  status: AppointmentStatus;
  reason: string;
  notes: string | null;
  startTime: Date;
  patient: {
    fullName: string;
    phone: string;
    age: number | null;
    gender: Gender | null;
  };
};

const GENDER_LABELS: Record<Gender, string> = {
  MALE: "ذكر",
  FEMALE: "أنثى",
};

export function AppointmentsTable({
  appointments,
  role,
  sortField,
  sortDir,
}: {
  appointments: AppointmentRow[];
  role: Staff["role"];
  sortField: string;
  sortDir: "asc" | "desc";
}) {
  return (
    <div className="rounded-2xl border border-border/70 bg-card">
      <Table>
        <TableHeader>
          <TableRow>
            <SortableHead label="الاسم" field="patientName" sortField={sortField} sortDir={sortDir} />
            <TableHead>الهاتف</TableHead>
            <TableHead>العمر</TableHead>
            <TableHead>الجنس</TableHead>
            <SortableHead label="التاريخ والوقت" field="startTime" sortField={sortField} sortDir={sortDir} />
            <TableHead>سبب الزيارة</TableHead>
            <TableHead>الحالة</TableHead>
            <TableHead className="text-left">إجراءات</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {appointments.length === 0 && (
            <TableRow>
              <TableCell colSpan={8} className="py-10 text-center text-muted-foreground">
                لا توجد نتائج مطابقة.
              </TableCell>
            </TableRow>
          )}
          {appointments.map((appointment) => (
            <TableRow key={appointment.id}>
              <TableCell className="font-medium">{appointment.patient.fullName}</TableCell>
              <TableCell dir="ltr" className="text-right">{appointment.patient.phone}</TableCell>
              <TableCell>{appointment.patient.age ?? "—"}</TableCell>
              <TableCell>
                {appointment.patient.gender ? GENDER_LABELS[appointment.patient.gender] : "—"}
              </TableCell>
              <TableCell>
                {formatShortDate(appointment.startTime)} — {formatTime(appointment.startTime)}
              </TableCell>
              <TableCell className="max-w-48 truncate">{appointment.reason}</TableCell>
              <TableCell>
                <span
                  className={cn(
                    "rounded-full px-2.5 py-1 text-xs font-medium",
                    APPOINTMENT_STATUS_BADGE_CLASSES[appointment.status]
                  )}
                >
                  {APPOINTMENT_STATUS_LABELS[appointment.status]}
                </span>
              </TableCell>
              <TableCell className="text-left">
                <AppointmentActionsMenu role={role} appointment={appointment} />
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
