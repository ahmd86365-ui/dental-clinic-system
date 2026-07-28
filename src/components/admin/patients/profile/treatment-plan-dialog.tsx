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
import {
  createTreatmentPlan,
  updateTreatmentPlan,
} from "@/app/(admin)/admin/patients/[id]/treatment-actions";
import {
  TREATMENT_PLAN_STATUS_LABELS,
  TREATMENT_PRIORITY_LABELS,
} from "@/lib/billing-labels";
import type { TreatmentPlan, TreatmentPlanStatus, TreatmentPriority } from "@/generated/prisma/client";

function toDateInputValue(date: Date | null) {
  if (!date) return "";
  const d = new Date(date);
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
}

export function TreatmentPlanDialog({
  open,
  onOpenChange,
  patientId,
  plan,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  patientId: string;
  plan: TreatmentPlan | null;
}) {
  const [isPending, startTransition] = useTransition();
  const [form, setForm] = useState({
    title: plan?.title ?? "",
    diagnosis: plan?.diagnosis ?? "",
    priority: (plan?.priority ?? "MEDIUM") as TreatmentPriority,
    status: (plan?.status ?? "PLANNED") as TreatmentPlanStatus,
    startDate: toDateInputValue(plan?.startDate ?? null),
    estimatedEndDate: toDateInputValue(plan?.estimatedEndDate ?? null),
    notes: plan?.notes ?? "",
  });

  const update = <K extends keyof typeof form>(field: K, value: (typeof form)[K]) =>
    setForm((prev) => ({ ...prev, [field]: value }));

  const handleSubmit = (event: React.FormEvent) => {
    event.preventDefault();

    startTransition(async () => {
      const result = plan
        ? await updateTreatmentPlan(plan.id, patientId, form)
        : await createTreatmentPlan(patientId, form);

      if (result.success) {
        toast.success(plan ? "تم تحديث خطة العلاج" : "تم إنشاء خطة العلاج");
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
            <DialogTitle>{plan ? "تعديل خطة العلاج" : "خطة علاج جديدة"}</DialogTitle>
            <DialogDescription>حدّد تفاصيل خطة العلاج للمريض.</DialogDescription>
          </DialogHeader>

          <div className="grid gap-3">
            <div className="space-y-1.5">
              <Label htmlFor="tp-title">العنوان</Label>
              <Input
                id="tp-title"
                value={form.title}
                onChange={(e) => update("title", e.target.value)}
                required
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="tp-diagnosis">التشخيص</Label>
              <Textarea
                id="tp-diagnosis"
                rows={2}
                value={form.diagnosis}
                onChange={(e) => update("diagnosis", e.target.value)}
              />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label>الأولوية</Label>
                <Select
                  value={form.priority}
                  onValueChange={(v) => v && update("priority", v as TreatmentPriority)}
                >
                  <SelectTrigger className="w-full">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {Object.entries(TREATMENT_PRIORITY_LABELS).map(([value, label]) => (
                      <SelectItem key={value} value={value}>
                        {label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-1.5">
                <Label>الحالة</Label>
                <Select
                  value={form.status}
                  onValueChange={(v) => v && update("status", v as TreatmentPlanStatus)}
                >
                  <SelectTrigger className="w-full">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {Object.entries(TREATMENT_PLAN_STATUS_LABELS).map(([value, label]) => (
                      <SelectItem key={value} value={value}>
                        {label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label htmlFor="tp-start">تاريخ البدء</Label>
                <Input
                  id="tp-start"
                  type="date"
                  value={form.startDate}
                  onChange={(e) => update("startDate", e.target.value)}
                />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="tp-end">تاريخ الانتهاء المتوقع</Label>
                <Input
                  id="tp-end"
                  type="date"
                  value={form.estimatedEndDate}
                  onChange={(e) => update("estimatedEndDate", e.target.value)}
                />
              </div>
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="tp-notes">ملاحظات</Label>
              <Textarea
                id="tp-notes"
                rows={2}
                value={form.notes}
                onChange={(e) => update("notes", e.target.value)}
              />
            </div>
          </div>

          <DialogFooter>
            <Button type="submit" disabled={isPending} className="gap-2">
              <Save className="size-4" />
              {plan ? "حفظ التغييرات" : "إنشاء الخطة"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
