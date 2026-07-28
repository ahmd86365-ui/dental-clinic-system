"use client";

import { useState, useTransition } from "react";
import { toast } from "sonner";
import { Save } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { AssetUploadField } from "@/components/admin/settings/clinic/asset-upload-field";
import { WorkingHoursEditor } from "@/components/admin/settings/clinic/working-hours-editor";
import { updateClinicSettings } from "@/app/(admin)/admin/settings/clinic/actions";
import type { ClinicSettingsData } from "@/lib/clinic-settings-types";

function ColorField({
  label,
  value,
  onChange,
  disabled,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  disabled?: boolean;
}) {
  return (
    <div className="space-y-1.5">
      <Label>{label}</Label>
      <div className="flex items-center gap-2">
        <input
          type="color"
          value={value || "#1b3a5c"}
          disabled={disabled}
          onChange={(e) => onChange(e.target.value)}
          className="size-9 shrink-0 cursor-pointer rounded-lg border border-border bg-transparent disabled:cursor-not-allowed"
        />
        <Input
          dir="ltr"
          placeholder="#1B3A5C"
          value={value}
          disabled={disabled}
          onChange={(e) => onChange(e.target.value)}
        />
      </div>
    </div>
  );
}

export function ClinicSettingsForm({
  settings,
  canEdit,
}: {
  settings: ClinicSettingsData;
  canEdit: boolean;
}) {
  const [isPending, startTransition] = useTransition();
  const [form, setForm] = useState({
    clinicName: settings.clinicName,
    doctorName: settings.doctorName,
    clinicDescription: settings.clinicDescription,
    licenseNumber: settings.licenseNumber,
    logoUrl: settings.logoUrl,
    faviconUrl: settings.faviconUrl,
    heroImageUrl: settings.heroImageUrl,
    doctorPhotoUrl: settings.doctorPhotoUrl,
    primaryColor: settings.primaryColor,
    secondaryColor: settings.secondaryColor,
    phone: settings.phone,
    whatsapp: settings.whatsapp,
    email: settings.email,
    website: settings.website,
    country: settings.country,
    city: settings.city,
    address: settings.address,
    googleMapsUrl: settings.googleMapsUrl,
    workingHours: settings.workingHours,
    facebookUrl: settings.facebookUrl,
    instagramUrl: settings.instagramUrl,
    tiktokUrl: settings.tiktokUrl,
    xUrl: settings.xUrl,
    linkedinUrl: settings.linkedinUrl,
    youtubeUrl: settings.youtubeUrl,
  });

  const update = <K extends keyof typeof form>(field: K, value: (typeof form)[K]) =>
    setForm((prev) => ({ ...prev, [field]: value }));

  const handleSubmit = (event: React.FormEvent) => {
    event.preventDefault();
    if (!canEdit) return;

    startTransition(async () => {
      const result = await updateClinicSettings(form);
      if (result.success) toast.success("تم حفظ إعدادات العيادة بنجاح");
      else toast.error(result.error);
    });
  };

  const fieldsetProps = { disabled: !canEdit };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <fieldset {...fieldsetProps} className="space-y-6">
        <div className="rounded-2xl border border-border/70 bg-card p-5 sm:p-6">
          <h2 className="text-sm font-semibold">المعلومات العامة</h2>
          <div className="mt-4 grid gap-4 sm:grid-cols-2">
            <div className="space-y-1.5">
              <Label htmlFor="clinicName">اسم العيادة</Label>
              <Input disabled={!canEdit} id="clinicName" value={form.clinicName} onChange={(e) => update("clinicName", e.target.value)} required />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="doctorName">اسم الطبيب</Label>
              <Input disabled={!canEdit} id="doctorName" value={form.doctorName} onChange={(e) => update("doctorName", e.target.value)} required />
            </div>
            <div className="space-y-1.5 sm:col-span-2">
              <Label htmlFor="clinicDescription">وصف العيادة</Label>
              <Textarea
                id="clinicDescription"
                rows={2}
                disabled={!canEdit}
                value={form.clinicDescription}
                onChange={(e) => update("clinicDescription", e.target.value)}
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="licenseNumber">رقم الترخيص</Label>
              <Input disabled={!canEdit} id="licenseNumber" value={form.licenseNumber} onChange={(e) => update("licenseNumber", e.target.value)} />
            </div>
          </div>
        </div>

        <div className="rounded-2xl border border-border/70 bg-card p-5 sm:p-6">
          <h2 className="text-sm font-semibold">الهوية البصرية</h2>
          <div className="mt-4 grid gap-4 sm:grid-cols-2">
            <AssetUploadField
              label="شعار العيادة"
              kind="logo"
              value={form.logoUrl}
              onChange={(url) => update("logoUrl", url)}
              disabled={!canEdit}
            />
            <AssetUploadField
              label="أيقونة المتصفح (Favicon)"
              kind="favicon"
              value={form.faviconUrl}
              onChange={(url) => update("faviconUrl", url)}
              disabled={!canEdit}
            />
            <AssetUploadField
              label="صورة الواجهة الرئيسية (Hero)"
              kind="hero"
              value={form.heroImageUrl}
              onChange={(url) => update("heroImageUrl", url)}
              disabled={!canEdit}
            />
            <AssetUploadField
              label="صورة الطبيب"
              kind="doctorPhoto"
              value={form.doctorPhotoUrl}
              onChange={(url) => update("doctorPhotoUrl", url)}
              disabled={!canEdit}
              round
            />
            <ColorField
              label="اللون الأساسي"
              value={form.primaryColor}
              onChange={(v) => update("primaryColor", v)}
              disabled={!canEdit}
            />
            <ColorField
              label="اللون الثانوي"
              value={form.secondaryColor}
              onChange={(v) => update("secondaryColor", v)}
              disabled={!canEdit}
            />
          </div>
        </div>

        <div className="rounded-2xl border border-border/70 bg-card p-5 sm:p-6">
          <h2 className="text-sm font-semibold">التواصل</h2>
          <div className="mt-4 grid gap-4 sm:grid-cols-2">
            <div className="space-y-1.5">
              <Label htmlFor="phone">رقم الهاتف</Label>
              <Input disabled={!canEdit} id="phone" dir="ltr" value={form.phone} onChange={(e) => update("phone", e.target.value)} required />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="whatsapp">واتساب</Label>
              <Input disabled={!canEdit} id="whatsapp" dir="ltr" value={form.whatsapp} onChange={(e) => update("whatsapp", e.target.value)} />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="email">البريد الإلكتروني</Label>
              <Input disabled={!canEdit} id="email" type="email" dir="ltr" value={form.email} onChange={(e) => update("email", e.target.value)} />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="website">الموقع الإلكتروني</Label>
              <Input disabled={!canEdit} id="website" dir="ltr" placeholder="https://" value={form.website} onChange={(e) => update("website", e.target.value)} />
            </div>
          </div>
        </div>

        <div className="rounded-2xl border border-border/70 bg-card p-5 sm:p-6">
          <h2 className="text-sm font-semibold">العنوان</h2>
          <div className="mt-4 grid gap-4 sm:grid-cols-2">
            <div className="space-y-1.5">
              <Label htmlFor="country">الدولة</Label>
              <Input disabled={!canEdit} id="country" value={form.country} onChange={(e) => update("country", e.target.value)} />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="city">المدينة</Label>
              <Input disabled={!canEdit} id="city" value={form.city} onChange={(e) => update("city", e.target.value)} />
            </div>
            <div className="space-y-1.5 sm:col-span-2">
              <Label htmlFor="address">العنوان الكامل</Label>
              <Input disabled={!canEdit} id="address" value={form.address} onChange={(e) => update("address", e.target.value)} />
            </div>
            <div className="space-y-1.5 sm:col-span-2">
              <Label htmlFor="googleMapsUrl">رابط خرائط غوغل</Label>
              <Input
                id="googleMapsUrl"
                dir="ltr"
                disabled={!canEdit}
                placeholder="https://maps.google.com/..."
                value={form.googleMapsUrl}
                onChange={(e) => update("googleMapsUrl", e.target.value)}
              />
            </div>
          </div>
        </div>

        <div className="rounded-2xl border border-border/70 bg-card p-5 sm:p-6">
          <h2 className="text-sm font-semibold">ساعات الدوام</h2>
          <div className="mt-4">
            <WorkingHoursEditor
              value={form.workingHours}
              onChange={(v) => update("workingHours", v)}
              disabled={!canEdit}
            />
          </div>
        </div>

        <div className="rounded-2xl border border-border/70 bg-card p-5 sm:p-6">
          <h2 className="text-sm font-semibold">وسائل التواصل الاجتماعي</h2>
          <div className="mt-4 grid gap-4 sm:grid-cols-2">
            <div className="space-y-1.5">
              <Label htmlFor="facebookUrl">فيسبوك</Label>
              <Input disabled={!canEdit} id="facebookUrl" dir="ltr" placeholder="https://" value={form.facebookUrl} onChange={(e) => update("facebookUrl", e.target.value)} />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="instagramUrl">إنستغرام</Label>
              <Input disabled={!canEdit} id="instagramUrl" dir="ltr" placeholder="https://" value={form.instagramUrl} onChange={(e) => update("instagramUrl", e.target.value)} />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="tiktokUrl">تيك توك</Label>
              <Input disabled={!canEdit} id="tiktokUrl" dir="ltr" placeholder="https://" value={form.tiktokUrl} onChange={(e) => update("tiktokUrl", e.target.value)} />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="xUrl">X (تويتر)</Label>
              <Input disabled={!canEdit} id="xUrl" dir="ltr" placeholder="https://" value={form.xUrl} onChange={(e) => update("xUrl", e.target.value)} />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="linkedinUrl">لينكد إن</Label>
              <Input disabled={!canEdit} id="linkedinUrl" dir="ltr" placeholder="https://" value={form.linkedinUrl} onChange={(e) => update("linkedinUrl", e.target.value)} />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="youtubeUrl">يوتيوب</Label>
              <Input disabled={!canEdit} id="youtubeUrl" dir="ltr" placeholder="https://" value={form.youtubeUrl} onChange={(e) => update("youtubeUrl", e.target.value)} />
            </div>
          </div>
        </div>
      </fieldset>

      {canEdit && (
        <Button type="submit" size="lg" disabled={isPending} className="gap-2">
          <Save className="size-4" />
          حفظ الإعدادات
        </Button>
      )}
    </form>
  );
}
