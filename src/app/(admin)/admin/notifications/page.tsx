import { getCurrentStaff } from "@/lib/auth/current-staff";
import { getVisibleNotificationTypes } from "@/lib/notifications";
import { NotificationsCenter } from "@/components/admin/notifications/notifications-center";
import { getNotifications } from "@/app/(admin)/admin/notifications/actions";
import type { NotificationType } from "@/generated/prisma/client";

export const dynamic = "force-dynamic";

type SearchParams = {
  q?: string;
  type?: string;
  unread?: string;
  page?: string;
};

export default async function NotificationsPage({
  searchParams,
}: {
  searchParams: Promise<SearchParams>;
}) {
  const staff = await getCurrentStaff();
  const params = await searchParams;
  const visibleTypes = getVisibleNotificationTypes(staff.role);

  const filters = {
    type: params.type as NotificationType | undefined,
    unreadOnly: params.unread === "1",
    search: params.q,
    page: Math.max(1, Number(params.page) || 1),
  };

  const initialData = await getNotifications(filters);

  return (
    <div className="space-y-5">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">الإشعارات</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          {initialData.unreadTotal} إشعار غير مقروء
        </p>
      </div>

      <NotificationsCenter initialData={initialData} visibleTypes={visibleTypes} />
    </div>
  );
}
