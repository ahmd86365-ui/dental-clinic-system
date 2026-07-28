"use client";

import { useEffect, useState, useTransition } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { Plus, Search } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { hasPermission } from "@/lib/auth/permissions";
import { PatientDialog } from "@/components/admin/patients/patient-dialog";
import type { Staff } from "@/generated/prisma/client";

export function PatientsToolbar({ role }: { role: Staff["role"] }) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [, startTransition] = useTransition();
  const [query, setQuery] = useState(searchParams.get("q") ?? "");
  const [addOpen, setAddOpen] = useState(false);

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

  return (
    <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
      <div className="relative sm:w-72">
        <Search className="pointer-events-none absolute right-2.5 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
        <Input
          value={query}
          onChange={(event) => setQuery(event.target.value)}
          placeholder="بحث بالاسم أو رقم الهاتف"
          className="pr-8"
        />
      </div>

      {hasPermission(role, "createPatient") && (
        <>
          <Button onClick={() => setAddOpen(true)} className="gap-1.5">
            <Plus className="size-4" />
            إضافة مريض
          </Button>
          <PatientDialog open={addOpen} onOpenChange={setAddOpen} />
        </>
      )}
    </div>
  );
}
