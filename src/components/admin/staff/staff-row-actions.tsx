"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { CheckCircle2, MoreVertical, PowerOff, Trash2, UserCog } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
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
import { deleteStaff, toggleStaffActive } from "@/app/(admin)/admin/staff/actions";
import type { Staff } from "@/generated/prisma/client";

export function StaffRowActions({
  staff,
  isSelf,
}: {
  staff: Staff;
  isSelf: boolean;
}) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
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
      if (result.success) toast.success("تم حذف الموظف");
      else toast.error(result.error);
      setDeleteOpen(false);
    });
  };

  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger
          render={<Button variant="ghost" size="icon-sm" disabled={isPending} />}
        >
          <MoreVertical className="size-4" />
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          <DropdownMenuItem onClick={() => router.push(`/admin/staff/${staff.id}`)}>
            <UserCog className="size-4" />
            عرض الملف / تعديل
          </DropdownMenuItem>
          {!isSelf && (
            <DropdownMenuItem onClick={handleToggleActive}>
              {staff.isActive ? (
                <>
                  <PowerOff className="size-4" />
                  تعطيل الحساب
                </>
              ) : (
                <>
                  <CheckCircle2 className="size-4" />
                  تفعيل الحساب
                </>
              )}
            </DropdownMenuItem>
          )}
          {!isSelf && (
            <DropdownMenuItem variant="destructive" onClick={() => setDeleteOpen(true)}>
              <Trash2 className="size-4" />
              حذف
            </DropdownMenuItem>
          )}
        </DropdownMenuContent>
      </DropdownMenu>

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
    </>
  );
}
