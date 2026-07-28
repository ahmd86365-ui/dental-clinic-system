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
import { Switch } from "@/components/ui/switch";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { upsertMedicalHistory } from "@/app/(admin)/admin/patients/[id]/actions";
import { SMOKING_STATUS_LABELS, BLOOD_TYPE_LABELS } from "@/lib/medical-labels";
import type { BloodType, MedicalHistory, SmokingStatus } from "@/generated/prisma/client";

export function MedicalHistoryDialog({
  open,
  onOpenChange,
  patientId,
  history,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  patientId: string;
  history: MedicalHistory | null;
}) {
  const [isPending, startTransition] = useTransition();
  const [form, setForm] = useState({
    allergies: (history?.allergies ?? []).join(", "),
    chronicDiseases: (history?.chronicDiseases ?? []).join(", "),
    currentMedications: (history?.currentMedications ?? []).join(", "),
    previousSurgeries: (history?.previousSurgeries ?? []).join(", "),
    smokingStatus: (history?.smokingStatus ?? "") as SmokingStatus | "",
    bloodType: (history?.bloodType ?? "") as BloodType | "",
    isPregnant: history?.isPregnant ?? false,
    medicalNotes: history?.medicalNotes ?? "",
  });

  const update = (field: keyof typeof form, value: string | boolean) =>
    setForm((prev) => ({ ...prev, [field]: value }));

  const handleSubmit = (event: React.FormEvent) => {
    event.preventDefault();

    startTransition(async () => {
      const result = await upsertMedicalHistory(patientId, {
        allergies: form.allergies,
        chronicDiseases: form.chronicDiseases,
        currentMedications: form.currentMedications,
        previousSurgeries: form.previousSurgeries,
        smokingStatus: form.smokingStatus || undefined,
        bloodType: form.bloodType || undefined,
        isPregnant: form.isPregnant,
        medicalNotes: form.medicalNotes,
      });

      if (result.success) {
        toast.success("تم تحديث السجل الطبي");
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
            <DialogTitle>تعديل السجل الطبي</DialogTitle>
            <DialogDescription>
              افصل بين العناصر المتعددة (كالحساسية أو الأدوية) بفاصلة (,).
            </DialogDescription>
          </DialogHeader>

          <div className="grid gap-3">
            <div className="space-y-1.5">
              <Label htmlFor="mh-allergies">الحساسية</Label>
              <Input
                id="mh-allergies"
                placeholder="مثال: البنسلين، اللاتكس"
                value={form.allergies}
                onChange={(e) => update("allergies", e.target.value)}
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="mh-chronic">الأمراض المزمنة</Label>
              <Input
                id="mh-chronic"
                placeholder="مثال: السكري، ضغط الدم"
                value={form.chronicDiseases}
                onChange={(e) => update("chronicDiseases", e.target.value)}
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="mh-meds">الأدوية الحالية</Label>
              <Input
                id="mh-meds"
                value={form.currentMedications}
                onChange={(e) => update("currentMedications", e.target.value)}
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="mh-surgeries">العمليات الجراحية السابقة</Label>
              <Input
                id="mh-surgeries"
                value={form.previousSurgeries}
                onChange={(e) => update("previousSurgeries", e.target.value)}
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label>حالة التدخين</Label>
                <Select
                  value={form.smokingStatus}
                  onValueChange={(v) => update("smokingStatus", v ?? "")}
                >
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="اختر" />
                  </SelectTrigger>
                  <SelectContent>
                    {Object.entries(SMOKING_STATUS_LABELS).map(([value, label]) => (
                      <SelectItem key={value} value={value}>
                        {label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-1.5">
                <Label>فصيلة الدم</Label>
                <Select
                  value={form.bloodType}
                  onValueChange={(v) => update("bloodType", v ?? "")}
                >
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="اختر" />
                  </SelectTrigger>
                  <SelectContent>
                    {Object.entries(BLOOD_TYPE_LABELS).map(([value, label]) => (
                      <SelectItem key={value} value={value}>
                        {label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="flex items-center justify-between rounded-xl border border-border/70 px-3 py-2.5">
              <Label htmlFor="mh-pregnant" className="cursor-pointer">
                حامل حاليًا (اختياري)
              </Label>
              <Switch
                id="mh-pregnant"
                checked={form.isPregnant}
                onCheckedChange={(v) => update("isPregnant", v)}
              />
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="mh-notes">ملاحظات طبية</Label>
              <Textarea
                id="mh-notes"
                rows={3}
                value={form.medicalNotes}
                onChange={(e) => update("medicalNotes", e.target.value)}
              />
            </div>
          </div>

          <DialogFooter>
            <Button type="submit" disabled={isPending} className="gap-2">
              <Save className="size-4" />
              حفظ السجل الطبي
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
