import "server-only";
import { prisma } from "@/lib/prisma";
import type { Staff } from "@/generated/prisma/client";

type LogParams = {
  action: string;
  entityType: string;
  entityId?: string;
  description: string;
};

export async function logActivity(actor: Staff, params: LogParams) {
  await prisma.activityLog.create({
    data: {
      actorId: actor.id,
      actorName: actor.fullName,
      actorRole: actor.role,
      action: params.action,
      entityType: params.entityType,
      entityId: params.entityId,
      description: params.description,
    },
  });
}
