"use client";

import { useRef, useTransition } from "react";
import { toast } from "sonner";
import { Upload } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { uploadClinicAsset, type ClinicAssetKind } from "@/app/(admin)/admin/settings/clinic/actions";

export function AssetUploadField({
  label,
  kind,
  value,
  onChange,
  disabled,
  round,
}: {
  label: string;
  kind: ClinicAssetKind;
  value: string;
  onChange: (url: string) => void;
  disabled?: boolean;
  round?: boolean;
}) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [isUploading, startTransition] = useTransition();

  const handleFileSelected = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const formData = new FormData();
    formData.set("kind", kind);
    formData.set("file", file);

    startTransition(async () => {
      const result = await uploadClinicAsset(formData);
      if (result.success) {
        onChange(result.url);
        toast.success("تم رفع الملف بنجاح");
      } else {
        toast.error(result.error);
      }
      if (inputRef.current) inputRef.current.value = "";
    });
  };

  return (
    <div className="space-y-1.5">
      <Label>{label}</Label>
      <div className="flex items-center gap-3">
        {value ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={value}
            alt={label}
            className={round ? "size-14 rounded-full object-cover" : "h-14 w-24 rounded-lg object-contain"}
          />
        ) : (
          <div className="flex size-14 items-center justify-center rounded-lg border border-dashed border-border text-xs text-muted-foreground">
            —
          </div>
        )}
        {!disabled && (
          <Button
            type="button"
            variant="outline"
            size="sm"
            className="gap-1.5"
            disabled={isUploading}
            onClick={() => inputRef.current?.click()}
          >
            <Upload className="size-3.5" />
            {isUploading ? "جارٍ الرفع..." : "رفع صورة"}
          </Button>
        )}
        <input
          ref={inputRef}
          type="file"
          accept="image/png,image/jpeg,image/webp"
          className="hidden"
          onChange={handleFileSelected}
        />
      </div>
    </div>
  );
}
