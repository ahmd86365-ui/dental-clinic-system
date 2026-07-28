"use client";

import { useState, useTransition } from "react";
import { toast } from "sonner";
import {
  CalendarClock,
  CheckCircle2,
  Pencil,
  Phone,
  Trash2,
  User,
  UserX,
  XCircle,
} from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { cn } from "@/lib/utils";
import { formatDateTime } from "@/lib/date-utils";
import { hasPermission } from "@/lib/auth/permissions";
import { useStaffRole } from "@/components/admin/staff-role-context";
import {
  APPOINTMENT_STATUS_BADGE_CLASSES,
  APPOINTMENT_STATUS_LABELS,
} from "@/lib/appointment-status";
import {
  deleteAppointment,
  updateAppointmentStatus,
} from "@/app/(admin)/admin/appointments/actions";
import { EditAppointmentDialog } from "@/components/admin/appointments/edit-appointment-dialog";
import type { CalendarAppointment } from "@/components/admin/appointments/calendar/types";

export function AppointmentDetailsDialog({
  open,
  onOpenChange,
  appointment,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  appointment: CalendarAppointment | null;
}) {
  const role = useStaffRole();
  const [isPending, startTransition] = useTransition();
  const [editOpen, setEditOpen] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);

  if (!appointment) return null;

  const handleStatus = (status: "CONFIRMED" | "COMPLETED" | "CANCELLED" | "NO_SHOW") => {
    startTransition(async () => {
      const result = await updateAppointmentStatus(appointment.id, status);
      if (result.success) toast.success("تم تحديث حالة الموعد");
      else toast.error(result.error);
    });
  };

  const handleDelete = () => {
    startTransition(async () => {
      const result = await deleteAppointment(appointment.id);
      if (result.success) {
        toast.success("تم حذف الموعد");
        setDeleteOpen(false);
        onOpenChange(false);
      } else {
        toast.error(result.error);
      }
    });
  };

  return (
    <>
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>{appointment.patient.fullName}</DialogTitle>
            <DialogDescription>{appointment.reason}</DialogDescription>
          </DialogHeader>

          <div className="space-y-3 text-sm">
            <div className="flex items-center gap-2">
              <span
                className={cn(
                  "rounded-full px-2.5 py-1 text-xs font-medium",
                  APPOINTMENT_STATUS_BADGE_CLASSES[appointment.status]
                )}
              >
                {APPOINTMENT_STATUS_LABELS[appointment.status]}
              </span>
            </div>

            <div className="flex items-center gap-2 text-muted-foreground">
              <CalendarClock className="size-4 text-primary" />
              {formatDateTime(appointment.startTime)}
            </div>
            <div className="flex items-center gap-2 text-muted-foreground">
              <Phone className="size-4 text-primary" />
              <span dir="ltr">{appointment.patient.phone}</span>
            </div>
            {appointment.patient.age !== null && (
              <div className="flex items-center gap-2 text-muted-foreground">
                <User className="size-4 text-primary" />
                {appointment.patient.age} سنة
              </div>
            )}
            {appointment.notes && (
              <p className="rounded-lg bg-muted/50 p-2.5 text-xs leading-relaxed">
                {appointment.notes}
              </p>
            )}
          </div>

          <DialogFooter className="flex-wrap gap-1.5 sm:justify-start">
            {hasPermission(role, "confirmAppointment") && appointment.status !== "CONFIRMED" && (
              <Button
                size="sm"
                variant="outline"
                className="gap-1.5"
                disabled={isPending}
                onClick={() => handleStatus("CONFIRMED")}
              >
                <CheckCircle2 className="size-3.5" />
                تأكيد
              </Button>
            )}
            {hasPermission(role, "editAppointment") && appointment.status !== "COMPLETED" && (
              <Button
                size="sm"
                variant="outline"
                className="gap-1.5"
                disabled={isPending}
                onClick={() => handleStatus("COMPLETED")}
              >
                <CheckCircle2 className="size-3.5" />
                مكتمل
              </Button>
            )}
            {hasPermission(role, "editAppointment") && appointment.status !== "NO_SHOW" && (
              <Button
                size="sm"
                variant="outline"
                className="gap-1.5"
                disabled={isPending}
                onClick={() => handleStatus("NO_SHOW")}
              >
                <UserX className="size-3.5" />
                لم يحضر
              </Button>
            )}
            {hasPermission(role, "editAppointment") && (
              <Button
                size="sm"
                variant="outline"
                className="gap-1.5"
                onClick={() => setEditOpen(true)}
              >
                <Pencil className="size-3.5" />
                تعديل
              </Button>
            )}
            {hasPermission(role, "cancelAppointment") && appointment.status !== "CANCELLED" && (
              <Button
                size="sm"
                variant="destructive"
                className="gap-1.5"
                disabled={isPending}
                onClick={() => handleStatus("CANCELLED")}
              >
                <XCircle className="size-3.5" />
                إلغاء
              </Button>
            )}
            {hasPermission(role, "deleteAppointment") && (
              <Button
                size="sm"
                variant="destructive"
                className="gap-1.5"
                onClick={() => setDeleteOpen(true)}
              >
                <Trash2 className="size-3.5" />
                حذف نهائي
              </Button>
            )}
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <EditAppointmentDialog open={editOpen} onOpenChange={setEditOpen} appointment={appointment} />

      <AlertDialog open={deleteOpen} onOpenChange={setDeleteOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>حذف الموعد نهائيًا؟</AlertDialogTitle>
            <AlertDialogDescription>
              لا يمكن التراجع عن هذا الإجراء بعد تنفيذه.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>إلغاء</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              className="bg-destructive text-white hover:bg-destructive/90"
            >
              حذف
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
