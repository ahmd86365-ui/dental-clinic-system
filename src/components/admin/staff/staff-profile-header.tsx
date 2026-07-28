"use client";

import { useState, useTransition } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { ArrowRight, CheckCircle2, KeyRound, PowerOff, Trash2, User } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
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
import { cn } from "@/lib/utils";
import { STAFF_ROLE_LABELS } from "@/lib/staff-roles";
import { deleteStaff, toggleStaffActive } from "@/app/(admin)/admin/staff/actions";
import { ResetPasswordDialog } from "@/components/admin/staff/reset-password-dialog";
import type { Staff } from "@/generated/prisma/client";

export function StaffProfileHeader({ staff, isSelf }: { staff: Staff; isSelf: boolean }) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [resetOpen, setResetOpen] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);

  const handleToggleActive = () => {
    startTransition(async () => {
      const result = await toggleStaffActive(staff.id, !staff.isActive);
      if (result.success) {
        toast.success(staff.isActive ? "تم تعطيل الموظف" : "تم تفعيل الموظف");
        router.refresh();
      } else {
        toast.error(result.error);
      }
    });
  };

  const handleDelete = () => {
    startTransition(async () => {
      const result = await deleteStaff(staff.id);
      if (result.success) {
        toast.success("تم حذف الموظف");
        router.push("/admin/staff");
      } else {
        toast.error(result.error);
        setDeleteOpen(false);
      }
    });
  };

  return (
    <div>
      <Link
        href="/admin/staff"
        className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-primary"
      >
        <ArrowRight className="size-4" />
        العودة إلى قائمة الموظفين
      </Link>

      <div className="mt-4 flex flex-col gap-4 rounded-2xl border border-border/70 bg-card p-5 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-3">
          <Avatar size="lg" className="size-14">
            <AvatarImage src={staff.avatarUrl ?? undefined} alt={staff.fullName} />
            <AvatarFallback>
              <User className="size-6" />
            </AvatarFallback>
          </Avatar>
          <div>
            <h1 className="text-xl font-bold tracking-tight">
              {staff.fullName}
              {isSelf && <span className="mr-2 text-xs text-muted-foreground">(أنت)</span>}
            </h1>
            <p className="mt-0.5 text-sm text-muted-foreground">
              {staff.jobTitle || STAFF_ROLE_LABELS[staff.role]}
            </p>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <span className="rounded-full bg-secondary px-2.5 py-1 text-xs font-medium text-secondary-foreground">
            {STAFF_ROLE_LABELS[staff.role]}
          </span>
          <span
            className={cn(
              "rounded-full px-2.5 py-1 text-xs font-medium",
              staff.isActive
                ? "bg-emerald-500/15 text-emerald-700 dark:text-emerald-400"
                : "bg-destructive/10 text-destructive"
            )}
          >
            {staff.isActive ? "فعّال" : "معطّل"}
          </span>

          <Button
            type="button"
            variant="outline"
            size="sm"
            className="gap-1.5"
            onClick={() => setResetOpen(true)}
          >
            <KeyRound className="size-3.5" />
            إعادة تعيين كلمة المرور
          </Button>

          {!isSelf && (
            <Button
              type="button"
              variant="outline"
              size="sm"
              className="gap-1.5"
              disabled={isPending}
              onClick={handleToggleActive}
            >
              {staff.isActive ? (
                <>
                  <PowerOff className="size-3.5" />
                  تعطيل
                </>
              ) : (
                <>
                  <CheckCircle2 className="size-3.5" />
                  تفعيل
                </>
              )}
            </Button>
          )}

          {!isSelf && (
            <Button
              type="button"
              variant="destructive"
              size="sm"
              className="gap-1.5"
              onClick={() => setDeleteOpen(true)}
            >
              <Trash2 className="size-3.5" />
              حذف
            </Button>
          )}
        </div>
      </div>

      <ResetPasswordDialog open={resetOpen} onOpenChange={setResetOpen} staffId={staff.id} />

      <AlertDialog open={deleteOpen} onOpenChange={setDeleteOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>حذف الموظف؟</AlertDialogTitle>
            <AlertDialogDescription>
              سيتم حذف حساب {staff.fullName} نهائيًا ولن يتمكن من تسجيل الدخول بعد الآن.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>إلغاء</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
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
