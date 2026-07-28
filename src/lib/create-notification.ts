import "server-only";
import { prisma } from "@/lib/prisma";
import type { NotificationPriority, NotificationType } from "@/generated/prisma/client";

type CreateNotificationInput = {
  type: NotificationType;
  priority?: NotificationPriority;
  title: string;
  message: string;
  link?: string;
};

/** Fire-and-forget-style helper mirroring logActivity's call pattern. */
export async function createNotification(input: CreateNotificationInput): Promise<void> {
  await prisma.notification.create({
    data: {
      type: input.type,
      priority: input.priority ?? "MEDIUM",
      title: input.title,
      message: input.message,
      link: input.link,
    },
  });
}
