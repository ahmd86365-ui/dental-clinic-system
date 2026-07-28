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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { createPatient, updatePatient } from "@/app/(admin)/admin/patients/actions";
import type { Gender } from "@/generated/prisma/client";

type PatientFormValues = {
  id?: string;
  fullName: string;
  phone: string;
  age: string;
  gender: Gender | "";
  email: string;
  notes: string;
};

const emptyForm: PatientFormValues = {
  fullName: "",
  phone: "",
  age: "",
  gender: "",
  email: "",
  notes: "",
};

export function PatientDialog({
  open,
  onOpenChange,
  patient,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  patient?: PatientFormValues;
}) {
  const [isPending, startTransition] = useTransition();
  const [form, setForm] = useState<PatientFormValues>(patient ?? emptyForm);

  const update = (field: keyof PatientFormValues, value: string) =>
    setForm((prev) => ({ ...prev, [field]: value }));

  const handleSubmit = (event: React.FormEvent) => {
    event.preventDefault();

    const payload = {
      fullName: form.fullName,
      phone: form.phone,
      age: form.age ? Number(form.age) : undefined,
      gender: (form.gender || undefined) as Gender | undefined,
      email: form.email,
      notes: form.notes,
    };

    startTransition(async () => {
      const result = form.id
        ? await updatePatient(form.id, payload)
        : await createPatient(payload);

      if (result.success) {
        toast.success(form.id ? "تم تحديث بيانات المريض" : "تم إضافة المريض بنجاح");
        setForm(emptyForm);
        onOpenChange(false);
      } else {
        toast.error(result.error);
      }
    });
  };

  return (
    <Dialog
      open={open}
      onOpenChange={(next) => {
        onOpenChange(next);
        if (!next) setForm(patient ?? emptyForm);
      }}
    >
      <DialogContent className="max-h-[92vh] max-w-lg overflow-y-auto">
        <form onSubmit={handleSubmit} className="space-y-4">
          <DialogHeader>
            <DialogTitle>{form.id ? "تعديل بيانات المريض" : "إضافة مريض جديد"}</DialogTitle>
            <DialogDescription>
              {form.id ? "حدّث بيانات المريض ثم احفظ." : "أدخل بيانات المريض الأساسية."}
            </DialogDescription>
          </DialogHeader>

          <div className="grid grid-cols-2 gap-3">
            <div className="col-span-2 space-y-1.5">
              <Label htmlFor="patient-name">الاسم الكامل</Label>
              <Input
                id="patient-name"
                value={form.fullName}
                onChange={(e) => update("fullName", e.target.value)}
                required
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="patient-phone">الهاتف</Label>
              <Input
                id="patient-phone"
                dir="ltr"
                value={form.phone}
                onChange={(e) => update("phone", e.target.value)}
                required
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="patient-age">العمر</Label>
              <Input
                id="patient-age"
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
              <Label htmlFor="patient-email">البريد الإلكتروني</Label>
              <Input
                id="patient-email"
                type="email"
                dir="ltr"
                value={form.email}
                onChange={(e) => update("email", e.target.value)}
              />
            </div>
            <div className="col-span-2 space-y-1.5">
              <Label htmlFor="patient-notes">ملاحظات</Label>
              <Textarea
                id="patient-notes"
                rows={3}
                value={form.notes}
                onChange={(e) => update("notes", e.target.value)}
              />
            </div>
          </div>

          <DialogFooter>
            <Button type="submit" disabled={isPending} className="gap-2">
              <Save className="size-4" />
              {form.id ? "حفظ التغييرات" : "إضافة المريض"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
