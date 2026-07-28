"use client";

import { useState, useTransition } from "react";
import { toast } from "sonner";
import { CalendarPlus } from "lucide-react";
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { createManualAppointment } from "@/app/(admin)/admin/appointments/actions";
import { todayDateString } from "@/lib/appointment-slots";

type DoctorOption = { id: string; firstName: string; lastName: string };

function buildForm(initialDate?: string, initialTime?: string, initialDoctorId?: string) {
  return {
    fullName: "",
    phone: "",
    age: "",
    gender: "" as "" | "MALE" | "FEMALE",
    reason: "",
    date: initialDate || todayDateString(),
    time: initialTime || "",
    notes: "",
    doctorId: initialDoctorId || "",
  };
}

export function NewAppointmentDialog({
  open,
  onOpenChange,
  initialDate,
  initialTime,
  initialDoctorId,
  doctors,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  initialDate?: string;
  initialTime?: string;
  initialDoctorId?: string;
  doctors?: DoctorOption[];
}) {
  const [isPending, startTransition] = useTransition();
  const [form, setForm] = useState(() =>
    buildForm(initialDate, initialTime, initialDoctorId)
  );

  const update = (field: keyof typeof form, value: string) =>
    setForm((prev) => ({ ...prev, [field]: value }));

  const handleSubmit = (event: React.FormEvent) => {
    event.preventDefault();

    startTransition(async () => {
      const result = await createManualAppointment({
        fullName: form.fullName,
        phone: form.phone,
        age: form.age ? Number(form.age) : undefined,
        gender: form.gender || undefined,
        reason: form.reason,
        date: form.date,
        time: form.time,
        notes: form.notes,
        doctorId: form.doctorId || undefined,
      });

      if (result.success) {
        toast.success("تم إضافة الحجز بنجاح");
        setForm(buildForm());
        onOpenChange(false);
      } else {
        toast.error(result.error);
      }
    });
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[92vh] max-w-lg overflow-y-auto">
        <form onSubmit={handleSubmit} className="space-y-4">
          <DialogHeader>
            <DialogTitle>إضافة حجز جديد</DialogTitle>
            <DialogDescription>
              أدخل بيانات المريض وموعد الزيارة.
            </DialogDescription>
          </DialogHeader>

          <div className="grid grid-cols-2 gap-3">
            <div className="col-span-2 space-y-1.5">
              <Label htmlFor="new-name">الاسم الكامل</Label>
              <Input
                id="new-name"
                value={form.fullName}
                onChange={(e) => update("fullName", e.target.value)}
                required
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="new-phone">الهاتف</Label>
              <Input
                id="new-phone"
                dir="ltr"
                value={form.phone}
                onChange={(e) => update("phone", e.target.value)}
                required
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="new-age">العمر</Label>
              <Input
                id="new-age"
                type="number"
                min={0}
                max={120}
                value={form.age}
                onChange={(e) => update("age", e.target.value)}
              />
            </div>
            <div className="space-y-1.5">
              <Label>الجنس</Label>
              <Select value={form.gender} onValueChange={(v) => update("gender", v ?? "")}>
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="اختر" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="MALE">ذكر</SelectItem>
                  <SelectItem value="FEMALE">أنثى</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="new-date">التاريخ</Label>
              <Input
                id="new-date"
                type="date"
                value={form.date}
                onChange={(e) => update("date", e.target.value)}
                required
              />
            </div>
            <div className="col-span-2 space-y-1.5">
              <Label htmlFor="new-time">الوقت</Label>
              <Input
                id="new-time"
                type="time"
                value={form.time}
                onChange={(e) => update("time", e.target.value)}
                required
              />
            </div>
            {doctors && doctors.length > 1 && (
              <div className="col-span-2 space-y-1.5">
                <Label>الطبيب</Label>
                <Select
                  value={form.doctorId}
                  onValueChange={(v) => update("doctorId", v ?? "")}
                >
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="اختر الطبيب" />
                  </SelectTrigger>
                  <SelectContent>
                    {doctors.map((doctor) => (
                      <SelectItem key={doctor.id} value={doctor.id}>
                        {doctor.firstName} {doctor.lastName}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            )}
            <div className="col-span-2 space-y-1.5">
              <Label htmlFor="new-reason">سبب الزيارة</Label>
              <Input
                id="new-reason"
                value={form.reason}
                onChange={(e) => update("reason", e.target.value)}
                required
              />
            </div>
            <div className="col-span-2 space-y-1.5">
              <Label htmlFor="new-notes">ملاحظات</Label>
              <Textarea
                id="new-notes"
                rows={3}
                value={form.notes}
                onChange={(e) => update("notes", e.target.value)}
              />
            </div>
          </div>

          <DialogFooter>
            <Button type="submit" disabled={isPending} className="gap-2">
              <CalendarPlus className="size-4" />
              إضافة الحجز
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
