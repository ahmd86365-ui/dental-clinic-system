"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import {
  Bell,
  CalendarClock,
  ClipboardList,
  Loader2,
  Receipt,
  Search,
  Stethoscope,
  UserCog,
  Users,
  Wallet,
  X,
  type LucideIcon,
} from "lucide-react";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { globalSearch, type SearchCategory, type SearchResultGroup } from "@/app/(admin)/admin/search-actions";

const CATEGORY_LABELS: Record<SearchCategory, string> = {
  patient: "المرضى",
  appointment: "المواعيد",
  treatmentPlan: "خطط العلاج",
  visit: "الزيارات السريرية",
  invoice: "الفواتير",
  payment: "الدفعات",
  staff: "الموظفون",
  notification: "الإشعارات",
};

const CATEGORY_ICONS: Record<SearchCategory, LucideIcon> = {
  patient: Users,
  appointment: CalendarClock,
  treatmentPlan: ClipboardList,
  visit: Stethoscope,
  invoice: Receipt,
  payment: Wallet,
  staff: UserCog,
  notification: Bell,
};

const RECENT_SEARCHES_KEY = "khalil-clinic-recent-searches";
const MAX_RECENT_SEARCHES = 8;
const DEBOUNCE_MS = 250;

function readRecentSearches(): string[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = window.localStorage.getItem(RECENT_SEARCHES_KEY);
    return raw ? (JSON.parse(raw) as string[]) : [];
  } catch {
    return [];
  }
}

function writeRecentSearches(searches: string[]) {
  try {
    window.localStorage.setItem(RECENT_SEARCHES_KEY, JSON.stringify(searches));
  } catch {
    // Storage unavailable (private mode / quota) — recent searches just won't persist.
  }
}

/** Splits text around the (case-insensitive) query match so it can be wrapped in <mark>. */
function highlightParts(text: string, query: string): { text: string; match: boolean }[] {
  if (!query.trim()) return [{ text, match: false }];
  const index = text.toLowerCase().indexOf(query.trim().toLowerCase());
  if (index === -1) return [{ text, match: false }];
  return [
    { text: text.slice(0, index), match: false },
    { text: text.slice(index, index + query.trim().length), match: true },
    { text: text.slice(index + query.trim().length), match: false },
  ].filter((part) => part.text.length > 0);
}

function HighlightedText({ text, query }: { text: string; query: string }) {
  return (
    <>
      {highlightParts(text, query).map((part, index) =>
        part.match ? (
          <mark key={index} className="rounded-sm bg-primary/20 text-primary">
            {part.text}
          </mark>
        ) : (
          <span key={index}>{part.text}</span>
        )
      )}
    </>
  );
}

