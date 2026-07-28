"use client";

import { useState, useTransition } from "react";
import { toast } from "sonner";
import { CreditCard } from "lucide-react";
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
import { registerPayment } from "@/app/(admin)/admin/billing/actions";
import { PAYMENT_METHOD_LABELS } from "@/lib/billing-labels";
import type { PaymentMethod } from "@/generated/prisma/client";

export function RegisterPaymentDialog({
  open,
  onOpenChange,
  invoiceId,
  remainingBalance,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  invoiceId: string;
  remainingBalance: number;
}) {
  const [isPending, startTransition] = useTransition();
  const [amount, setAmount] = useState(String(remainingBalance));
  const [method, setMethod] = useState<PaymentMethod>("CASH");
  const [notes, setNotes] = useState("");

  const handleSubmit = (event: React.FormEvent) => {
    event.preventDefault();

    startTransition(async () => {
      const result = await registerPayment(invoiceId, { amount, method, notes });
      if (result.success) {
        toast.success("تم تسجيل الدفعة بنجاح");
        onOpenChange(false);
      } else {
        toast.error(result.error);
      }
    });
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-sm">
        <form onSubmit={handleSubmit} className="space-y-4">
          <DialogHeader>
            <DialogTitle>تسجيل دفعة</DialogTitle>
            <DialogDescription>
              الرصيد المتبقي: {remainingBalance}
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-3">
            <div className="space-y-1.5">
              <Label htmlFor="pay-amount">المبلغ</Label>
              <Input
                id="pay-amount"
                type="number"
                min={0}
                step="0.01"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                required
              />
            </div>
            <div className="space-y-1.5">
              <Label>طريقة الدفع</Label>
              <Select value={method} onValueChange={(v) => v && setMethod(v as PaymentMethod)}>
                <SelectTrigger className="w-full">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {Object.entries(PAYMENT_METHOD_LABELS).map(([value, label]) => (
                    <SelectItem key={value} value={value}>
                      {label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="pay-notes">ملاحظات</Label>
              <Textarea id="pay-notes" rows={2} value={notes} onChange={(e) => setNotes(e.target.value)} />
            </div>
          </div>

          <DialogFooter>
            <Button type="submit" disabled={isPending} className="gap-2">
              <CreditCard className="size-4" />
              تسجيل الدفعة
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
