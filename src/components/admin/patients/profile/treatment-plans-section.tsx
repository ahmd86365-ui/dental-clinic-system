"use client";

import { useState, useTransition } from "react";
import { toast } from "sonner";
import { ClipboardPlus, Pencil, Plus, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
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
import { cn } from "@/lib/utils";
import {
  TREATMENT_ITEM_STATUS_LABELS,
  TREATMENT_PLAN_STATUS_BADGE_CLASSES,
  TREATMENT_PLAN_STATUS_LABELS,
  TREATMENT_PRIORITY_BADGE_CLASSES,
  TREATMENT_PRIORITY_LABELS,
} from "@/lib/billing-labels";
import { formatShortDate, formatCurrency } from "@/lib/date-utils";
import {
  deleteTreatmentItem,
  deleteTreatmentPlan,
} from "@/app/(admin)/admin/patients/[id]/treatment-actions";
import { TreatmentPlanDialog } from "@/components/admin/patients/profile/treatment-plan-dialog";
import { TreatmentItemDialog } from "@/components/admin/patients/profile/treatment-item-dialog";
import type { TreatmentItem, TreatmentPlan } from "@/generated/prisma/client";

type PlanWithItems = TreatmentPlan & { items: TreatmentItem[] };

export function TreatmentPlansSection({
  patientId,
  plans,
  canEdit,
}: {
  patientId: string;
  plans: PlanWithItems[];
  canEdit: boolean;
}) {
  const [isPending, startTransition] = useTransition();
  const [planDialogOpen, setPlanDialogOpen] = useState(false);
  const [editingPlan, setEditingPlan] = useState<TreatmentPlan | null>(null);
  const [itemDialogOpen, setItemDialogOpen] = useState(false);
  const [activePlanId, setActivePlanId] = useState<string | null>(null);
  const [editingItem, setEditingItem] = useState<TreatmentItem | null>(null);
  const [deletingPlanId, setDeletingPlanId] = useState<string | null>(null);
  const [deletingItemId, setDeletingItemId] = useState<string | null>(null);

  const handleDeletePlan = () => {
    if (!deletingPlanId) return;
    const id = deletingPlanId;
    startTransition(async () => {
      const result = await deleteTreatmentPlan(id, patientId);
      if (result.success) toast.success("تم حذف خطة العلاج");
      else toast.error(result.error);
      setDeletingPlanId(null);
    });
  };

  const handleDeleteItem = () => {
    if (!deletingItemId) return;
    const id = deletingItemId;
    startTransition(async () => {
      const result = await deleteTreatmentItem(id, patientId);
      if (result.success) toast.success("تم حذف الإجراء");
      else toast.error(result.error);
      setDeletingItemId(null);
    });
  };

  return (
    <div id="treatment-plans" className="rounded-2xl border border-border/70 bg-card p-5">
      <div className="flex items-center justify-between">
        <h2 className="flex items-center gap-2 text-sm font-semibold">
          <ClipboardPlus className="size-4 text-primary" />
          خطط العلاج
        </h2>
        {canEdit && (
          <Button
            size="sm"
            className="gap-1.5"
            onClick={() => {
              setEditingPlan(null);
              setPlanDialogOpen(true);
            }}
          >
            <Plus className="size-4" />
            خطة جديدة
          </Button>
        )}
      </div>

      {plans.length === 0 ? (
        <p className="mt-4 text-sm text-muted-foreground">لا توجد خطط علاج مسجّلة بعد.</p>
      ) : (
        <div className="mt-4 space-y-4">
          {plans.map((plan) => (
            <div key={plan.id} className="rounded-xl border border-border/70 p-4">
              <div className="flex flex-wrap items-start justify-between gap-2">
                <div>
                  <div className="flex flex-wrap items-center gap-2">
                    <h3 className="font-semibold">{plan.title}</h3>
                    <span
                      className={cn(
                        "rounded-full px-2 py-0.5 text-xs font-medium",
                        TREATMENT_PLAN_STATUS_BADGE_CLASSES[plan.status]
                      )}
                    >
                      {TREATMENT_PLAN_STATUS_LABELS[plan.status]}
                    </span>
                    <span
                      className={cn(
                        "rounded-full px-2 py-0.5 text-xs font-medium",
                        TREATMENT_PRIORITY_BADGE_CLASSES[plan.priority]
                      )}
                    >
                      {TREATMENT_PRIORITY_LABELS[plan.priority]}
                    </span>
                  </div>
                  {plan.diagnosis && (
                    <p className="mt-1 text-sm text-muted-foreground">{plan.diagnosis}</p>
                  )}
                  <p className="mt-1 text-xs text-muted-foreground">
                    {plan.startDate && `يبدأ: ${formatShortDate(plan.startDate)}`}
                    {plan.estimatedEndDate &&
                      ` — ينتهي تقريبًا: ${formatShortDate(plan.estimatedEndDate)}`}
                  </p>
                </div>
                {canEdit && (
                  <div className="flex gap-1">
                    <Button
                      variant="ghost"
                      size="icon-sm"
                      onClick={() => {
                        setEditingPlan(plan);
                        setPlanDialogOpen(true);
                      }}
                    >
                      <Pencil className="size-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon-sm"
                      onClick={() => setDeletingPlanId(plan.id)}
                    >
                      <Trash2 className="size-4 text-destructive" />
                    </Button>
                  </div>
                )}
              </div>

              <div className="mt-3 space-y-2">
                {plan.items.map((item) => (
                  <div
                    key={item.id}
                    className="flex flex-wrap items-center justify-between gap-2 rounded-lg border border-border/60 px-3 py-2 text-sm"
                  >
                    <div className="min-w-0">
                      <p className="font-medium">
                        {item.procedureName}
                        {item.toothNumber && (
                          <span className="text-muted-foreground"> — سن {item.toothNumber}</span>
                        )}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {item.quantity} × {formatCurrency(item.unitPrice)} — خصم{" "}
                        {formatCurrency(item.discount)} = {formatCurrency(item.total)}
                      </p>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge variant="outline">{TREATMENT_ITEM_STATUS_LABELS[item.status]}</Badge>
                      {canEdit && (
                        <>
                          <Button
                            variant="ghost"
                            size="icon-sm"
                            onClick={() => {
                              setEditingItem(item);
                              setActivePlanId(plan.id);
                              setItemDialogOpen(true);
                            }}
                          >
                            <Pencil className="size-3.5" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon-sm"
                            onClick={() => setDeletingItemId(item.id)}
                          >
                            <Trash2 className="size-3.5 text-destructive" />
                          </Button>
                        </>
                      )}
                    </div>
                  </div>
                ))}
              </div>

              {canEdit && (
                <Button
                  variant="outline"
                  size="sm"
                  className="mt-3 gap-1.5"
                  onClick={() => {
                    setEditingItem(null);
                    setActivePlanId(plan.id);
                    setItemDialogOpen(true);
                  }}
                >
                  <Plus className="size-3.5" />
                  إضافة إجراء
                </Button>
              )}
            </div>
          ))}
        </div>
      )}

      {canEdit && (
        <TreatmentPlanDialog
          open={planDialogOpen}
          onOpenChange={setPlanDialogOpen}
          patientId={patientId}
          plan={editingPlan}
        />
      )}

      {canEdit && activePlanId && (
        <TreatmentItemDialog
          open={itemDialogOpen}
          onOpenChange={setItemDialogOpen}
          patientId={patientId}
          treatmentPlanId={activePlanId}
          item={editingItem}
        />
      )}

      <AlertDialog open={!!deletingPlanId} onOpenChange={(open) => !open && setDeletingPlanId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>حذف خطة العلاج؟</AlertDialogTitle>
            <AlertDialogDescription>
              سيتم حذف الخطة وكل الإجراءات المرتبطة بها نهائيًا.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>إلغاء</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeletePlan}
              disabled={isPending}
              className="bg-destructive text-white hover:bg-destructive/90"
            >
              حذف
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <AlertDialog open={!!deletingItemId} onOpenChange={(open) => !open && setDeletingItemId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>حذف الإجراء؟</AlertDialogTitle>
            <AlertDialogDescription>لا يمكن التراجع عن هذا الإجراء.</AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>إلغاء</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeleteItem}
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