export function GlobalSearch() {
  const router = useRouter();
  const inputRef = useRef<HTMLInputElement>(null);
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [groups, setGroups] = useState<SearchResultGroup[]>([]);
  const [loading, setLoading] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState(0);
  // Lazy initializer: a one-time read of an external store (localStorage) at
  // mount, not an effect — the dialog content isn't rendered while closed, so
  // there's no hydration mismatch to worry about.
  const [recentSearches, setRecentSearches] = useState<string[]>(() => readRecentSearches());

  const isQueryActive = query.trim().length >= 2;

  // groups/loading may briefly hold stale data for a query that's since been
  // cleared below 2 characters — every place that renders them also checks
  // isQueryActive, so the stale values are simply never shown rather than
  // reset via an effect (avoids a setState-during-effect render cascade).
  const flatItems = useMemo(
    () =>
      isQueryActive
        ? groups.flatMap((group) => group.items.map((item) => ({ ...item, category: group.category })))
        : [],
    [groups, isQueryActive]
  );

  const itemIndexByKey = useMemo(() => {
    const map = new Map<string, number>();
    flatItems.forEach((item, index) => map.set(`${item.category}-${item.id}`, index));
    return map;
  }, [flatItems]);

  // Ctrl+K / Cmd+K opens the palette from anywhere in the admin area.
  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      if ((event.ctrlKey || event.metaKey) && event.key.toLowerCase() === "k") {
        event.preventDefault();
        setOpen(true);
      }
    };
    document.addEventListener("keydown", onKeyDown);
    return () => document.removeEventListener("keydown", onKeyDown);
  }, []);

  useEffect(() => {
    if (!open) return;
    const timer = setTimeout(() => inputRef.current?.focus(), 50);
    return () => clearTimeout(timer);
  }, [open]);

  useEffect(() => {
    const trimmed = query.trim();
    if (trimmed.length < 2) return;

    let cancelled = false;
    const handle = setTimeout(() => {
      if (cancelled) return;
      setLoading(true);
      globalSearch(trimmed)
        .then((data) => {
          if (!cancelled) {
            setGroups(data);
            setSelectedIndex(0);
          }
        })
        .finally(() => {
          if (!cancelled) setLoading(false);
        });
    }, DEBOUNCE_MS);

    return () => {
      cancelled = true;
      clearTimeout(handle);
    };
  }, [query]);

  const commitRecentSearch = useCallback((term: string) => {
    setRecentSearches((prev) => {
      const next = [term, ...prev.filter((s) => s !== term)].slice(0, MAX_RECENT_SEARCHES);
      writeRecentSearches(next);
      return next;
    });
  }, []);

  const clearRecentSearches = () => {
    setRecentSearches([]);
    writeRecentSearches([]);
  };

  // Every path that closes the palette resets its transient state here
  // (instead of an effect keyed on `open`), so state changes happen exactly
  // once, at the moment of the actual user action that causes them.
  const closeSearch = () => {
    setOpen(false);
    setQuery("");
    setGroups([]);
    setSelectedIndex(0);
  };

  const goToResult = (item: (typeof flatItems)[number]) => {
    commitRecentSearch(query.trim());
    closeSearch();
    router.push(item.href);
  };

  const handleKeyDown = (event: React.KeyboardEvent<HTMLInputElement>) => {
    if (event.key === "Escape") {
      closeSearch();
      return;
    }
    if (flatItems.length === 0) return;

    if (event.key === "ArrowDown") {
      event.preventDefault();
      setSelectedIndex((i) => (i + 1) % flatItems.length);
    } else if (event.key === "ArrowUp") {
      event.preventDefault();
      setSelectedIndex((i) => (i - 1 + flatItems.length) % flatItems.length);
    } else if (event.key === "Enter") {
      event.preventDefault();
      const item = flatItems[selectedIndex];
      if (item) goToResult(item);
    }
  };

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="hidden h-9 w-64 items-center gap-2 rounded-xl border border-input bg-transparent px-3 text-sm text-muted-foreground outline-none transition-colors hover:border-ring/50 sm:flex"
      >
        <Search className="size-4 shrink-0" />
        <span className="flex-1 text-right">بحث سريع...</span>
        <kbd className="rounded-md border border-border bg-muted px-1.5 py-0.5 text-[10px] font-medium">
          Ctrl K
        </kbd>
      </button>

      <button
        type="button"
        onClick={() => setOpen(true)}
        aria-label="بحث"
        className="inline-flex size-9 items-center justify-center rounded-lg border border-border sm:hidden"
      >
        <Search className="size-4" />
      </button>

      <Dialog open={open} onOpenChange={(next) => (next ? setOpen(true) : closeSearch())}>
        <DialogContent
          showCloseButton={false}
          className="top-24 max-w-2xl -translate-y-0 gap-0 overflow-hidden p-0 sm:max-w-2xl"
        >
          <div className="flex items-center gap-2.5 border-b border-border px-4 py-3">
            <Search className="size-4.5 shrink-0 text-muted-foreground" />
            <input
              ref={inputRef}
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="ابحث عن مريض، موعد، فاتورة، موظف..."
              className="h-8 flex-1 bg-transparent text-sm outline-none placeholder:text-muted-foreground"
            />
            {loading && isQueryActive && (
              <Loader2 className="size-4 shrink-0 animate-spin text-muted-foreground" />
            )}
            <Button type="button" variant="ghost" size="icon-sm" onClick={closeSearch} aria-label="إغلاق">
              <X className="size-4" />
            </Button>
          </div>

          <div className="max-h-[60vh] overflow-y-auto p-2">
            {!isQueryActive && (
              <div className="p-2">
                <div className="mb-1 flex items-center justify-between px-1.5">
                  <span className="text-xs font-medium text-muted-foreground">عمليات بحث سابقة</span>
                  {recentSearches.length > 0 && (
                    <button
                      type="button"
                      onClick={clearRecentSearches}
                      className="text-xs text-muted-foreground hover:text-destructive"
                    >
                      مسح السجل
                    </button>
                  )}
                </div>
                {recentSearches.length === 0 ? (
                  <p className="px-1.5 py-2 text-sm text-muted-foreground">لا توجد عمليات بحث سابقة</p>
                ) : (
                  recentSearches.map((term) => (
                    <button
                      key={term}
                      type="button"
                      onClick={() => setQuery(term)}
                      className="flex w-full items-center gap-2.5 rounded-lg px-2.5 py-2 text-right text-sm hover:bg-accent hover:text-accent-foreground"
                    >
                      <Search className="size-3.5 shrink-0 text-muted-foreground" />
                      {term}
                    </button>
                  ))
                )}
              </div>
            )}

            {isQueryActive && !loading && groups.length === 0 && (
              <p className="px-3 py-6 text-center text-sm text-muted-foreground">
                لا توجد نتائج لـ &quot;{query}&quot;
              </p>
            )}

            {isQueryActive &&
              groups.map((group) => {
                const Icon = CATEGORY_ICONS[group.category];
                return (
                  <div key={group.category} className="mb-1 last:mb-0">
                    <div className="px-2.5 py-1.5 text-xs font-medium text-muted-foreground">
                      {CATEGORY_LABELS[group.category]}
                    </div>
                    {group.items.map((item) => {
                      const index = itemIndexByKey.get(`${group.category}-${item.id}`) ?? 0;
                      const isSelected = index === selectedIndex;
                      return (
                        <button
                          key={`${group.category}-${item.id}`}
                          type="button"
                          onMouseEnter={() => setSelectedIndex(index)}
                          onClick={() => goToResult({ ...item, category: group.category })}
                          className={cn(
                            "flex w-full items-center gap-2.5 rounded-lg px-2.5 py-2 text-right text-sm",
                            isSelected
                              ? "bg-accent text-accent-foreground"
                              : "hover:bg-accent hover:text-accent-foreground"
                          )}
                        >
                          <span className="flex size-7 shrink-0 items-center justify-center rounded-full bg-primary/10 text-primary">
                            <Icon className="size-3.5" />
                          </span>
                          <span className="min-w-0 flex-1">
                            <span className="block truncate font-medium">
                              <HighlightedText text={item.title} query={query} />
                            </span>
                            <span className="block truncate text-xs text-muted-foreground">
                              <HighlightedText text={item.subtitle} query={query} />
                            </span>
                          </span>
                          {item.date && (
                            <span className="shrink-0 text-xs text-muted-foreground">{item.date}</span>
                          )}
                        </button>
                      );
                    })}
                  </div>
                );
              })}
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
