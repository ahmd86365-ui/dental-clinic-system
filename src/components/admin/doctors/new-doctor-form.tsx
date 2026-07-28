"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { UserPlus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { createDoctor } from "@/app/(admin)/admin/doctors/actions";

const emptyForm = {
  firstName: "",
  lastName: "",
  specialty: "",
  phone: "",
  email: "",
};

export function NewDoctorForm() {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [form, setForm] = useState(emptyForm);

  const update = <K extends keyof typeof form>(field: K, value: (typeof form)[K]) =>
    setForm((prev) => ({ ...prev, [field]: value }));

  const handleSubmit = (event: React.FormEvent) => {
    event.preventDefault();

    startTransition(async () => {
      const result = await createDoctor({
        firstName: form.firstName,
        lastName: form.lastName,
        specialty: form.specialty || undefined,
        phone: form.phone || undefined,
        email: form.email || undefined,
      });

      if (result.success) {
        toast.success("تم إضافة الطبيب بنجاح");
        router.push("/admin/doctors");
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
            <Label htmlFor="doctor-first-name">الاسم الأول</Label>
            <Input
              id="doctor-first-name"
              value={form.firstName}
              onChange={(e) => update("firstName", e.target.value)}
              required
            />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="doctor-last-name">اسم العائلة</Label>
            <Input
              id="doctor-last-name"
              value={form.lastName}
              onChange={(e) => update("lastName", e.target.value)}
              required
            />
          </div>
          <div className="space-y-1.5 sm:col-span-2">
            <Label htmlFor="doctor-specialty">الاختصاص (اختياري)</Label>
            <Input
              id="doctor-specialty"
              value={form.specialty}
              onChange={(e) => update("specialty", e.target.value)}
              placeholder="مثال: طب وتجميل الأسنان"
            />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="doctor-phone">الهاتف (اختياري)</Label>
            <Input
              id="doctor-phone"
              dir="ltr"
              value={form.phone}
              onChange={(e) => update("phone", e.target.value)}
            />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="doctor-email">البريد الإلكتروني (اختياري)</Label>
            <Input
              id="doctor-email"
              type="email"
              dir="ltr"
              value={form.email}
              onChange={(e) => update("email", e.target.value)}
            />
          </div>
        </div>
      </div>

      <Button type="submit" size="lg" disabled={isPending} className="gap-2">
        <UserPlus className="size-4" />
        إضافة الطبيب
      </Button>
    </form>
  );
}
