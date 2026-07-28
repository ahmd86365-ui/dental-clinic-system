"use client";

import { useRef, useState, useTransition } from "react";
import { toast } from "sonner";
import { Download, FileText, Image as ImageIcon, Trash2, Upload } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
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
import { PATIENT_FILE_TYPE_LABELS } from "@/lib/medical-labels";
import {
  deletePatientFile,
  getPatientFileUrl,
  uploadPatientFile,
} from "@/app/(admin)/admin/patients/[id]/actions";
import type { PatientFile, PatientFileType } from "@/generated/prisma/client";

export function PatientFilesSection({
  patientId,
  files,
  canEdit,
}: {
  patientId: string;
  files: PatientFile[];
  canEdit: boolean;
}) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [fileType, setFileType] = useState<PatientFileType>("XRAY");
  const [isUploading, startUploadTransition] = useTransition();
  const [openingId, setOpeningId] = useState<string | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const handleFileSelected = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const formData = new FormData();
    formData.set("patientId", patientId);
    formData.set("fileType", fileType);
    formData.set("file", file);

    startUploadTransition(async () => {
      const result = await uploadPatientFile(formData);
      if (result.success) toast.success("تم رفع الملف بنجاح");
      else toast.error(result.error);
      if (fileInputRef.current) fileInputRef.current.value = "";
    });
  };

  const handleView = (file: PatientFile) => {
    setOpeningId(file.id);
    getPatientFileUrl(file.storagePath)
      .then((url) => {
        if (url) window.open(url, "_blank", "noopener,noreferrer");
        else toast.error("تعذّر فتح الملف");
      })
      .finally(() => setOpeningId(null));
  };

  const handleDelete = () => {
    if (!deletingId) return;
    const id = deletingId;
    startUploadTransition(async () => {
      const result = await deletePatientFile(id, patientId);
      if (result.success) toast.success("تم حذف الملف");
      else toast.error(result.error);
      setDeletingId(null);
    });
  };

  return (
    <div className="rounded-2xl border border-border/70 bg-card p-5">
      <h2 className="text-sm font-semibold">الملفات (أشعة، صور، PDF)</h2>

      {canEdit && (
        <div className="mt-4 flex flex-wrap items-center gap-2">
          <Select value={fileType} onValueChange={(v) => v && setFileType(v as PatientFileType)}>
            <SelectTrigger className="w-40">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {Object.entries(PATIENT_FILE_TYPE_LABELS).map(([value, label]) => (
                <SelectItem key={value} value={value}>
                  {label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Button
            size="sm"
            variant="outline"
            className="gap-1.5"
            disabled={isUploading}
            onClick={() => fileInputRef.current?.click()}
          >
            <Upload className="size-4" />
            {isUploading ? "جارٍ الرفع..." : "رفع ملف"}
          </Button>
          <input
            ref={fileInputRef}
            type="file"
            accept="image/png,image/jpeg,image/webp,application/pdf"
            className="hidden"
            onChange={handleFileSelected}
          />
        </div>
      )}

      {files.length === 0 ? (
        <p className="mt-4 text-sm text-muted-foreground">لا توجد ملفات مرفوعة بعد.</p>
      ) : (
        <div className="mt-4 space-y-2">
          {files.map((file) => (
            <div
              key={file.id}
              className="flex items-center justify-between gap-2 rounded-lg border border-border/60 px-3 py-2"
            >
              <button
                type="button"
                onClick={() => handleView(file)}
                disabled={openingId === file.id}
                className="flex min-w-0 flex-1 items-center gap-2 text-right text-sm hover:text-primary"
              >
                {file.fileType === "PDF" ? (
                  <FileText className="size-4 shrink-0 text-primary" />
                ) : (
                  <ImageIcon className="size-4 shrink-0 text-primary" />
                )}
                <span className="truncate">{file.fileName}</span>
              </button>
              <div className="flex shrink-0 items-center gap-1">
                <Button variant="ghost" size="icon-sm" onClick={() => handleView(file)}>
                  <Download className="size-4" />
                </Button>
                {canEdit && (
                  <Button variant="ghost" size="icon-sm" onClick={() => setDeletingId(file.id)}>
                    <Trash2 className="size-4 text-destructive" />
                  </Button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      <AlertDialog open={!!deletingId} onOpenChange={(open) => !open && setDeletingId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>حذف الملف؟</AlertDialogTitle>
            <AlertDialogDescription>لا يمكن التراجع عن هذا الإجراء.</AlertDialogDescription>
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
