"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { UserPlus } from "lucide-react";
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
import { StaffAvatarField } from "@/components/admin/staff/staff-avatar-field";
import { createStaff } from "@/app/(admin)/admin/staff/actions";
import { STAFF_ROLE_OPTIONS } from "@/lib/staff-roles";
import type { StaffRole } from "@/generated/prisma/client";

const emptyForm = {
  fullName: "",
  email: "",
  phone: "",
  role: "RECEPTIONIST" as StaffRole,
  jobTitle: "",
  hireDate: "",
  notes: "",
  avatarUrl: "",
  password: "",
};

export function NewStaffForm() {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [form, setForm] = useState(emptyForm);

  const update = <K extends keyof typeof form>(field: K, value: (typeof form)[K]) =>
    setForm((prev) => ({ ...prev, [field]: value }));

  const handleSubmit = (event: React.FormEvent) => {
    event.preventDefault();

    startTransition(async () => {
      const result = await createStaff({
        fullName: form.fullName,
        email: form.email,
        phone: form.phone || undefined,
        role: form.role,
        jobTitle: form.jobTitle || undefined,
        hireDate: form.hireDate || undefined,
        notes: form.notes || undefined,
        avatarUrl: form.avatarUrl || undefined,
        password: form.password,
      });

      if (result.success) {
        toast.success("تم إنشاء حساب الموظف بنجاح");
        router.push("/admin/staff");
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
            <Label htmlFor="staff-name">الاسم الكامل</Label>
            <Input
              id="staff-name"
              value={form.fullName}
              onChange={(e) => update("fullName", e.target.value)}
              required
            />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="staff-email">البريد الإلكتروني</Label>
            <Input
              id="staff-email"
              type="email"
              dir="ltr"
              value={form.email}
              onChange={(e) => update("email", e.target.value)}
              required
            />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="staff-phone">الهاتف (اختياري)</Label>
            <Input
              id="staff-phone"
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
            <Label htmlFor="staff-job-title">المسمى الوظيفي (اختياري)</Label>
            <Input
              id="staff-job-title"
              value={form.jobTitle}
              onChange={(e) => update("jobTitle", e.target.value)}
              placeholder="مثال: طبيب أسنان عام"
            />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="staff-hire-date">تاريخ التعيين (اختياري)</Label>
            <Input
              id="staff-hire-date"
              type="date"
              value={form.hireDate}
              onChange={(e) => update("hireDate", e.target.value)}
            />
          </div>
          <div className="space-y-1.5 sm:col-span-2">
            <Label htmlFor="staff-notes">ملاحظات (اختياري)</Label>
            <Textarea
              id="staff-notes"
              rows={3}
              value={form.notes}
              onChange={(e) => update("notes", e.target.value)}
            />
          </div>
        </div>
      </div>

      <div className="rounded-2xl border border-border/70 bg-card p-5 sm:p-6">
        <h2 className="text-sm font-semibold">بيانات الدخول</h2>
        <div className="mt-4 grid gap-4 sm:grid-cols-2">
          <div className="space-y-1.5 sm:col-span-2">
            <Label htmlFor="staff-password">كلمة المرور</Label>
            <Input
              id="staff-password"
              type="password"
              dir="ltr"
              minLength={8}
              value={form.password}
              onChange={(e) => update("password", e.target.value)}
              required
            />
            <p className="text-xs text-muted-foreground">
              8 أحرف على الأقل، وتحتوي على حرف كبير وحرف صغير ورقم.
            </p>
          </div>
        </div>
      </div>

      <Button type="submit" size="lg" disabled={isPending} className="gap-2">
        <UserPlus className="size-4" />
        إنشاء الحساب
      </Button>
    </form>
  );
}
