"use client";

import { useState } from "react";
import Link from "next/link";
import { Plus, Receipt } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { formatCurrency, formatShortDate } from "@/lib/date-utils";
import {
  INVOICE_PAYMENT_STATUS_BADGE_CLASSES,
  INVOICE_PAYMENT_STATUS_LABELS,
} from "@/lib/billing-labels";
import { CreateInvoiceDialog } from "@/components/admin/patients/profile/create-invoice-dialog";
import type { Invoice, TreatmentItem } from "@/generated/prisma/client";

export function PatientInvoicesSection({
  patientId,
  invoices,
  billableItems,
  canCreate,
}: {
  patientId: string;
  invoices: Invoice[];
  billableItems: TreatmentItem[];
  canCreate: boolean;
}) {
  const [open, setOpen] = useState(false);

  return (
    <div className="rounded-2xl border border-border/70 bg-card p-5">
      <div className="flex items-center justify-between">
        <h2 className="flex items-center gap-2 text-sm font-semibold">
          <Receipt className="size-4 text-primary" />
          الفواتير
        </h2>
        {canCreate && (
          <Button size="sm" className="gap-1.5" onClick={() => setOpen(true)}>
            <Plus className="size-4" />
            فاتورة جديدة
          </Button>
        )}
      </div>

      {invoices.length === 0 ? (
        <p className="mt-4 text-sm text-muted-foreground">لا توجد فواتير لهذا المريض بعد.</p>
      ) : (
        <div className="mt-4 space-y-2">
          {invoices.map((invoice) => (
            <Link
              key={invoice.id}
              href={`/admin/billing/${invoice.id}`}
              className="flex items-center justify-between gap-2 rounded-lg border border-border/60 px-3 py-2 text-sm hover:border-primary"
            >
              <div>
                <p className="font-medium" dir="ltr">
                  {invoice.invoiceNumber}
                </p>
                <p className="text-xs text-muted-foreground">
                  {formatShortDate(invoice.issueDate)}
                </p>
              </div>
              <div className="text-left">
                <p className="font-semibold">{formatCurrency(invoice.total)}</p>
                <span
                  className={cn(
                    "rounded-full px-2 py-0.5 text-xs font-medium",
                    INVOICE_PAYMENT_STATUS_BADGE_CLASSES[invoice.paymentStatus]
                  )}
                >
                  {INVOICE_PAYMENT_STATUS_LABELS[invoice.paymentStatus]}
                </span>
              </div>
            </Link>
          ))}
        </div>
      )}

      {canCreate && (
        <CreateInvoiceDialog
          open={open}
          onOpenChange={setOpen}
          patientId={patientId}
          billableItems={billableItems}
        />
      )}
    </div>
  );
}
