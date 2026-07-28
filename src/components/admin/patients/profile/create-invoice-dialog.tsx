"use client";

import { useMemo, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Receipt } from "lucide-react";
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
import { formatCurrency } from "@/lib/date-utils";
import { createInvoiceFromTreatmentItems } from "@/app/(admin)/admin/billing/actions";
import type { TreatmentItem } from "@/generated/prisma/client";

export function CreateInvoiceDialog({
  open,
  onOpenChange,
  patientId,
  billableItems,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  patientId: string;
  billableItems: TreatmentItem[];
}) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [taxRate, setTaxRate] = useState("");
  const [discount, setDiscount] = useState("0");
  const [notes, setNotes] = useState("");

  const toggle = (id: string) =>
    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((v) => v !== id) : [...prev, id]
    );

  const subtotal = useMemo(
    () => billableItems.filter((i) => selectedIds.includes(i.id)).reduce((s, i) => s + i.total, 0),
    [billableItems, selectedIds]
  );

  const estimatedTotal = useMemo(() => {
    const taxableAmount = Math.max(0, subtotal - (Number(discount) || 0));
    const tax = (taxableAmount * (Number(taxRate) || 0)) / 100;
    return taxableAmount + tax;
  }, [subtotal, discount, taxRate]);

  const handleSubmit = (event: React.FormEvent) => {
    event.preventDefault();

    startTransition(async () => {
      const result = await createInvoiceFromTreatmentItems({
        patientId,
        treatmentItemIds: selectedIds,
        taxRate: taxRate || undefined,
        discount,
        notes,
      });

      if (result.success) {
        toast.success("تم إنشاء الفاتورة بنجاح");
        onOpenChange(false);
        if (result.invoiceId) router.push(`/admin/billing/${result.invoiceId}`);
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
            <DialogTitle>إنشاء فاتورة جديدة</DialogTitle>
            <DialogDescription>اختر الإجراءات التي تريد إصدار فاتورة بها.</DialogDescription>
          </DialogHeader>

          {billableItems.length === 0 ? (
            <p className="text-sm text-muted-foreground">
              لا توجد إجراءات علاجية غير مفوترة لهذا المريض حاليًا.
            </p>
          ) : (
            <div className="max-h-48 space-y-1.5 overflow-y-auto rounded-lg border border-border/70 p-2">
              {billableItems.map((item) => (
                <label
                  key={item.id}
                  className="flex cursor-pointer items-center justify-between gap-2 rounded-lg px-2 py-1.5 text-sm hover:bg-accent"
                >
                  <span className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      checked={selectedIds.includes(item.id)}
                      onChange={() => toggle(item.id)}
                      className="size-4 accent-primary"
                    />
                    {item.procedureName}
                    {item.toothNumber && (
                      <span className="text-xs text-muted-foreground">سن {item.toothNumber}</span>
                    )}
                  </span>
                  <span className="text-xs text-muted-foreground">
                    {formatCurrency(item.total)}
                  </span>
                </label>
              ))}
            </div>
          )}

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label htmlFor="inv-tax">نسبة الضريبة % (اختياري)</Label>
              <Input
                id="inv-tax"
                type="number"
                min={0}
                max={100}
                value={taxRate}
                onChange={(e) => setTaxRate(e.target.value)}
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="inv-discount">الخصم</Label>
              <Input
                id="inv-discount"
                type="number"
                min={0}
                value={discount}
                onChange={(e) => setDiscount(e.target.value)}
              />
            </div>
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="inv-notes">ملاحظات</Label>
            <Textarea id="inv-notes" rows={2} value={notes} onChange={(e) => setNotes(e.target.value)} />
          </div>

          <div className="rounded-lg bg-muted/50 px-3 py-2 text-sm">
            <div className="flex justify-between">
              <span className="text-muted-foreground">المجموع الفرعي</span>
              <span>{formatCurrency(subtotal)}</span>
            </div>
            <div className="mt-1 flex justify-between font-semibold">
              <span>الإجمالي المتوقع</span>
              <span>{formatCurrency(estimatedTotal)}</span>
            </div>
          </div>

          <DialogFooter>
            <Button
              type="submit"
              disabled={isPending || selectedIds.length === 0}
              className="gap-2"
            >
              <Receipt className="size-4" />
              إنشاء الفاتورة
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
