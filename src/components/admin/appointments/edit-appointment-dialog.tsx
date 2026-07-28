"use client";

import { useState, useTransition } from "react";
import { toast } from "sonner";
import { Save } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { updateAppointmentDetails } from "@/app/(admin)/admin/appointments/actions";

type AppointmentForEdit = {
  id: string;
  reason: string;
  notes: string | null;
  startTime: Date;
};

function toDateInputValue(date: Date) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

function toTimeInputValue(date: Date) {
  const hours = String(date.getHours()).padStart(2, "0");
  const minutes = String(date.getMinutes()).padStart(2, "0");
  return `${hours}:${minutes}`;
}

export function EditAppointmentDialog({
  open,
  onOpenChange,
  appointment,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  appointment: AppointmentForEdit;
}) {
  const [isPending, startTransition] = useTransition();
  const [date, setDate] = useState(toDateInputValue(appointment.startTime));
  const [time, setTime] = useState(toTimeInputValue(appointment.startTime));
  const [reason, setReason] = useState(appointment.reason);
  const [notes, setNotes] = useState(appointment.notes ?? "");

  const handleSubmit = (event: React.FormEvent) => {
    event.preventDefault();

    startTransition(async () => {
      const result = await updateAppointmentDetails({
        id: appointment.id,
        date,
        time,
        reason,
        notes,
      });

      if (result.success) {
        toast.success("تم تحديث الموعد بنجاح");
        onOpenChange(false);
      } else {
        toast.error(result.error);
      }
    });
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <form onSubmit={handleSubmit} className="space-y-4">
          <DialogHeader>
            <DialogTitle>تعديل الموعد</DialogTitle>
            <DialogDescription>عدّل تفاصيل الموعد ثم احفظ التغييرات.</DialogDescription>
          </DialogHeader>

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label htmlFor="edit-date">التاريخ</Label>
              <Input
                id="edit-date"
                type="date"
                value={date}
                onChange={(event) => setDate(event.target.value)}
                required
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="edit-time">الوقت</Label>
              <Input
                id="edit-time"
                type="time"
                value={time}
                onChange={(event) => setTime(event.target.value)}
                required
              />
            </div>
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="edit-reason">سبب الزيارة</Label>
            <Input
              id="edit-reason"
              value={reason}
              onChange={(event) => setReason(event.target.value)}
              required
            />
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="edit-notes">ملاحظات</Label>
            <Textarea
              id="edit-notes"
              rows={3}
              value={notes}
              onChange={(event) => setNotes(event.target.value)}
            />
          </div>

          <DialogFooter>
            <Button type="submit" disabled={isPending} className="gap-2">
              <Save className="size-4" />
              حفظ التغييرات
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
