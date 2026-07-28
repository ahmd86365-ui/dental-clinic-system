"use client";

import { useCallback, useEffect, useState, useTransition } from "react";
import { useSearchParams } from "next/navigation";
import { toast } from "sonner";
import { Bell } from "lucide-react";
import { Pagination } from "@/components/admin/pagination";
import { NotificationItem } from "@/components/admin/notifications/notification-item";
import { NotificationsToolbar } from "@/components/admin/notifications/notifications-toolbar";
import { useNotificationRefresh } from "@/components/admin/notifications/use-notification-refresh";
import {
  deleteNotification,
  getNotifications,
  markAllNotificationsRead,
  markNotificationRead,
  type NotificationsResult,
} from "@/app/(admin)/admin/notifications/actions";
import type { Notification, NotificationType } from "@/generated/prisma/client";

const PAGE_SIZE = 15;

export function NotificationsCenter({
  initialData,
  visibleTypes,
}: {
  initialData: NotificationsResult;
  visibleTypes: NotificationType[];
}) {
  const searchParams = useSearchParams();
  const [data, setData] = useState<NotificationsResult>(initialData);
  const [isPending, startTransition] = useTransition();

  const currentFilters = {
    type: (searchParams.get("type") as NotificationType | null) ?? undefined,
    unreadOnly: searchParams.get("unread") === "1",
    search: searchParams.get("q") ?? undefined,
    page: Math.max(1, Number(searchParams.get("page")) || 1),
  };

  const refresh = useCallback(() => {
    getNotifications(currentFilters)
      .then(setData)
      .catch(() => {});
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchParams]);

  useEffect(() => {
    refresh();
  }, [refresh]);

  useNotificationRefresh(refresh);

  const handleMarkRead = (id: string) => {
    startTransition(async () => {
      const result = await markNotificationRead(id);
      if (result.success) refresh();
      else toast.error(result.error);
    });
  };

  const handleDelete = (id: string) => {
    startTransition(async () => {
      const result = await deleteNotification(id);
      if (result.success) {
        toast.success("تم حذف الإشعار");
        refresh();
      } else {
        toast.error(result.error);
      }
    });
  };

  const handleMarkAllRead = () => {
    startTransition(async () => {
      const result = await markAllNotificationsRead();
      if (result.success) {
        toast.success("تم تحديد الكل كمقروء");
        refresh();
      } else {
        toast.error(result.error);
      }
    });
  };

  return (
    <div className="space-y-4">
      <NotificationsToolbar
        visibleTypes={visibleTypes}
        hasUnread={data.unreadTotal > 0}
        onMarkAllRead={handleMarkAllRead}
      />

      <div className="space-y-2">
        {data.notifications.length === 0 && (
          <div className="flex flex-col items-center gap-2 rounded-2xl border border-border/70 bg-card py-14 text-muted-foreground">
            <Bell className="size-8" />
            <p className="text-sm">لا توجد إشعارات مطابقة.</p>
          </div>
        )}
        {data.notifications.map((notification: Notification) => (
          <NotificationItem
            key={notification.id}
            notification={notification}
            onMarkRead={handleMarkRead}
            onDelete={handleDelete}
          />
        ))}
      </div>

      <Pagination page={currentFilters.page} pageSize={PAGE_SIZE} total={data.total} />

      {isPending && (
        <p className="text-center text-xs text-muted-foreground">جارٍ التحديث...</p>
      )}
    </div>
  );
}
