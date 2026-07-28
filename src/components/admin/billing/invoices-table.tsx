import Link from "next/link";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { SortableHead } from "@/components/admin/sortable-head";
import { cn } from "@/lib/utils";
import { formatCurrency, formatShortDate } from "@/lib/date-utils";
import {
  INVOICE_PAYMENT_STATUS_BADGE_CLASSES,
  INVOICE_PAYMENT_STATUS_LABELS,
} from "@/lib/billing-labels";
import type { Invoice, Patient } from "@/generated/prisma/client";

type InvoiceRow = Invoice & { patient: Patient };

export function InvoicesTable({
  invoices,
  sortField,
  sortDir,
}: {
  invoices: InvoiceRow[];
  sortField: string;
  sortDir: "asc" | "desc";
}) {
  return (
    <div className="rounded-2xl border border-border/70 bg-card">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>رقم الفاتورة</TableHead>
            <SortableHead label="المريض" field="patientName" sortField={sortField} sortDir={sortDir} />
            <SortableHead label="التاريخ" field="issueDate" sortField={sortField} sortDir={sortDir} />
            <SortableHead label="الإجمالي" field="total" sortField={sortField} sortDir={sortDir} />
            <TableHead>المدفوع</TableHead>
            <TableHead>المتبقي</TableHead>
            <TableHead>الحالة</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {invoices.length === 0 && (
            <TableRow>
              <TableCell colSpan={7} className="py-10 text-center text-muted-foreground">
                لا توجد نتائج مطابقة.
              </TableCell>
            </TableRow>
          )}
          {invoices.map((invoice) => (
            <TableRow key={invoice.id}>
              <TableCell>
                <Link
                  href={`/admin/billing/${invoice.id}`}
                  dir="ltr"
                  className="font-medium text-right hover:text-primary hover:underline"
                >
                  {invoice.invoiceNumber}
                </Link>
              </TableCell>
              <TableCell>{invoice.patient.fullName}</TableCell>
              <TableCell>{formatShortDate(invoice.issueDate)}</TableCell>
              <TableCell>{formatCurrency(invoice.total)}</TableCell>
              <TableCell>{formatCurrency(invoice.paidAmount)}</TableCell>
              <TableCell>{formatCurrency(invoice.remainingBalance)}</TableCell>
              <TableCell>
                <span
                  className={cn(
                    "rounded-full px-2.5 py-1 text-xs font-medium",
                    INVOICE_PAYMENT_STATUS_BADGE_CLASSES[invoice.paymentStatus]
                  )}
                >
                  {INVOICE_PAYMENT_STATUS_LABELS[invoice.paymentStatus]}
                </span>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
