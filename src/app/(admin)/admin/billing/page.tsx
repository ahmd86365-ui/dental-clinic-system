import { redirect } from "next/navigation";
import { Prisma } from "@/generated/prisma/client";
import { prisma } from "@/lib/prisma";
import { getCurrentStaff } from "@/lib/auth/current-staff";
import { hasPermission } from "@/lib/auth/permissions";
import { BillingToolbar } from "@/components/admin/billing/billing-toolbar";
import { InvoicesTable } from "@/components/admin/billing/invoices-table";
import { Pagination } from "@/components/admin/pagination";
import type { InvoicePaymentStatus } from "@/generated/prisma/client";

export const dynamic = "force-dynamic";

const PAGE_SIZE = 10;

type SearchParams = {
  q?: string;
  status?: string;
  sort?: string;
  page?: string;
};

export default async function BillingPage({
  searchParams,
}: {
  searchParams: Promise<SearchParams>;
}) {
  const staff = await getCurrentStaff();
  if (!hasPermission(staff.role, "viewBilling")) redirect("/admin");

  const params = await searchParams;
  const q = params.q?.trim() ?? "";
  const status = params.status as InvoicePaymentStatus | undefined;
  const page = Math.max(1, Number(params.page) || 1);
  const [sortField, sortDir] = (params.sort ?? "issueDate:desc").split(":") as [
    "issueDate" | "total" | "patientName",
    "asc" | "desc",
  ];

  const where: Prisma.InvoiceWhereInput = {
    ...(status ? { paymentStatus: status } : {}),
    ...(q
      ? {
          OR: [
            { invoiceNumber: { contains: q, mode: "insensitive" } },
            { patient: { fullName: { contains: q, mode: "insensitive" } } },
            { patient: { phone: { contains: q } } },
          ],
        }
      : {}),
  };

  const orderBy: Prisma.InvoiceOrderByWithRelationInput =
    sortField === "patientName" ? { patient: { fullName: sortDir } } : { [sortField]: sortDir };

  const [invoices, total] = await Promise.all([
    prisma.invoice.findMany({
      where,
      orderBy,
      skip: (page - 1) * PAGE_SIZE,
      take: PAGE_SIZE,
      include: { patient: true },
    }),
    prisma.invoice.count({ where }),
  ]);

  return (
    <div className="space-y-5">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">الفواتير والمدفوعات</h1>
        <p className="mt-1 text-sm text-muted-foreground">{total} فاتورة إجمالًا</p>
      </div>

      <BillingToolbar />

      <InvoicesTable invoices={invoices} sortField={sortField} sortDir={sortDir} />

      <Pagination page={page} pageSize={PAGE_SIZE} total={total} />
    </div>
  );
}
