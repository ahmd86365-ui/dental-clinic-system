"use client";

import Link from "next/link";
import { Check, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { formatDateTime } from "@/lib/date-utils";
import {
  NOTIFICATION_PRIORITY_BADGE_CLASSES,
  NOTIFICATION_PRIORITY_LABELS,
  NOTIFICATION_TYPE_ICONS,
  NOTIFICATION_TYPE_LABELS,
} from "@/lib/notifications";
import type { Notification } from "@/generated/prisma/client";

export function NotificationItem({
  notification,
  compact,
  onMarkRead,
  onDelete,
  onNavigate,
}: {
  notification: Notification;
  compact?: boolean;
  onMarkRead?: (id: string) => void;
  onDelete?: (id: string) => void;
  onNavigate?: () => void;
}) {
  const Icon = NOTIFICATION_TYPE_ICONS[notification.type];

  const content = (
    <div
      className={cn(
        "flex items-start gap-3 rounded-xl border px-3 py-2.5 transition-colors",
        notification.isRead
          ? "border-border/50 bg-card"
          : "border-primary/30 bg-primary/[0.04]"
      )}
    >
      <span className="mt-0.5 flex size-8 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
        <Icon className="size-4" />
      </span>

      <div className="min-w-0 flex-1">
        <div className="flex flex-wrap items-center gap-1.5">
          <p className="truncate text-sm font-semibold">{notification.title}</p>
          <span
            className={cn(
              "rounded-full px-1.5 py-0.5 text-[0.65rem] font-medium",
              NOTIFICATION_PRIORITY_BADGE_CLASSES[notification.priority]
            )}
          >
            {NOTIFICATION_PRIORITY_LABELS[notification.priority]}
          </span>
        </div>
        <p className={cn("mt-0.5 text-xs text-muted-foreground", compact && "line-clamp-2")}>
          {notification.message}
        </p>
        <p className="mt-1 text-[0.65rem] text-muted-foreground">
          {NOTIFICATION_TYPE_LABELS[notification.type]} · {formatDateTime(notification.createdAt)}
        </p>
      </div>

      <div className="flex shrink-0 items-center gap-1">
        {!notification.isRead && onMarkRead && (
          <Button
            type="button"
            variant="ghost"
            size="icon-sm"
            aria-label="تحديد كمقروء"
            onClick={(event) => {
              event.preventDefault();
              event.stopPropagation();
              onMarkRead(notification.id);
            }}
          >
            <Check className="size-3.5" />
          </Button>
        )}
        {onDelete && (
          <Button
            type="button"
            variant="ghost"
            size="icon-sm"
            aria-label="حذف الإشعار"
            onClick={(event) => {
              event.preventDefault();
              event.stopPropagation();
              onDelete(notification.id);
            }}
          >
            <Trash2 className="size-3.5 text-destructive" />
          </Button>
        )}
      </div>
    </div>
  );

  if (notification.link) {
    return (
      <Link href={notification.link} onClick={onNavigate} className="block">
        {content}
      </Link>
    );
  }

  return content;
}
