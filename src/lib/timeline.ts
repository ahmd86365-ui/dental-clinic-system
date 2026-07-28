import type { TimelineEntry, TimelineStatus } from "@/components/admin/patients/profile/treatment-timeline";
import type { DentalVisit, TreatmentItem, TreatmentPlan } from "@/generated/prisma/client";

const ITEM_STATUS_TO_TIMELINE: Record<TreatmentItem["status"], TimelineStatus> = {
  PLANNED: "PLANNED",
  IN_PROGRESS: "IN_PROGRESS",
  COMPLETED: "COMPLETED",
  CANCELLED: "CANCELLED",
};

export function buildTreatmentTimeline(
  visits: DentalVisit[],
  plans: (TreatmentPlan & { items: TreatmentItem[] })[]
): TimelineEntry[] {
  const visitEntries: TimelineEntry[] = visits.map((visit, index) => ({
    id: `visit-${visit.id}`,
    date: visit.visitDate,
    kind: "VISIT",
    title: `زيارة رقم ${visits.length - index}`,
    subtitle: visit.diagnosis ?? visit.chiefComplaint ?? undefined,
    status: "COMPLETED",
  }));

  const itemEntries: TimelineEntry[] = plans.flatMap((plan) =>
    plan.items.map((item) => ({
      id: `item-${item.id}`,
      date: item.createdAt,
      kind: "TREATMENT" as const,
      title: item.procedureName,
      subtitle: plan.title,
      status: ITEM_STATUS_TO_TIMELINE[item.status],
    }))
  );

  return [...visitEntries, ...itemEntries].sort(
    (a, b) => b.date.getTime() - a.date.getTime()
  );
}
