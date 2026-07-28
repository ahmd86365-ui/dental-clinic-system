"use client";

import { useEffect, useState, useTransition } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { Plus, Search } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { hasPermission } from "@/lib/auth/permissions";
import { APPOINTMENT_STATUSES, APPOINTMENT_STATUS_LABELS } from "@/lib/appointment-status";
import { NewAppointmentDialog } from "@/components/admin/appointments/new-appointment-dialog";
import type { Staff } from "@/generated/prisma/client";

export function AppointmentsToolbar({ role }: { role: Staff["role"] }) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [, startTransition] = useTransition();
  const [query, setQuery] = useState(searchParams.get("q") ?? "");
  const [newOpen, setNewOpen] = useState(false);

  useEffect(() => {
    const handle = setTimeout(() => {
      const params = new URLSearchParams(searchParams.toString());
      if (query) params.set("q", query);
      else params.delete("q");
      params.delete("page");
      startTransition(() => router.push(`${pathname}?${params.toString()}`));
    }, 350);

    return () => clearTimeout(handle);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [query]);

  const handleStatusChange = (value: string | null) => {
    const params = new URLSearchParams(searchParams.toString());
    if (!value || value === "ALL") params.delete("status");
    else params.set("status", value);
    params.delete("page");
    router.push(`${pathname}?${params.toString()}`);
  };

  return (
    <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
      <div className="flex flex-1 flex-col gap-3 sm:flex-row">
        <div className="relative sm:w-72">
          <Search className="pointer-events-none absolute right-2.5 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="بحث بالاسم أو رقم الهاتف"
            className="pr-8"
          />
        </div>

        <Select
          defaultValue={searchParams.get("status") ?? "ALL"}
          onValueChange={handleStatusChange}
        >
          <SelectTrigger className="w-full sm:w-48">
            <SelectValue placeholder="كل الحالات" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="ALL">كل الحالات</SelectItem>
            {APPOINTMENT_STATUSES.map((status) => (
              <SelectItem key={status} value={status}>
                {APPOINTMENT_STATUS_LABELS[status]}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {hasPermission(role, "createAppointment") && (
        <>
          <Button onClick={() => setNewOpen(true)} className="gap-1.5">
            <Plus className="size-4" />
            حجز جديد
          </Button>
          <NewAppointmentDialog open={newOpen} onOpenChange={setNewOpen} />
        </>
      )}
    </div>
  );
}
