"use client";

import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { ArrowDown, ArrowUp } from "lucide-react";
import { TableHead } from "@/components/ui/table";

export function SortableHead({
  label,
  field,
  sortField,
  sortDir,
}: {
  label: string;
  field: string;
  sortField: string;
  sortDir: "asc" | "desc";
}) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const active = sortField === field;
  const nextDir = active && sortDir === "asc" ? "desc" : "asc";

  const handleClick = () => {
    const params = new URLSearchParams(searchParams.toString());
    params.set("sort", `${field}:${nextDir}`);
    params.delete("page");
    router.push(`${pathname}?${params.toString()}`);
  };

  return (
    <TableHead>
      <button
        type="button"
        onClick={handleClick}
        className="flex items-center gap-1 hover:text-primary"
      >
        {label}
        {active &&
          (sortDir === "asc" ? (
            <ArrowUp className="size-3" />
          ) : (
            <ArrowDown className="size-3" />
          ))}
      </button>
    </TableHead>
  );
}
