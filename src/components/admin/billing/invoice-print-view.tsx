import { cn } from "@/lib/utils";
import { formatCurrency, formatDateTime, formatShortDate } from "@/lib/date-utils";
import {
  INVOICE_PAYMENT_STATUS_BADGE_CLASSES,
  INVOICE_PAYMENT_STATUS_LABELS,
  PAYMENT_METHOD_LABELS,
} from "@/lib/billing-labels";
import { getClinicSettings } from "@/lib/clinic-settings";
import type { Doctor, Invoice, InvoiceItem, Patient, Payment } from "@/generated/prisma/client";

type InvoiceWithRelations = Invoice & {
  patient: Patient;
  doctor: Doctor;
  items: InvoiceItem[];
  payments: Payment[];
};

export async function InvoicePrintView({ invoice }: { invoice: InvoiceWithRelations }) {
  const settings = await getClinicSettings();

  return (
    <div className="print-area rounded-2xl border border-border/70 bg-card p-6 sm:p-8">
      <div className="flex flex-wrap items-start justify-between gap-4 border-b border-border pb-5">
        <div>
          <h1 className="text-lg font-bold">{settings.clinicName}</h1>
          <p className="text-sm text-muted-foreground">{settings.phone}</p>
          <p className="text-sm text-muted-foreground">{settings.address}</p>
        </div>
        <div className="text-left">
          <p className="text-sm text-muted-foreground">رقم الفاتورة</p>
          <p dir="ltr" className="text-lg font-bold">
            {invoice.invoiceNumber}
          </p>
          <p className="mt-1 text-sm text-muted-foreground">
            {formatShortDate(invoice.issueDate)}
          </p>
        </div>
      </div>

      <div className="mt-5 grid gap-4 sm:grid-cols-2">
        <div>
          <p className="text-xs text-muted-foreground">المريض</p>
          <p className="font-medium">{invoice.patient.fullName}</p>
          <p dir="ltr" className="text-sm text-muted-foreground">
            {invoice.patient.phone}
          </p>
        </div>
        <div className="sm:text-left">
          <p className="text-xs text-muted-foreground">الطبيب</p>
          <p className="font-medium">
            د. {invoice.doctor.firstName} {invoice.doctor.lastName}
          </p>
          <span
            className={cn(
              "mt-1 inline-block rounded-full px-2.5 py-1 text-xs font-medium",
              INVOICE_PAYMENT_STATUS_BADGE_CLASSES[invoice.paymentStatus]
            )}
          >
            {INVOICE_PAYMENT_STATUS_LABELS[invoice.paymentStatus]}
          </span>
        </div>
      </div>

      <table className="mt-6 w-full text-sm">
        <thead>
          <tr className="border-b border-border text-right text-xs text-muted-foreground">
            <th className="py-2">الإجراء</th>
            <th className="py-2">السن</th>
            <th className="py-2">الكمية</th>
            <th className="py-2">سعر الوحدة</th>
            <th className="py-2">الخصم</th>
            <th className="py-2">الإجمالي</th>
          </tr>
        </thead>
        <tbody>
          {invoice.items.map((item) => (
            <tr key={item.id} className="border-b border-border/60">
              <td className="py-2">{item.description}</td>
              <td className="py-2">{item.toothNumber ?? "—"}</td>
              <td className="py-2">{item.quantity}</td>
              <td className="py-2">{formatCurrency(item.unitPrice)}</td>
              <td className="py-2">{formatCurrency(item.discount)}</td>
              <td className="py-2">{formatCurrency(item.total)}</td>
            </tr>
          ))}
        </tbody>
      </table>

      <div className="mt-4 flex justify-end">
        <div className="w-full max-w-xs space-y-1.5 text-sm">
          <div className="flex justify-between">
            <span className="text-muted-foreground">المجموع الفرعي</span>
            <span>{formatCurrency(invoice.subtotal)}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-muted-foreground">الخصم</span>
            <span>{formatCurrency(invoice.discount)}</span>
          </div>
          {invoice.taxRate ? (
            <div className="flex justify-between">
              <span className="text-muted-foreground">الضريبة ({invoice.taxRate}%)</span>
              <span>{formatCurrency(invoice.taxAmount)}</span>
            </div>
          ) : null}
          <div className="flex justify-between border-t border-border pt-1.5 font-semibold">
            <span>الإجمالي</span>
            <span>{formatCurrency(invoice.total)}</span>
          </div>
          <div className="flex justify-between text-emerald-600 dark:text-emerald-400">
            <span>المدفوع</span>
            <span>{formatCurrency(invoice.paidAmount)}</span>
          </div>
          <div className="flex justify-between font-semibold text-destructive">
            <span>المتبقي</span>
            <span>{formatCurrency(invoice.remainingBalance)}</span>
          </div>
        </div>
      </div>

      {invoice.notes && (
        <p className="mt-4 border-t border-border pt-3 text-sm text-muted-foreground">
          {invoice.notes}
        </p>
      )}

      <div className="mt-6 border-t border-border pt-4">
        <h2 className="text-sm font-semibold">سجل الدفعات</h2>
        {invoice.payments.length === 0 ? (
          <p className="mt-2 text-sm text-muted-foreground">لا توجد دفعات مسجّلة بعد.</p>
        ) : (
          <div className="mt-2 space-y-1.5 text-sm">
            {invoice.payments.map((payment) => (
              <div key={payment.id} className="flex justify-between">
                <span className="text-muted-foreground">
                  {formatDateTime(payment.paidAt)} — {PAYMENT_METHOD_LABELS[payment.method]}
                </span>
                <span>{formatCurrency(payment.amount)}</span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
