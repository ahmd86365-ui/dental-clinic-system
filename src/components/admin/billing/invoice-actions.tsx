"use client";

import { useState } from "react";
import { CreditCard } from "lucide-react";
import { Button } from "@/components/ui/button";
import { RegisterPaymentDialog } from "@/components/admin/billing/register-payment-dialog";
import { PrintInvoiceButton } from "@/components/admin/billing/print-invoice-button";

export function InvoiceActions({
  invoiceId,
  remainingBalance,
  canRegisterPayment,
}: {
  invoiceId: string;
  remainingBalance: number;
  canRegisterPayment: boolean;
}) {
  const [open, setOpen] = useState(false);

  return (
    <div className="no-print flex flex-wrap gap-2">
      <PrintInvoiceButton />
      {canRegisterPayment && remainingBalance > 0 && (
        <>
          <Button className="gap-2" onClick={() => setOpen(true)}>
            <CreditCard className="size-4" />
            تسجيل دفعة
          </Button>
          <RegisterPaymentDialog
            open={open}
            onOpenChange={setOpen}
            invoiceId={invoiceId}
            remainingBalance={remainingBalance}
          />
        </>
      )}
    </div>
  );
}
