"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { getCurrentStaff } from "@/lib/auth/current-staff";
import { getVisibleNotificationTypes } from "@/lib/notifications";
import type { Notification, NotificationType, Prisma } from "@/generated/prisma/client";

type ActionResult = { success: true } | { success: false; error: string };

const PAGE_SIZE = 15;

export type NotificationFilters = {
  type?: NotificationType;
  unreadOnly?: boolean;
  search?: string;
  page?: number;
};

export type NotificationsResult = {
  notifications: Notification[];
  total: number;
  unreadTotal: number;
};

async function getVisibleTypesForCurrentStaff(): Promise<NotificationType[]> {
  const staff = await getCurrentStaff();
  return getVisibleNotificationTypes(staff.role);
}

export async function getNotifications(
  filters: NotificationFilters
): Promise<NotificationsResult> {
  const visibleTypes = await getVisibleTypesForCurrentStaff();
  const page = Math.max(1, filters.page ?? 1);

  if (visibleTypes.length === 0) {
    return { notifications: [], total: 0, unreadTotal: 0 };
  }

  const typeFilter: NotificationType[] =
    filters.type && visibleTypes.includes(filters.type) ? [filters.type] : visibleTypes;

  const where: Prisma.NotificationWhereInput = {
    type: { in: typeFilter },
    ...(filters.unreadOnly ? { isRead: false } : {}),
    ...(filters.search?.trim()
      ? {
          OR: [
            { title: { contains: filters.search.trim(), mode: "insensitive" } },
            { message: { contains: filters.search.trim(), mode: "insensitive" } },
          ],
        }
      : {}),
  };

  const [notifications, total, unreadTotal] = await Promise.all([
    prisma.notification.findMany({
      where,
      orderBy: { createdAt: "desc" },
      skip: (page - 1) * PAGE_SIZE,
      take: PAGE_SIZE,
    }),
    prisma.notification.count({ where }),
    prisma.notification.count({ where: { type: { in: visibleTypes }, isRead: false } }),
  ]);

  return { notifications, total, unreadTotal };
}

export async function getUnreadNotificationCount(): Promise<number> {
  const visibleTypes = await getVisibleTypesForCurrentStaff();
  if (visibleTypes.length === 0) return 0;

  return prisma.notification.count({
    where: { type: { in: visibleTypes }, isRead: false },
  });
}

export async function getRecentNotifications(limit = 8): Promise<Notification[]> {
  const visibleTypes = await getVisibleTypesForCurrentStaff();
  if (visibleTypes.length === 0) return [];

  return prisma.notification.findMany({
    where: { type: { in: visibleTypes } },
    orderBy: { createdAt: "desc" },
    take: limit,
  });
}

export async function markNotificationRead(id: string): Promise<ActionResult> {
  const visibleTypes = await getVisibleTypesForCurrentStaff();

  const notification = await prisma.notification.findUnique({ where: { id } });
  if (!notification) return { success: false, error: "الإشعار غير موجود" };
  if (!visibleTypes.includes(notification.type)) {
    return { success: false, error: "لا تملك صلاحية الوصول لهذا الإشعار" };
  }

  await prisma.notification.update({ where: { id }, data: { isRead: true } });
  revalidatePath("/admin/notifications");
  return { success: true };
}

export async function markAllNotificationsRead(): Promise<ActionResult> {
  const visibleTypes = await getVisibleTypesForCurrentStaff();
  if (visibleTypes.length === 0) return { success: true };

  await prisma.notification.updateMany({
    where: { type: { in: visibleTypes }, isRead: false },
    data: { isRead: true },
  });

  revalidatePath("/admin/notifications");
  return { success: true };
}

export async function deleteNotification(id: string): Promise<ActionResult> {
  const visibleTypes = await getVisibleTypesForCurrentStaff();

  const notification = await prisma.notification.findUnique({ where: { id } });
  if (!notification) return { success: false, error: "الإشعار غير موجود" };
  if (!visibleTypes.includes(notification.type)) {
    return { success: false, error: "لا تملك صلاحية الوصول لهذا الإشعار" };
  }

  await prisma.notification.delete({ where: { id } });
  revalidatePath("/admin/notifications");
  return { success: true };
}
