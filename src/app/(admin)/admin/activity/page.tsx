import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { getCurrentStaff } from "@/lib/auth/current-staff";
import { hasPermission } from "@/lib/auth/permissions";
import { Pagination } from "@/components/admin/pagination";
import { formatDateTime } from "@/lib/date-utils";

export const dynamic = "force-dynamic";

const PAGE_SIZE = 20;

export default async function ActivityLogPage({
  searchParams,
}: {
  searchParams: Promise<{ page?: string }>;
}) {
  const staff = await getCurrentStaff();
  if (!hasPermission(staff.role, "viewActivityLog")) redirect("/admin");

  const params = await searchParams;
  const page = Math.max(1, Number(params.page) || 1);

  const [entries, total] = await Promise.all([
    prisma.activityLog.findMany({
      orderBy: { createdAt: "desc" },
      skip: (page - 1) * PAGE_SIZE,
      take: PAGE_SIZE,
    }),
    prisma.activityLog.count(),
  ]);

  return (
    <div className="space-y-5">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">سجل النشاط</h1>
        <p className="mt-1 text-sm text-muted-foreground">{total} عملية مسجّلة</p>
      </div>

      <div className="rounded-2xl border border-border/70 bg-card">
        <ul className="divide-y divide-border/70">
          {entries.length === 0 && (
            <li className="p-10 text-center text-sm text-muted-foreground">
              لا يوجد نشاط بعد.
            </li>
          )}
          {entries.map((entry) => (
            <li key={entry.id} className="flex items-start gap-3 p-4">
              <span className="mt-1.5 size-1.5 shrink-0 rounded-full bg-primary" />
              <div className="min-w-0 flex-1">
                <p className="text-sm leading-6">{entry.description}</p>
                <p className="mt-0.5 text-xs text-muted-foreground">
                  {entry.actorName} — {formatDateTime(entry.createdAt)}
                </p>
              </div>
            </li>
          ))}
        </ul>
      </div>

      <Pagination page={page} pageSize={PAGE_SIZE} total={total} />
    </div>
  );
}
