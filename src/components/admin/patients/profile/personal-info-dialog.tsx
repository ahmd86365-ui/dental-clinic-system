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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { updatePersonalInfo } from "@/app/(admin)/admin/patients/[id]/actions";
import type { Gender } from "@/generated/prisma/client";

function toDateInputValue(date: Date | null) {
  if (!date) return "";
  const d = new Date(date);
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
}

type PatientPersonalInfo = {
  id: string;
  fullName: string;
  phone: string;
  gender: Gender | null;
  dateOfBirth: Date | null;
  address: string | null;
  emergencyContactName: string | null;
  emergencyContactPhone: string | null;
};

export function PersonalInfoDialog({
  open,
  onOpenChange,
  patient,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  patient: PatientPersonalInfo;
}) {
  const [isPending, startTransition] = useTransition();
  const [form, setForm] = useState({
    fullName: patient.fullName,
    phone: patient.phone,
    gender: (patient.gender ?? "") as Gender | "",
    dateOfBirth: toDateInputValue(patient.dateOfBirth),
    address: patient.address ?? "",
    emergencyContactName: patient.emergencyContactName ?? "",
    emergencyContactPhone: patient.emergencyContactPhone ?? "",
  });

  const update = (field: keyof typeof form, value: string) =>
    setForm((prev) => ({ ...prev, [field]: value }));

  const handleSubmit = (event: React.FormEvent) => {
    event.preventDefault();

    startTransition(async () => {
      const result = await updatePersonalInfo(patient.id, {
        fullName: form.fullName,
        phone: form.phone,
        gender: form.gender || undefined,
        dateOfBirth: form.dateOfBirth || undefined,
        address: form.address,
        emergencyContactName: form.emergencyContactName,
        emergencyContactPhone: form.emergencyContactPhone,
      });

      if (result.success) {
        toast.success("تم تحديث المعلومات الشخصية");
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
            <DialogTitle>تعديل المعلومات الشخصية</DialogTitle>
            <DialogDescription>حدّث بيانات المريض الأساسية.</DialogDescription>
          </DialogHeader>

          <div className="grid grid-cols-2 gap-3">
            <div className="col-span-2 space-y-1.5">
              <Label htmlFor="pi-name">الاسم الكامل</Label>
              <Input
                id="pi-name"
                value={form.fullName}
                onChange={(e) => update("fullName", e.target.value)}
                required
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="pi-phone">الهاتف</Label>
              <Input
                id="pi-phone"
                dir="ltr"
                value={form.phone}
                onChange={(e) => update("phone", e.target.value)}
                required
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
            <div className="col-span-2 space-y-1.5">
              <Label htmlFor="pi-dob">تاريخ الميلاد</Label>
              <Input
                id="pi-dob"
                type="date"
                value={form.dateOfBirth}
                onChange={(e) => update("dateOfBirth", e.target.value)}
              />
            </div>
            <div className="col-span-2 space-y-1.5">
              <Label htmlFor="pi-address">العنوان</Label>
              <Input
                id="pi-address"
                value={form.address}
                onChange={(e) => update("address", e.target.value)}
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="pi-ec-name">جهة اتصال الطوارئ (الاسم)</Label>
              <Input
                id="pi-ec-name"
                value={form.emergencyContactName}
                onChange={(e) => update("emergencyContactName", e.target.value)}
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="pi-ec-phone">هاتف جهة الطوارئ</Label>
              <Input
                id="pi-ec-phone"
                dir="ltr"
                value={form.emergencyContactPhone}
                onChange={(e) => update("emergencyContactPhone", e.target.value)}
              />
            </div>
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
