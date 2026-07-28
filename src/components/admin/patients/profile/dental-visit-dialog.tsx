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
import { createDentalVisit, updateDentalVisit } from "@/app/(admin)/admin/patients/[id]/actions";
import type { DentalVisit } from "@/generated/prisma/client";

function toDateInputValue(date: Date) {
  const d = new Date(date);
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
}

function toDateStringFallback() {
  return toDateInputValue(new Date());
}

const emptyForm = {
  visitDate: toDateStringFallback(),
  chiefComplaint: "",
  diagnosis: "",
  treatmentPlan: "",
  proceduresPerformed: "",
  prescriptions: "",
  clinicalNotes: "",
  followUpNotes: "",
  cost: "",
};

export function DentalVisitDialog({
  open,
  onOpenChange,
  patientId,
  visit,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  patientId: string;
  visit: DentalVisit | null;
}) {
  const [isPending, startTransition] = useTransition();
  const [form, setForm] = useState(
    visit
      ? {
          visitDate: toDateInputValue(visit.visitDate),
          chiefComplaint: visit.chiefComplaint ?? "",
          diagnosis: visit.diagnosis ?? "",
          treatmentPlan: visit.treatmentPlan ?? "",
          proceduresPerformed: visit.proceduresPerformed.join(", "),
          prescriptions: visit.prescriptions ?? "",
          clinicalNotes: visit.clinicalNotes ?? "",
          followUpNotes: visit.followUpNotes ?? "",
          cost: visit.cost !== null ? String(visit.cost) : "",
        }
      : emptyForm
  );

  const update = (field: keyof typeof form, value: string) =>
    setForm((prev) => ({ ...prev, [field]: value }));

  const handleSubmit = (event: React.FormEvent) => {
    event.preventDefault();

    const payload = {
      visitDate: form.visitDate,
      chiefComplaint: form.chiefComplaint,
      diagnosis: form.diagnosis,
      treatmentPlan: form.treatmentPlan,
      proceduresPerformed: form.proceduresPerformed,
      prescriptions: form.prescriptions,
      clinicalNotes: form.clinicalNotes,
      followUpNotes: form.followUpNotes,
      cost: form.cost ? Number(form.cost) : undefined,
    };

    startTransition(async () => {
      const result = visit
        ? await updateDentalVisit(visit.id, patientId, payload)
        : await createDentalVisit(patientId, payload);

      if (result.success) {
        toast.success(visit ? "تم تحديث سجل الزيارة" : "تم إضافة سجل الزيارة");
        setForm(emptyForm);
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
            <DialogTitle>{visit ? "تعديل سجل الزيارة" : "زيارة سريرية جديدة"}</DialogTitle>
            <DialogDescription>
              سجّل تفاصيل الفحص والتشخيص والعلاج لهذه الزيارة.
            </DialogDescription>
          </DialogHeader>

          <div className="grid gap-3">
            <div className="space-y-1.5">
              <Label htmlFor="dv-date">تاريخ الزيارة</Label>
              <Input
                id="dv-date"
                type="date"
                value={form.visitDate}
                onChange={(e) => update("visitDate", e.target.value)}
                required
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="dv-complaint">الشكوى الرئيسية</Label>
              <Input
                id="dv-complaint"
                value={form.chiefComplaint}
                onChange={(e) => update("chiefComplaint", e.target.value)}
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="dv-diagnosis">التشخيص</Label>
              <Textarea
                id="dv-diagnosis"
                rows={2}
                value={form.diagnosis}
                onChange={(e) => update("diagnosis", e.target.value)}
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="dv-plan">خطة العلاج</Label>
              <Textarea
                id="dv-plan"
                rows={2}
                value={form.treatmentPlan}
                onChange={(e) => update("treatmentPlan", e.target.value)}
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="dv-procedures">الإجراءات المنفّذة (افصل بفاصلة)</Label>
              <Input
                id="dv-procedures"
                placeholder="مثال: حشوة، تنظيف"
                value={form.proceduresPerformed}
                onChange={(e) => update("proceduresPerformed", e.target.value)}
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="dv-prescriptions">الوصفة الطبية</Label>
              <Textarea
                id="dv-prescriptions"
                rows={2}
                value={form.prescriptions}
                onChange={(e) => update("prescriptions", e.target.value)}
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="dv-notes">ملاحظات سريرية</Label>
              <Textarea
                id="dv-notes"
                rows={2}
                value={form.clinicalNotes}
                onChange={(e) => update("clinicalNotes", e.target.value)}
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="dv-followup">ملاحظات المتابعة</Label>
              <Textarea
                id="dv-followup"
                rows={2}
                value={form.followUpNotes}
                onChange={(e) => update("followUpNotes", e.target.value)}
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="dv-cost">التكلفة (اختياري)</Label>
              <Input
                id="dv-cost"
                type="number"
                min={0}
                value={form.cost}
                onChange={(e) => update("cost", e.target.value)}
              />
            </div>
          </div>

          <DialogFooter>
            <Button type="submit" disabled={isPending} className="gap-2">
              <Save className="size-4" />
              {visit ? "حفظ التغييرات" : "إضافة الزيارة"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
