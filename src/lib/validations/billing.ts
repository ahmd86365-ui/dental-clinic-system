import { z } from "zod";

export const treatmentPlanSchema = z.object({
  title: z.string().trim().min(3, "الرجاء إدخال عنوان الخطة"),
  diagnosis: z.string().trim().max(1000).optional(),
  priority: z.enum(["LOW", "MEDIUM", "HIGH", "URGENT"]),
  status: z.enum(["PLANNED", "IN_PROGRESS", "COMPLETED", "CANCELLED"]),
  startDate: z.string().optional(),
  estimatedEndDate: z.string().optional(),
  notes: z.string().trim().max(2000).optional(),
});

export type TreatmentPlanValues = z.infer<typeof treatmentPlanSchema>;

export const treatmentItemSchema = z.object({
  procedureName: z.string().trim().min(2, "الرجاء إدخال اسم الإجراء"),
  toothNumber: z.coerce.number().int().min(11).max(48).optional(),
  quantity: z.coerce.number().int().min(1).default(1),
  unitPrice: z.coerce.number().min(0),
  discount: z.coerce.number().min(0).default(0),
  notes: z.string().trim().max(500).optional(),
  status: z.enum(["PLANNED", "IN_PROGRESS", "COMPLETED", "CANCELLED"]),
});

export type TreatmentItemInput = z.input<typeof treatmentItemSchema>;
export type TreatmentItemValues = z.infer<typeof treatmentItemSchema>;

export const createInvoiceSchema = z.object({
  patientId: z.string().min(1),
  treatmentItemIds: z.array(z.string()).min(1, "الرجاء اختيار إجراء واحد على الأقل"),
  taxRate: z.coerce.number().min(0).max(100).optional(),
  discount: z.coerce.number().min(0).default(0),
  notes: z.string().trim().max(1000).optional(),
});

export type CreateInvoiceInput = z.input<typeof createInvoiceSchema>;
export type CreateInvoiceValues = z.infer<typeof createInvoiceSchema>;

export const paymentSchema = z.object({
  amount: z.coerce.number().positive("الرجاء إدخال مبلغ صحيح"),
  method: z.enum(["CASH", "CARD", "BANK_TRANSFER"]),
  paidAt: z.string().optional(),
  notes: z.string().trim().max(500).optional(),
});

export type PaymentInput = z.input<typeof paymentSchema>;
export type PaymentValues = z.infer<typeof paymentSchema>;
