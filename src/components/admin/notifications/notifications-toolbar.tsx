"use client";

import { useEffect, useState, useTransition } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { CheckCheck, Search } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { NOTIFICATION_TYPE_LABELS } from "@/lib/notifications";
import type { NotificationType } from "@/generated/prisma/client";

export function NotificationsToolbar({
  visibleTypes,
  hasUnread,
  onMarkAllRead,
}: {
  visibleTypes: NotificationType[];
  hasUnread: boolean;
  onMarkAllRead: () => void;
}) {
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

  const updateParam = (key: string, value: string | null) => {
    const params = new URLSearchParams(searchParams.toString());
    if (!value) params.delete(key);
    else params.set(key, value);
    params.delete("page");
    router.push(`${pathname}?${params.toString()}`);
  };

  return (
    <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
      <div className="flex flex-1 flex-col gap-3 sm:flex-row sm:items-center">
        <div className="relative sm:w-72">
          <Search className="pointer-events-none absolute right-2.5 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="بحث في الإشعارات"
            className="pr-8"
          />
        </div>

        <Select
          defaultValue={searchParams.get("type") ?? "ALL"}
          onValueChange={(v) => updateParam("type", !v || v === "ALL" ? null : v)}
        >
          <SelectTrigger className="w-full sm:w-52">
            <SelectValue placeholder="كل الأنواع" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="ALL">كل الأنواع</SelectItem>
            {visibleTypes.map((type) => (
              <SelectItem key={type} value={type}>
                {NOTIFICATION_TYPE_LABELS[type]}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <div className="flex items-center gap-2 rounded-xl border border-border/70 px-3 py-1.5">
          <Switch
            id="unread-only"
            checked={searchParams.get("unread") === "1"}
            onCheckedChange={(checked) => updateParam("unread", checked ? "1" : null)}
          />
          <Label htmlFor="unread-only" className="cursor-pointer text-sm">
            غير المقروءة فقط
          </Label>
        </div>
      </div>

      {hasUnread && (
        <Button variant="outline" size="sm" className="gap-1.5" onClick={onMarkAllRead}>
          <CheckCheck className="size-3.5" />
          تحديد الكل كمقروء
        </Button>
      )}
    </div>
  );
}
