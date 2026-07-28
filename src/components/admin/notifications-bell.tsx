"use client";

import { useCallback, useEffect, useState, useTransition } from "react";
import Link from "next/link";
import { toast } from "sonner";
import { Bell, CheckCheck } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { NotificationItem } from "@/components/admin/notifications/notification-item";
import { useNotificationRefresh } from "@/components/admin/notifications/use-notification-refresh";
import {
  getRecentNotifications,
  getUnreadNotificationCount,
  markAllNotificationsRead,
  markNotificationRead,
} from "@/app/(admin)/admin/notifications/actions";
import type { Notification } from "@/generated/prisma/client";

export function NotificationsBell() {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [open, setOpen] = useState(false);
  const [isPending, startTransition] = useTransition();

  const refresh = useCallback(() => {
    getRecentNotifications(8)
      .then(setNotifications)
      .catch(() => {});
    getUnreadNotificationCount()
      .then(setUnreadCount)
      .catch(() => {});
  }, []);

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

  const handleMarkAllRead = () => {
    startTransition(async () => {
      const result = await markAllNotificationsRead();
      if (result.success) refresh();
      else toast.error(result.error);
    });
  };

  return (
    <DropdownMenu open={open} onOpenChange={setOpen}>
      <DropdownMenuTrigger
        render={<Button variant="ghost" size="icon" className="relative" aria-label="الإشعارات" />}
      >
        <Bell className="size-5" />
        {unreadCount > 0 && (
          <span className="absolute -top-1 -right-1 flex size-4 items-center justify-center rounded-full bg-destructive text-[10px] font-bold text-white">
            {unreadCount > 9 ? "9+" : unreadCount}
          </span>
        )}
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-[22rem] max-w-[90vw] p-2">
        <div className="flex items-center justify-between px-1 pb-2">
          <h3 className="text-sm font-semibold">الإشعارات</h3>
          {unreadCount > 0 && (
            <Button
              type="button"
              variant="ghost"
              size="xs"
              className="gap-1"
              disabled={isPending}
              onClick={handleMarkAllRead}
            >
              <CheckCheck className="size-3.5" />
              تحديد الكل كمقروء
            </Button>
          )}
        </div>

        <div className="max-h-96 space-y-1.5 overflow-y-auto">
          {notifications.length === 0 && (
            <p className="px-2 py-6 text-center text-xs text-muted-foreground">
              لا توجد إشعارات حاليًا.
            </p>
          )}
          {notifications.map((notification) => (
            <NotificationItem
              key={notification.id}
              notification={notification}
              compact
              onMarkRead={handleMarkRead}
              onNavigate={() => {
                if (!notification.isRead) handleMarkRead(notification.id);
                setOpen(false);
              }}
            />
          ))}
        </div>

        <Link
          href="/admin/notifications"
          onClick={() => setOpen(false)}
          className="mt-2 block rounded-lg px-2 py-2 text-center text-xs font-medium text-primary hover:bg-muted"
        >
          عرض كل الإشعارات
        </Link>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
