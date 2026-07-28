import type { LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";

type StatCardProps = {
  label: string;
  value: number | string;
  icon: LucideIcon;
  accent?: "primary" | "turquoise" | "emerald" | "destructive" | "amber";
};

const ACCENT_CLASSES: Record<NonNullable<StatCardProps["accent"]>, string> = {
  primary: "bg-primary/10 text-primary",
  turquoise: "bg-turquoise/15 text-turquoise-foreground",
  emerald: "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400",
  destructive: "bg-destructive/10 text-destructive",
  amber: "bg-amber-500/10 text-amber-600 dark:text-amber-400",
};

export function StatCard({
  label,
  value,
  icon: Icon,
  accent = "primary",
}: StatCardProps) {
  return (
    <div className="rounded-2xl border border-border/70 bg-card p-5">
      <div className="flex items-center justify-between">
        <span className="text-sm text-muted-foreground">{label}</span>
        <span
          className={cn(
            "flex size-9 items-center justify-center rounded-xl",
            ACCENT_CLASSES[accent]
          )}
        >
          <Icon className="size-4.5" />
        </span>
      </div>
      <div className="mt-3 text-2xl font-extrabold tracking-tight">{value}</div>
    </div>
  );
}
