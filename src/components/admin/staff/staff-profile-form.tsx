"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Save } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { StaffAvatarField } from "@/components/admin/staff/staff-avatar-field";
import { updateStaff } from "@/app/(admin)/admin/staff/actions";
import { STAFF_ROLE_OPTIONS } from "@/lib/staff-roles";
import type { Staff, StaffRole } from "@/generated/prisma/client";

function toDateInputValue(date: Date | null) {
  if (!date) return "";
  const d = new Date(date);
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
}

export function StaffProfileForm({ staff, isSelf }: { staff: Staff; isSelf: boolean }) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [form, setForm] = useState({
    fullName: staff.fullName,
    email: staff.email,
    phone: staff.phone ?? "",
    role: staff.role,
    jobTitle: staff.jobTitle ?? "",
    hireDate: toDateInputValue(staff.hireDate),
    notes: staff.notes ?? "",
    avatarUrl: staff.avatarUrl ?? "",
    isActive: staff.isActive,
  });

  const update = <K extends keyof typeof form>(field: K, value: (typeof form)[K]) =>
    setForm((prev) => ({ ...prev, [field]: value }));

  const handleSubmit = (event: React.FormEvent) => {
    event.preventDefault();

    startTransition(async () => {
      const result = await updateStaff(staff.id, {
        fullName: form.fullName,
        email: form.email,
        phone: form.phone || undefined,
        role: form.role,
        jobTitle: form.jobTitle || undefined,
        hireDate: form.hireDate || undefined,
        notes: form.notes || undefined,
        avatarUrl: form.avatarUrl || undefined,
        isActive: form.isActive,
      });

      if (result.success) {
        toast.success("تم تحديث بيانات الموظف");
        router.refresh();
      } else {
        toast.error(result.error);
      }
    });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="rounded-2xl border border-border/70 bg-card p-5 sm:p-6">
        <h2 className="text-sm font-semibold">الصورة الشخصية</h2>
        <div className="mt-4">
          <StaffAvatarField value={form.avatarUrl} onChange={(url) => update("avatarUrl", url)} />
        </div>
      </div>

      <div className="rounded-2xl border border-border/70 bg-card p-5 sm:p-6">
        <h2 className="text-sm font-semibold">المعلومات الأساسية</h2>
        <div className="mt-4 grid gap-4 sm:grid-cols-2">
          <div className="space-y-1.5">
            <Label htmlFor="edit-staff-name">الاسم الكامل</Label>
            <Input
              id="edit-staff-name"
              value={form.fullName}
              onChange={(e) => update("fullName", e.target.value)}
              required
            />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="edit-staff-email">البريد الإلكتروني</Label>
            <Input
              id="edit-staff-email"
              type="email"
              dir="ltr"
              value={form.email}
              onChange={(e) => update("email", e.target.value)}
              required
            />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="edit-staff-phone">الهاتف</Label>
            <Input
              id="edit-staff-phone"
              dir="ltr"
              value={form.phone}
              onChange={(e) => update("phone", e.target.value)}
            />
          </div>
          <div className="space-y-1.5">
            <Label>الدور الوظيفي</Label>
            <Select
              value={form.role}
              onValueChange={(v) => v && update("role", v as StaffRole)}
              disabled={isSelf}
            >
              <SelectTrigger className="w-full">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {STAFF_ROLE_OPTIONS.map((option) => (
                  <SelectItem key={option.value} value={option.value}>
                    {option.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="edit-staff-job-title">المسمى الوظيفي</Label>
            <Input
              id="edit-staff-job-title"
              value={form.jobTitle}
              onChange={(e) => update("jobTitle", e.target.value)}
            />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="edit-staff-hire-date">تاريخ التعيين</Label>
            <Input
              id="edit-staff-hire-date"
              type="date"
              value={form.hireDate}
              onChange={(e) => update("hireDate", e.target.value)}
            />
          </div>
          <div className="space-y-1.5 sm:col-span-2">
            <Label htmlFor="edit-staff-notes">ملاحظات</Label>
            <Textarea
              id="edit-staff-notes"
              rows={3}
              value={form.notes}
              onChange={(e) => update("notes", e.target.value)}
            />
          </div>
        </div>
      </div>

      <div className="rounded-2xl border border-border/70 bg-card p-5 sm:p-6">
        <h2 className="text-sm font-semibold">الحالة</h2>
        <div className="mt-4 flex items-center justify-between rounded-xl border border-border/70 px-3 py-2.5">
          <Label htmlFor="edit-staff-active" className="cursor-pointer">
            الحساب فعّال
          </Label>
          <Switch
            id="edit-staff-active"
            checked={form.isActive}
            onCheckedChange={(checked) => update("isActive", checked)}
            disabled={isSelf}
          />
        </div>
        {isSelf && (
          <p className="mt-2 text-xs text-muted-foreground">
            لا يمكنك تعديل دورك الوظيفي أو تعطيل حسابك الخاص.
          </p>
        )}
      </div>

      <Button type="submit" disabled={isPending} className="gap-2">
        <Save className="size-4" />
        حفظ التغييرات
      </Button>
    </form>
  );
}
