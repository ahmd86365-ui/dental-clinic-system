"use client";

import { useRef, useTransition } from "react";
import { toast } from "sonner";
import { Upload, User } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { uploadStaffAvatar } from "@/app/(admin)/admin/staff/actions";

export function StaffAvatarField({
  value,
  onChange,
  disabled,
}: {
  value: string;
  onChange: (url: string) => void;
  disabled?: boolean;
}) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [isUploading, startTransition] = useTransition();

  const handleFileSelected = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const formData = new FormData();
    formData.set("file", file);

    startTransition(async () => {
      const result = await uploadStaffAvatar(formData);
      if (result.success) {
        onChange(result.url);
        toast.success("تم رفع الصورة بنجاح");
      } else {
        toast.error(result.error);
      }
      if (inputRef.current) inputRef.current.value = "";
    });
  };

  return (
    <div className="space-y-1.5">
      <Label>الصورة الشخصية</Label>
      <div className="flex items-center gap-3">
        <Avatar size="lg" className="size-16">
          <AvatarImage src={value || undefined} alt="الصورة الشخصية" />
          <AvatarFallback>
            <User className="size-6" />
          </AvatarFallback>
        </Avatar>
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
