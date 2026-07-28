"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Save } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { updateDoctor } from "@/app/(admin)/admin/doctors/actions";
import type { Doctor } from "@/generated/prisma/client";

export function DoctorEditForm({ doctor }: { doctor: Doctor }) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [form, setForm] = useState({
    firstName: doctor.firstName,
    lastName: doctor.lastName,
    specialty: doctor.specialty ?? "",
    phone: doctor.phone ?? "",
    email: doctor.email ?? "",
    isActive: doctor.isActive,
  });

  const update = <K extends keyof typeof form>(field: K, value: (typeof form)[K]) =>
    setForm((prev) => ({ ...prev, [field]: value }));

  const handleSubmit = (event: React.FormEvent) => {
    event.preventDefault();

    startTransition(async () => {
      const result = await updateDoctor(doctor.id, {
        firstName: form.firstName,
        lastName: form.lastName,
        specialty: form.specialty || undefined,
        phone: form.phone || undefined,
        email: form.email || undefined,
        isActive: form.isActive,
      });

      if (result.success) {
        toast.success("تم تحديث بيانات الطبيب");
        router.refresh();
      } else {
        toast.error(result.error);
      }
    });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="rounded-2xl border border-border/70 bg-card p-5 sm:p-6">
        <h2 className="text-sm font-semibold">المعلومات الأساسية</h2>
        <div className="mt-4 grid gap-4 sm:grid-cols-2">
          <div className="space-y-1.5">
            <Label htmlFor="edit-doctor-first-name">الاسم الأول</Label>
            <Input
              id="edit-doctor-first-name"
              value={form.firstName}
              onChange={(e) => update("firstName", e.target.value)}
              required
            />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="edit-doctor-last-name">اسم العائلة</Label>
            <Input
              id="edit-doctor-last-name"
              value={form.lastName}
              onChange={(e) => update("lastName", e.target.value)}
              required
            />
          </div>
          <div className="space-y-1.5 sm:col-span-2">
            <Label htmlFor="edit-doctor-specialty">الاختصاص</Label>
            <Input
              id="edit-doctor-specialty"
              value={form.specialty}
              onChange={(e) => update("specialty", e.target.value)}
            />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="edit-doctor-phone">الهاتف</Label>
            <Input
              id="edit-doctor-phone"
              dir="ltr"
              value={form.phone}
              onChange={(e) => update("phone", e.target.value)}
            />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="edit-doctor-email">البريد الإلكتروني</Label>
            <Input
              id="edit-doctor-email"
              type="email"
              dir="ltr"
              value={form.email}
              onChange={(e) => update("email", e.target.value)}
            />
          </div>
        </div>
      </div>

      <div className="rounded-2xl border border-border/70 bg-card p-5 sm:p-6">
        <h2 className="text-sm font-semibold">الحالة</h2>
        <div className="mt-4 flex items-center justify-between rounded-xl border border-border/70 px-3 py-2.5">
          <Label htmlFor="edit-doctor-active" className="cursor-pointer">
            الطبيب فعّال
          </Label>
          <Switch
            id="edit-doctor-active"
            checked={form.isActive}
            onCheckedChange={(checked) => update("isActive", checked)}
          />
        </div>
        <p className="mt-2 text-xs text-muted-foreground">
          الطبيب المعطَّل لا يظهر في قائمة اختيار الطبيب عند الحجز أو فلتر التقويم، لكن مواعيده
          وسجلاته السابقة تبقى كما هي.
        </p>
      </div>

      <Button type="submit" disabled={isPending} className="gap-2">
        <Save className="size-4" />
        حفظ التغييرات
      </Button>
    </form>
  );
}
