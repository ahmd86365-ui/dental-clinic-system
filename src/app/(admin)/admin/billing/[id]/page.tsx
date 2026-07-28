import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { ArrowRight } from "lucide-react";
import { prisma } from "@/lib/prisma";
import { getCurrentStaff } from "@/lib/auth/current-staff";
import { hasPermission } from "@/lib/auth/permissions";
import { InvoicePrintView } from "@/components/admin/billing/invoice-print-view";
import { InvoiceActions } from "@/components/admin/billing/invoice-actions";

export const dynamic = "force-dynamic";

export default async function InvoiceDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const staff = await getCurrentStaff();
  if (!hasPermission(staff.role, "viewBilling")) redirect("/admin");

  const { id } = await params;

  const invoice = await prisma.invoice.findUnique({
    where: { id },
    include: {
      patient: true,
      doctor: true,
      items: true,
      payments: { orderBy: { paidAt: "desc" } },
    },
  });

  if (!invoice) notFound();

  return (
    <div className="mx-auto max-w-3xl space-y-5">
      <div className="no-print flex items-center justify-between">
        <Link
          href="/admin/billing"
          className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-primary"
        >
          <ArrowRight className="size-4" />
          العودة إلى الفواتير
        </Link>
        <InvoiceActions
          invoiceId={invoice.id}
          remainingBalance={invoice.remainingBalance}
          canRegisterPayment={hasPermission(staff.role, "managePayments")}
        />
      </div>

      <InvoicePrintView invoice={invoice} />
    </div>
  );
}
