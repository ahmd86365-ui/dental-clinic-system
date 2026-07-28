"use client";

import { useMemo, useState, useTransition } from "react";
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
  createTreatmentItem,
  updateTreatmentItem,
} from "@/app/(admin)/admin/patients/[id]/treatment-actions";
import { COMMON_PROCEDURES, TREATMENT_ITEM_STATUS_LABELS } from "@/lib/billing-labels";
import type { TreatmentItem, TreatmentItemStatus } from "@/generated/prisma/client";

export function TreatmentItemDialog({
  open,
  onOpenChange,
  patientId,
  treatmentPlanId,
  item,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  patientId: string;
  treatmentPlanId: string;
  item: TreatmentItem | null;
}) {
  const [isPending, startTransition] = useTransition();
  const [form, setForm] = useState({
    procedureName: item?.procedureName ?? "",
    toothNumber: item?.toothNumber ? String(item.toothNumber) : "",
    quantity: item ? String(item.quantity) : "1",
    unitPrice: item ? String(item.unitPrice) : "",
    discount: item ? String(item.discount) : "0",
    notes: item?.notes ?? "",
    status: (item?.status ?? "PLANNED") as TreatmentItemStatus,
  });

  const total = useMemo(() => {
    const qty = Number(form.quantity) || 0;
    const price = Number(form.unitPrice) || 0;
    const discount = Number(form.discount) || 0;
    return Math.max(0, qty * price - discount);
  }, [form.quantity, form.unitPrice, form.discount]);

  const update = (field: keyof typeof form, value: string) =>
    setForm((prev) => ({ ...prev, [field]: value }));

  const handleSubmit = (event: React.FormEvent) => {
    event.preventDefault();

    const payload = {
      procedureName: form.procedureName,
      toothNumber: form.toothNumber || undefined,
      quantity: form.quantity,
      unitPrice: form.unitPrice,
      discount: form.discount,
      notes: form.notes,
      status: form.status,
    };

    startTransition(async () => {
      const result = item
        ? await updateTreatmentItem(item.id, patientId, payload)
        : await createTreatmentItem(treatmentPlanId, patientId, payload);

      if (result.success) {
        toast.success(item ? "تم تحديث الإجراء" : "تم إضافة الإجراء");
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
            <DialogTitle>{item ? "تعديل الإجراء" : "إضافة إجراء"}</DialogTitle>
            <DialogDescription>حدّد تفاصيل الإجراء العلاجي وتكلفته.</DialogDescription>
          </DialogHeader>

          <div className="grid grid-cols-2 gap-3">
            <div className="col-span-2 space-y-1.5">
              <Label htmlFor="ti-name">اسم الإجراء</Label>
              <Input
                id="ti-name"
                list="common-procedures"
                value={form.procedureName}
                onChange={(e) => update("procedureName", e.target.value)}
                required
              />
              <datalist id="common-procedures">
                {COMMON_PROCEDURES.map((name) => (
                  <option key={name} value={name} />
                ))}
              </datalist>
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="ti-tooth">رقم السن (اختياري)</Label>
              <Input
                id="ti-tooth"
                type="number"
                min={11}
                max={48}
                value={form.toothNumber}
                onChange={(e) => update("toothNumber", e.target.value)}
              />
            </div>
            <div className="space-y-1.5">
              <Label>الحالة</Label>
              <Select
                value={form.status}
                onValueChange={(v) => v && update("status", v)}
              >
                <SelectTrigger className="w-full">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {Object.entries(TREATMENT_ITEM_STATUS_LABELS).map(([value, label]) => (
                    <SelectItem key={value} value={value}>
                      {label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="ti-qty">الكمية</Label>
              <Input
                id="ti-qty"
                type="number"
                min={1}
                value={form.quantity}
                onChange={(e) => update("quantity", e.target.value)}
                required
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="ti-price">سعر الوحدة</Label>
              <Input
                id="ti-price"
                type="number"
                min={0}
                step="0.01"
                value={form.unitPrice}
                onChange={(e) => update("unitPrice", e.target.value)}
                required
              />
            </div>
            <div className="col-span-2 space-y-1.5">
              <Label htmlFor="ti-discount">الخصم</Label>
              <Input
                id="ti-discount"
                type="number"
                min={0}
                step="0.01"
                value={form.discount}
                onChange={(e) => update("discount", e.target.value)}
              />
            </div>
            <div className="col-span-2 rounded-lg bg-muted/50 px-3 py-2 text-sm font-semibold">
              الإجمالي: {total}
            </div>
            <div className="col-span-2 space-y-1.5">
              <Label htmlFor="ti-notes">ملاحظات</Label>
              <Textarea
                id="ti-notes"
                rows={2}
                value={form.notes}
                onChange={(e) => update("notes", e.target.value)}
              />
            </div>
          </div>

          <DialogFooter>
            <Button type="submit" disabled={isPending} className="gap-2">
              <Save className="size-4" />
              {item ? "حفظ التغييرات" : "إضافة الإجراء"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
