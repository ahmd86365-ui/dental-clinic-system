"use client";

import { useState, useTransition } from "react";
import { toast } from "sonner";
import {
  CheckCircle2,
  MoreVertical,
  Pencil,
  Trash2,
  XCircle,
} from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
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
import { hasPermission } from "@/lib/auth/permissions";
import { deleteAppointment, updateAppointmentStatus } from "@/app/(admin)/admin/appointments/actions";
import { EditAppointmentDialog } from "@/components/admin/appointments/edit-appointment-dialog";
import type { AppointmentStatus, Staff } from "@/generated/prisma/client";

type AppointmentForMenu = {
  id: string;
  status: AppointmentStatus;
  reason: string;
  notes: string | null;
  startTime: Date;
};

export function AppointmentActionsMenu({
  role,
  appointment,
}: {
  role: Staff["role"];
  appointment: AppointmentForMenu;
}) {
  const [isPending, startTransition] = useTransition();
  const [editOpen, setEditOpen] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);

  const handleStatus = (status: AppointmentStatus) => {
    startTransition(async () => {
      const result = await updateAppointmentStatus(appointment.id, status);
      if (result.success) toast.success("تم تحديث حالة الموعد");
      else toast.error(result.error);
    });
  };

  const handleDelete = () => {
    startTransition(async () => {
      const result = await deleteAppointment(appointment.id);
      if (result.success) toast.success("تم حذف الموعد");
      else toast.error(result.error);
      setDeleteOpen(false);
    });
  };

  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger
          render={<Button variant="ghost" size="icon-sm" disabled={isPending} />}
        >
          <MoreVertical className="size-4" />
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          {hasPermission(role, "confirmAppointment") && (
            <DropdownMenuItem onClick={() => handleStatus("CONFIRMED")}>
              <CheckCircle2 className="size-4" />
              تأكيد الموعد
            </DropdownMenuItem>
          )}
          {hasPermission(role, "editAppointment") && (
            <DropdownMenuItem onClick={() => handleStatus("COMPLETED")}>
              <CheckCircle2 className="size-4" />
              وضع كمكتمل
            </DropdownMenuItem>
          )}
          {hasPermission(role, "editAppointment") && (
            <DropdownMenuItem onClick={() => setEditOpen(true)}>
              <Pencil className="size-4" />
              تعديل التفاصيل
            </DropdownMenuItem>
          )}
          {hasPermission(role, "cancelAppointment") && (
            <DropdownMenuItem
              variant="destructive"
              onClick={() => handleStatus("CANCELLED")}
            >
              <XCircle className="size-4" />
              إلغاء الموعد
            </DropdownMenuItem>
          )}
          {hasPermission(role, "deleteAppointment") && (
            <>
              <DropdownMenuSeparator />
              <DropdownMenuItem
                variant="destructive"
                onClick={() => setDeleteOpen(true)}
              >
                <Trash2 className="size-4" />
                حذف نهائي
              </DropdownMenuItem>
            </>
          )}
        </DropdownMenuContent>
      </DropdownMenu>

      <EditAppointmentDialog
        open={editOpen}
        onOpenChange={setEditOpen}
        appointment={appointment}
      />

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
