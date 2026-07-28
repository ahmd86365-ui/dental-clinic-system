"use client";

import { useState, useTransition } from "react";
import { toast } from "sonner";
import { ClipboardList, Pencil, Plus, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { formatDateTime } from "@/lib/date-utils";
import { deleteDentalVisit } from "@/app/(admin)/admin/patients/[id]/actions";
import { DentalVisitDialog } from "@/components/admin/patients/profile/dental-visit-dialog";
import type { DentalVisit, Doctor } from "@/generated/prisma/client";

type VisitWithDoctor = DentalVisit & { doctor: Doctor };

export function DentalVisitsSection({
  patientId,
  visits,
  canEdit,
}: {
  patientId: string;
  visits: VisitWithDoctor[];
  canEdit: boolean;
}) {
  const [isPending, startTransition] = useTransition();
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingVisit, setEditingVisit] = useState<VisitWithDoctor | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const handleDelete = () => {
    if (!deletingId) return;
    startTransition(async () => {
      const result = await deleteDentalVisit(deletingId, patientId);
      if (result.success) toast.success("تم حذف الزيارة");
      else toast.error(result.error);
      setDeletingId(null);
    });
  };

  return (
    <div id="dental-visits" className="rounded-2xl border border-border/70 bg-card p-5">
      <div className="flex items-center justify-between">
        <h2 className="flex items-center gap-2 text-sm font-semibold">
          <ClipboardList className="size-4 text-primary" />
          السجل السريري وتاريخ الزيارات
        </h2>
        {canEdit && (
          <Button
            size="sm"
            className="gap-1.5"
            onClick={() => {
              setEditingVisit(null);
              setDialogOpen(true);
            }}
          >
            <Plus className="size-4" />
            زيارة جديدة
          </Button>
        )}
      </div>

      {visits.length === 0 ? (
        <p className="mt-4 text-sm text-muted-foreground">لا توجد زيارات مسجّلة بعد.</p>
      ) : (
        <div className="mt-4 space-y-3">
          {visits.map((visit) => (
            <div key={visit.id} className="rounded-xl border border-border/70 p-4">
              <div className="flex items-start justify-between gap-2">
                <div>
                  <p className="text-sm font-semibold">{formatDateTime(visit.visitDate)}</p>
                  <p className="text-xs text-muted-foreground">
                    د. {visit.doctor.firstName} {visit.doctor.lastName}
                  </p>
                </div>
                {canEdit && (
                  <div className="flex gap-1">
                    <Button
                      variant="ghost"
                      size="icon-sm"
                      onClick={() => {
                        setEditingVisit(visit);
                        setDialogOpen(true);
                      }}
                    >
                      <Pencil className="size-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon-sm"
                      onClick={() => setDeletingId(visit.id)}
                    >
                      <Trash2 className="size-4 text-destructive" />
                    </Button>
                  </div>
                )}
              </div>

              <div className="mt-3 grid gap-2 text-sm sm:grid-cols-2">
                {visit.chiefComplaint && (
                  <p>
                    <span className="text-muted-foreground">الشكوى الرئيسية: </span>
                    {visit.chiefComplaint}
                  </p>
                )}
                {visit.diagnosis && (
                  <p>
                    <span className="text-muted-foreground">التشخيص: </span>
                    {visit.diagnosis}
                  </p>
                )}
                {visit.treatmentPlan && (
                  <p>
                    <span className="text-muted-foreground">خطة العلاج: </span>
                    {visit.treatmentPlan}
                  </p>
                )}
                {visit.prescriptions && (
                  <p>
                    <span className="text-muted-foreground">الوصفة الطبية: </span>
                    {visit.prescriptions}
                  </p>
                )}
                {visit.proceduresPerformed.length > 0 && (
                  <p className="sm:col-span-2">
                    <span className="text-muted-foreground">الإجراءات المنفّذة: </span>
                    {visit.proceduresPerformed.join("، ")}
                  </p>
                )}
                {visit.clinicalNotes && (
                  <p className="sm:col-span-2">
                    <span className="text-muted-foreground">ملاحظات سريرية: </span>
                    {visit.clinicalNotes}
                  </p>
                )}
                {visit.followUpNotes && (
                  <p className="sm:col-span-2">
                    <span className="text-muted-foreground">ملاحظات المتابعة: </span>
                    {visit.followUpNotes}
                  </p>
                )}
                {visit.cost !== null && (
                  <p>
                    <span className="text-muted-foreground">التكلفة: </span>
                    {visit.cost}
                  </p>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {canEdit && (
        <DentalVisitDialog
          open={dialogOpen}
          onOpenChange={setDialogOpen}
          patientId={patientId}
          visit={editingVisit}
        />
      )}

      <AlertDialog open={!!deletingId} onOpenChange={(open) => !open && setDeletingId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>حذف سجل الزيارة؟</AlertDialogTitle>
            <AlertDialogDescription>
              سيتم حذف هذا السجل السريري نهائيًا. لا يمكن التراجع عن هذا الإجراء.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>إلغاء</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              disabled={isPending}
              className="bg-destructive text-white hover:bg-destructive/90"
            >
              حذف
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
