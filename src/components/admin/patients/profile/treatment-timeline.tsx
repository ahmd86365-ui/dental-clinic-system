import { CalendarClock, CheckCircle2, Clock, FileText, XCircle } from "lucide-react";
import { cn } from "@/lib/utils";
import { formatDateTime } from "@/lib/date-utils";

export type TimelineStatus = "COMPLETED" | "IN_PROGRESS" | "PLANNED" | "CANCELLED";

export type TimelineEntry = {
  id: string;
  date: Date;
  kind: "VISIT" | "TREATMENT";
  title: string;
  subtitle?: string;
  status: TimelineStatus;
};

const STATUS_META: Record<
  TimelineStatus,
  { label: string; dot: string; icon: typeof CheckCircle2 }
> = {
  COMPLETED: { label: "مكتمل", dot: "bg-emerald-500", icon: CheckCircle2 },
  IN_PROGRESS: { label: "قيد التنفيذ", dot: "bg-amber-500", icon: Clock },
  PLANNED: { label: "قادم", dot: "bg-turquoise", icon: CalendarClock },
  CANCELLED: { label: "ملغي", dot: "bg-destructive", icon: XCircle },
};

export function TreatmentTimeline({ entries }: { entries: TimelineEntry[] }) {
  return (
    <div className="rounded-2xl border border-border/70 bg-card p-5">
      <h2 className="flex items-center gap-2 text-sm font-semibold">
        <FileText className="size-4 text-primary" />
        المخطط الزمني للعلاج
      </h2>

      {entries.length === 0 ? (
        <p className="mt-4 text-sm text-muted-foreground">لا يوجد نشاط علاجي مسجّل بعد.</p>
      ) : (
        <ol className="relative mt-5 space-y-5 border-r-2 border-border pr-5">
          {entries.map((entry) => {
            const meta = STATUS_META[entry.status];
            const Icon = meta.icon;
            return (
              <li key={entry.id} className="relative">
                <span
                  className={cn(
                    "absolute -right-[27px] top-0.5 flex size-4 items-center justify-center rounded-full ring-4 ring-card",
                    meta.dot
                  )}
                />
                <div className="flex flex-wrap items-center gap-2">
                  <p className="text-sm font-semibold">{entry.title}</p>
                  <span className="flex items-center gap-1 rounded-full bg-muted px-2 py-0.5 text-xs text-muted-foreground">
                    <Icon className="size-3" />
                    {meta.label}
                  </span>
                </div>
                {entry.subtitle && (
                  <p className="mt-0.5 text-xs text-muted-foreground">{entry.subtitle}</p>
                )}
                <p className="mt-0.5 text-xs text-muted-foreground">
                  {formatDateTime(entry.date)}
                </p>
              </li>
            );
          })}
        </ol>
      )}
    </div>
  );
}
