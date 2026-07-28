"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { getCurrentStaff } from "@/lib/auth/current-staff";
import { assertPermission } from "@/lib/auth/permissions";
import { logActivity } from "@/lib/activity-log";
import { createNotification } from "@/lib/create-notification";
import { formatCurrency } from "@/lib/date-utils";
import {
  createInvoiceSchema,
  paymentSchema,
  type CreateInvoiceInput,
  type PaymentInput,
} from "@/lib/validations/billing";
import type { InvoicePaymentStatus } from "@/generated/prisma/client";

type ActionResult =
  | { success: true; invoiceId?: string }
  | { success: false; error: string };

function revalidateBilling(patientId?: string) {
  revalidatePath("/admin/billing");
  revalidatePath("/admin");
  if (patientId) revalidatePath(`/admin/patients/${patientId}`);
}

async function generateInvoiceNumber(): Promise<string> {
  const year = new Date().getFullYear();
  const count = await prisma.invoice.count({
    where: { invoiceNumber: { startsWith: `INV-${year}-` } },
  });
  return `INV-${year}-${String(count + 1).padStart(4, "0")}`;
}

function computeStatus(total: number, paid: number): InvoicePaymentStatus {
  if (paid <= 0) return "UNPAID";
  if (paid >= total) return "PAID";
  return "PARTIALLY_PAID";
}

export async function createInvoiceFromTreatmentItems(
  input: CreateInvoiceInput
): Promise<ActionResult> {
  const staff = await getCurrentStaff();

  try {
    assertPermission(staff.role, "manageInvoices");
  } catch {
    return { success: false, error: "لا تملك صلاحية إنشاء الفواتير" };
  }

  const parsed = createInvoiceSchema.safeParse(input);
  if (!parsed.success) {
    return {
      success: false,
      error: parsed.error.issues[0]?.message ?? "الرجاء التحقق من البيانات",
    };
  }
  const data = parsed.data;

  const patient = await prisma.patient.findUnique({ where: { id: data.patientId } });
  if (!patient) return { success: false, error: "المريض غير موجود" };

  const items = await prisma.treatmentItem.findMany({
    where: { id: { in: data.treatmentItemIds } },
  });
  if (items.length === 0) {
    return { success: false, error: "الرجاء اختيار إجراء واحد على الأقل" };
  }

  const doctor =
    (await prisma.doctor.findFirst()) ??
    (await prisma.doctor.create({
      data: { firstName: "خليل", lastName: "الجمعة", specialty: "طب وتجميل الأسنان" },
    }));

  const subtotal = items.reduce((sum, item) => sum + item.total, 0);
  const discount = data.discount;
  const taxRate = data.taxRate ?? 0;
  const taxableAmount = Math.max(0, subtotal - discount);
  const taxAmount = (taxableAmount * taxRate) / 100;
  const total = taxableAmount + taxAmount;

  const invoiceNumber = await generateInvoiceNumber();

  const invoice = await prisma.invoice.create({
    data: {
      invoiceNumber,
      patientId: data.patientId,
      doctorId: doctor.id,
      taxRate: data.taxRate,
      taxAmount,
      discount,
      subtotal,
      total,
      paidAmount: 0,
      remainingBalance: total,
      paymentStatus: "UNPAID",
      notes: data.notes || undefined,
      createdByStaffId: staff.id,
      items: {
        create: items.map((item) => ({
          treatmentItemId: item.id,
          description: item.procedureName,
          toothNumber: item.toothNumber,
          quantity: item.quantity,
          unitPrice: item.unitPrice,
          discount: item.discount,
          total: item.total,
        })),
      },
    },
  });

  await logActivity(staff, {
    action: "CREATE_INVOICE",
    entityType: "Invoice",
    entityId: invoice.id,
    description: `تم إنشاء فاتورة ${invoiceNumber} للمريض: ${patient.fullName}`,
  });

  await createNotification({
    type: "INVOICE_CREATED",
    priority: "MEDIUM",
    title: "فاتورة جديدة",
    message: `تم إنشاء فاتورة ${invoiceNumber} للمريض ${patient.fullName} بقيمة ${formatCurrency(total)}`,
    link: `/admin/billing/${invoice.id}`,
  });

  revalidateBilling(data.patientId);
  return { success: true, invoiceId: invoice.id };
}

export async function registerPayment(
  invoiceId: string,
  input: PaymentInput
): Promise<ActionResult> {
  const staff = await getCurrentStaff();

  try {
    assertPermission(staff.role, "managePayments");
  } catch {
    return { success: false, error: "لا تملك صلاحية تسجيل الدفعات" };
  }

  const parsed = paymentSchema.safeParse(input);
  if (!parsed.success) {
    return {
      success: false,
      error: parsed.error.issues[0]?.message ?? "الرجاء التحقق من البيانات",
    };
  }
  const data = parsed.data;

  const invoice = await prisma.invoice.findUnique({
    where: { id: invoiceId },
    include: { patient: true },
  });
  if (!invoice) return { success: false, error: "الفاتورة غير موجودة" };

  if (data.amount > invoice.remainingBalance + 0.01) {
    return { success: false, error: "المبلغ المدخل أكبر من الرصيد المتبقي" };
  }

  await prisma.$transaction(async (tx) => {
    await tx.payment.create({
      data: {
        invoiceId,
        amount: data.amount,
        method: data.method,
        paidAt: data.paidAt ? new Date(data.paidAt) : undefined,
        notes: data.notes || undefined,
        createdByStaffId: staff.id,
      },
    });

    const newPaidAmount = invoice.paidAmount + data.amount;
    const newRemaining = Math.max(0, invoice.total - newPaidAmount);

    await tx.invoice.update({
      where: { id: invoiceId },
      data: {
        paidAmount: newPaidAmount,
        remainingBalance: newRemaining,
        paymentStatus: computeStatus(invoice.total, newPaidAmount),
      },
    });
  });

  await logActivity(staff, {
    action: "REGISTER_PAYMENT",
    entityType: "Payment",
    entityId: invoiceId,
    description: `تم تسجيل دفعة بقيمة ${data.amount} على الفاتورة ${invoice.invoiceNumber}`,
  });

  await createNotification({
    type: "PAYMENT_RECEIVED",
    priority: "MEDIUM",
    title: "دفعة مستلمة",
    message: `تم استلام دفعة بقيمة ${formatCurrency(data.amount)} من ${invoice.patient.fullName} (فاتورة ${invoice.invoiceNumber})`,
    link: `/admin/billing/${invoiceId}`,
  });

  revalidateBilling(invoice.patientId);
  revalidatePath(`/admin/billing/${invoiceId}`);
  return { success: true };
}
