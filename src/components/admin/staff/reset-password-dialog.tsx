"use client";

import { useState, useTransition } from "react";
import { toast } from "sonner";
import { KeyRound } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { resetStaffPassword } from "@/app/(admin)/admin/staff/actions";

export function ResetPasswordDialog({
  open,
  onOpenChange,
  staffId,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  staffId: string;
}) {
  const [isPending, startTransition] = useTransition();
  const [password, setPassword] = useState("");

  const handleSubmit = (event: React.FormEvent) => {
    event.preventDefault();

    startTransition(async () => {
      const result = await resetStaffPassword(staffId, { password });

      if (result.success) {
        toast.success("تم تغيير كلمة المرور بنجاح");
        setPassword("");
        onOpenChange(false);
      } else {
        toast.error(result.error);
      }
    });
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-sm">
        <form onSubmit={handleSubmit} className="space-y-4">
          <DialogHeader>
            <DialogTitle>إعادة تعيين كلمة المرور</DialogTitle>
            <DialogDescription>
              سيتم استبدال كلمة المرور الحالية للموظف فورًا.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-1.5">
            <Label htmlFor="reset-password">كلمة المرور الجديدة</Label>
            <Input
              id="reset-password"
              type="password"
              dir="ltr"
              minLength={8}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
            <p className="text-xs text-muted-foreground">
              8 أحرف على الأقل، وتحتوي على حرف كبير وحرف صغير ورقم.
            </p>
          </div>

          <DialogFooter>
            <Button type="submit" disabled={isPending} className="gap-2">
              <KeyRound className="size-4" />
              تعيين كلمة المرور
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
