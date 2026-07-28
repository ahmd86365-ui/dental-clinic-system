"use client";

import { useState, useTransition } from "react";
import { toast } from "sonner";
import { Save } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { cn } from "@/lib/utils";
import { TOOTH_CONDITIONS, TOOTH_CONDITION_COLORS, TOOTH_CONDITION_LABELS } from "@/lib/tooth-chart";
import { updateToothCondition } from "@/app/(admin)/admin/patients/[id]/actions";
import type { ToothConditionType } from "@/generated/prisma/client";

export function ToothEditDialog({
  open,
  onOpenChange,
  patientId,
  toothNumber,
  currentCondition,
  currentNotes,
  canEdit,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  patientId: string;
  toothNumber: number;
  currentCondition: ToothConditionType;
  currentNotes: string | null;
  canEdit: boolean;
}) {
  const [isPending, startTransition] = useTransition();
  const [condition, setCondition] = useState<ToothConditionType>(currentCondition);
  const [notes, setNotes] = useState(currentNotes ?? "");

  const handleSave = () => {
    startTransition(async () => {
      const result = await updateToothCondition(patientId, {
        toothNumber,
        condition,
        notes,
      });

      if (result.success) {
        toast.success("تم تحديث حالة السن");
        onOpenChange(false);
      } else {
        toast.error(result.error);
      }
    });
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>السن رقم {toothNumber}</DialogTitle>
          <DialogDescription>
            {canEdit ? "اختر الحالة الحالية لهذا السن." : "عرض حالة السن (للطبيب فقط تعديلها)."}
          </DialogDescription>
        </DialogHeader>

        <div className="grid grid-cols-3 gap-2">
          {TOOTH_CONDITIONS.map((option) => (
            <button
              key={option}
              type="button"
              disabled={!canEdit}
              onClick={() => setCondition(option)}
              className={cn(
                "flex flex-col items-center gap-1.5 rounded-xl border p-2 text-xs transition-colors",
                condition === option ? "border-primary ring-2 ring-primary/30" : "border-border",
                canEdit && "cursor-pointer hover:border-primary"
              )}
            >
              <span
                className="size-5 rounded-full border border-border"
                style={{
                  backgroundColor:
                    option === "HEALTHY" ? "var(--card)" : TOOTH_CONDITION_COLORS[option],
                }}
              />
              {TOOTH_CONDITION_LABELS[option]}
            </button>
          ))}
        </div>

        {canEdit && (
          <div className="space-y-1.5">
            <Label htmlFor="tooth-notes">ملاحظات (اختياري)</Label>
            <Textarea
              id="tooth-notes"
              rows={2}
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
            />
          </div>
        )}

        {canEdit && (
          <DialogFooter>
            <Button onClick={handleSave} disabled={isPending} className="gap-2">
              <Save className="size-4" />
              حفظ
            </Button>
          </DialogFooter>
        )}
      </DialogContent>
    </Dialog>
  );
}
