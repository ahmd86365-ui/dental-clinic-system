"use client";

import { useState } from "react";
import { Grid3x3 } from "lucide-react";
import { cn } from "@/lib/utils";
import {
  LOWER_ROW,
  TOOTH_CONDITION_COLORS,
  TOOTH_CONDITION_LABELS,
  UPPER_ROW,
} from "@/lib/tooth-chart";
import { ToothEditDialog } from "@/components/admin/patients/profile/tooth-edit-dialog";
import type { ToothCondition, ToothConditionType } from "@/generated/prisma/client";

type ToothConditionRow = Pick<ToothCondition, "toothNumber" | "condition" | "notes">;

function ToothCell({
  toothNumber,
  condition,
  onClick,
  canEdit,
}: {
  toothNumber: number;
  condition: ToothConditionType;
  onClick: () => void;
  canEdit: boolean;
}) {
  const color = TOOTH_CONDITION_COLORS[condition];

  return (
    <button
      type="button"
      onClick={onClick}
      disabled={!canEdit}
      title={`${toothNumber} — ${TOOTH_CONDITION_LABELS[condition]}`}
      className={cn(
        "flex aspect-square w-full flex-col items-center justify-center gap-0.5 rounded-lg border text-[10px] font-semibold transition-transform",
        canEdit && "cursor-pointer hover:scale-105",
        condition === "HEALTHY" ? "border-border" : "border-transparent text-white"
      )}
      style={{
        backgroundColor: condition === "HEALTHY" ? "var(--card)" : color,
        color: condition === "HEALTHY" ? "var(--foreground)" : "#fff",
      }}
    >
      <span>{toothNumber}</span>
    </button>
  );
}

export function Odontogram({
  patientId,
  conditions,
  canEdit,
}: {
  patientId: string;
  conditions: ToothConditionRow[];
  canEdit: boolean;
}) {
  const [selectedTooth, setSelectedTooth] = useState<number | null>(null);

  const conditionMap = new Map(conditions.map((c) => [c.toothNumber, c]));

  const getCondition = (tooth: number): ToothConditionType =>
    conditionMap.get(tooth)?.condition ?? "HEALTHY";

  const getNotes = (tooth: number): string | null => conditionMap.get(tooth)?.notes ?? null;

  return (
    <div className="rounded-2xl border border-border/70 bg-card p-5">
      <h2 className="flex items-center gap-2 text-sm font-semibold">
        <Grid3x3 className="size-4 text-primary" />
        مخطط الأسنان (Odontogram)
      </h2>

      <div className="mt-5 space-y-2">
        <div className="grid gap-1.5" style={{ gridTemplateColumns: "repeat(16, minmax(0, 1fr))" }}>
          {UPPER_ROW.map((tooth) => (
            <ToothCell
              key={tooth}
              toothNumber={tooth}
              condition={getCondition(tooth)}
              canEdit={canEdit}
              onClick={() => setSelectedTooth(tooth)}
            />
          ))}
        </div>
        <div className="grid gap-1.5" style={{ gridTemplateColumns: "repeat(16, minmax(0, 1fr))" }}>
          {LOWER_ROW.map((tooth) => (
            <ToothCell
              key={tooth}
              toothNumber={tooth}
              condition={getCondition(tooth)}
              canEdit={canEdit}
              onClick={() => setSelectedTooth(tooth)}
            />
          ))}
        </div>
      </div>

      <div className="mt-5 flex flex-wrap gap-x-4 gap-y-2 border-t border-border/70 pt-4">
        {(Object.keys(TOOTH_CONDITION_LABELS) as ToothConditionType[]).map((key) => (
          <div key={key} className="flex items-center gap-1.5 text-xs text-muted-foreground">
            <span
              className="size-3 rounded-full border border-border"
              style={{
                backgroundColor: key === "HEALTHY" ? "var(--card)" : TOOTH_CONDITION_COLORS[key],
              }}
            />
            {TOOTH_CONDITION_LABELS[key]}
          </div>
        ))}
      </div>

      {selectedTooth !== null && (
        <ToothEditDialog
          open={selectedTooth !== null}
          onOpenChange={(open) => !open && setSelectedTooth(null)}
          patientId={patientId}
          toothNumber={selectedTooth}
          currentCondition={getCondition(selectedTooth)}
          currentNotes={getNotes(selectedTooth)}
          canEdit={canEdit}
        />
      )}
    </div>
  );
}
