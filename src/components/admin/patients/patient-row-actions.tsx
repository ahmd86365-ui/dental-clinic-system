"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { FolderOpen, MoreVertical, Pencil, Trash2 } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
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
import { hasPermission } from "@/lib/auth/permissions";
import { deletePatient } from "@/app/(admin)/admin/patients/actions";
import { PatientDialog } from "@/components/admin/patients/patient-dialog";
import type { Gender, Staff } from "@/generated/prisma/client";

type PatientForActions = {
  id: string;
  fullName: string;
  phone: string;
  age: number | null;
  gender: Gender | null;
  email: string | null;
  notes: string | null;
};

export function PatientRowActions({
  role,
  patient,
}: {
  role: Staff["role"];
  patient: PatientForActions;
}) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [editOpen, setEditOpen] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);

  const handleDelete = () => {
    startTransition(async () => {
      const result = await deletePatient(patient.id);
      if (result.success) toast.success("تم حذف المريض");
      else toast.error(result.error);
      setDeleteOpen(false);
    });
  };

  const canEdit = hasPermission(role, "editPatient");
  const canDelete = hasPermission(role, "deletePatient");

  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger
          render={<Button variant="ghost" size="icon-sm" disabled={isPending} />}
        >
          <MoreVertical className="size-4" />
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          <DropdownMenuItem onClick={() => router.push(`/admin/patients/${patient.id}`)}>
            <FolderOpen className="size-4" />
            عرض الملف الطبي
          </DropdownMenuItem>
          {(canEdit || canDelete) && <DropdownMenuSeparator />}
          {canEdit && (
            <DropdownMenuItem onClick={() => setEditOpen(true)}>
              <Pencil className="size-4" />
              تعديل
            </DropdownMenuItem>
          )}
          {canDelete && (
            <DropdownMenuItem variant="destructive" onClick={() => setDeleteOpen(true)}>
              <Trash2 className="size-4" />
              حذف
            </DropdownMenuItem>
          )}
        </DropdownMenuContent>
      </DropdownMenu>

      {canEdit && (
        <PatientDialog
          open={editOpen}
          onOpenChange={setEditOpen}
          patient={{
            id: patient.id,
            fullName: patient.fullName,
            phone: patient.phone,
            age: patient.age ? String(patient.age) : "",
            gender: patient.gender ?? "",
            email: patient.email ?? "",
            notes: patient.notes ?? "",
          }}
        />
      )}

      <AlertDialog open={deleteOpen} onOpenChange={setDeleteOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>حذف المريض؟</AlertDialogTitle>
            <AlertDialogDescription>
              سيتم حذف بيانات {patient.fullName} نهائيًا. لا يمكن التراجع عن هذا الإجراء.
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
