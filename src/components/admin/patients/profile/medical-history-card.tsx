"use client";

import { useState } from "react";
import { Pencil, Stethoscope } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  SMOKING_STATUS_LABELS,
  BLOOD_TYPE_LABELS,
} from "@/lib/medical-labels";
import { MedicalHistoryDialog } from "@/components/admin/patients/profile/medical-history-dialog";
import type { BloodType, MedicalHistory, SmokingStatus } from "@/generated/prisma/client";

function TagList({ label, items }: { label: string; items: string[] }) {
  if (items.length === 0) return null;
  return (
    <div>
      <p className="text-xs text-muted-foreground">{label}</p>
      <div className="mt-1.5 flex flex-wrap gap-1.5">
        {items.map((item) => (
          <Badge key={item} variant="outline">
            {item}
          </Badge>
        ))}
      </div>
    </div>
  );
}

export function MedicalHistoryCard({
  patientId,
  history,
  canEdit,
}: {
  patientId: string;
  history: MedicalHistory | null;
  canEdit: boolean;
}) {
  const [open, setOpen] = useState(false);

  const hasAnyData =
    history &&
    (history.allergies.length > 0 ||
      history.chronicDiseases.length > 0 ||
      history.currentMedications.length > 0 ||
      history.previousSurgeries.length > 0 ||
      history.smokingStatus ||
      history.bloodType ||
      history.medicalNotes);

  return (
    <div className="rounded-2xl border border-border/70 bg-card p-5">
      <div className="flex items-center justify-between">
        <h2 className="flex items-center gap-2 text-sm font-semibold">
          <Stethoscope className="size-4 text-primary" />
          السجل الطبي
        </h2>
        {canEdit && (
          <Button variant="ghost" size="icon-sm" onClick={() => setOpen(true)}>
            <Pencil className="size-4" />
          </Button>
        )}
      </div>

      {!hasAnyData ? (
        <p className="mt-3 text-sm text-muted-foreground">لا توجد بيانات طبية مسجّلة بعد.</p>
      ) : (
        <div className="mt-4 space-y-3">
          <TagList label="الحساسية" items={history?.allergies ?? []} />
          <TagList label="الأمراض المزمنة" items={history?.chronicDiseases ?? []} />
          <TagList label="الأدوية الحالية" items={history?.currentMedications ?? []} />
          <TagList label="العمليات الجراحية السابقة" items={history?.previousSurgeries ?? []} />

          <div className="flex flex-wrap gap-4 pt-1 text-sm">
            {history?.smokingStatus && (
              <div>
                <p className="text-xs text-muted-foreground">التدخين</p>
                <p className="font-medium">
                  {SMOKING_STATUS_LABELS[history.smokingStatus as SmokingStatus]}
                </p>
              </div>
            )}
            {history?.bloodType && (
              <div>
                <p className="text-xs text-muted-foreground">فصيلة الدم</p>
                <p className="font-medium">{BLOOD_TYPE_LABELS[history.bloodType as BloodType]}</p>
              </div>
            )}
            {history?.isPregnant && (
              <div>
                <p className="text-xs text-muted-foreground">الحمل</p>
                <p className="font-medium">نعم</p>
              </div>
            )}
          </div>

          {history?.medicalNotes && (
            <div>
              <p className="text-xs text-muted-foreground">ملاحظات طبية</p>
              <p className="mt-1 text-sm leading-6">{history.medicalNotes}</p>
            </div>
          )}
        </div>
      )}

      {canEdit && (
        <MedicalHistoryDialog
          open={open}
          onOpenChange={setOpen}
          patientId={patientId}
          history={history}
        />
      )}
    </div>
  );
}
