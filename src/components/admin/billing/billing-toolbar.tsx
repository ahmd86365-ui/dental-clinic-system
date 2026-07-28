"use client";

import { useEffect, useState, useTransition } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { Search } from "lucide-react";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { INVOICE_PAYMENT_STATUS_LABELS } from "@/lib/billing-labels";

const STATUSES = ["UNPAID", "PARTIALLY_PAID", "PAID"] as const;

export function BillingToolbar() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [, startTransition] = useTransition();
  const [query, setQuery] = useState(searchParams.get("q") ?? "");

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
    <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
      <div className="relative sm:w-72">
        <Search className="pointer-events-none absolute right-2.5 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
        <Input
          value={query}
          onChange={(event) => setQuery(event.target.value)}
          placeholder="بحث برقم الفاتورة أو اسم المريض أو الهاتف"
          className="pr-8"
        />
      </div>

      <Select
        defaultValue={searchParams.get("status") ?? "ALL"}
        onValueChange={handleStatusChange}
      >
        <SelectTrigger className="w-full sm:w-52">
          <SelectValue placeholder="كل حالات الدفع" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="ALL">كل حالات الدفع</SelectItem>
          {STATUSES.map((status) => (
            <SelectItem key={status} value={status}>
              {INVOICE_PAYMENT_STATUS_LABELS[status]}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
}
