"use client";

import { useTransition } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { CheckCircle2, MoreVertical, PowerOff, UserCog } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { toggleDoctorActive } from "@/app/(admin)/admin/doctors/actions";
import type { Doctor } from "@/generated/prisma/client";

export function DoctorRowActions({ doctor }: { doctor: Doctor }) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  const handleToggleActive = () => {
    startTransition(async () => {
      const result = await toggleDoctorActive(doctor.id, !doctor.isActive);
      if (result.success) {
        toast.success(doctor.isActive ? "تم تعطيل الطبيب" : "تم تفعيل الطبيب");
        router.refresh();
      } else {
        toast.error(result.error);
      }
    });
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger render={<Button variant="ghost" size="icon-sm" disabled={isPending} />}>
        <MoreVertical className="size-4" />
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuItem onClick={() => router.push(`/admin/doctors/${doctor.id}`)}>
          <UserCog className="size-4" />
          تعديل
        </DropdownMenuItem>
        <DropdownMenuItem onClick={handleToggleActive}>
          {doctor.isActive ? (
            <>
              <PowerOff className="size-4" />
              تعطيل
            </>
          ) : (
            <>
              <CheckCircle2 className="size-4" />
              تفعيل
            </>
          )}
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
