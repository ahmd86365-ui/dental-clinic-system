"use client";

import { useState, useTransition, type ReactNode } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { AnimatePresence, motion } from "framer-motion";
import { toast } from "sonner";
import { LogOut, Menu, User, X } from "lucide-react";
import { cn } from "@/lib/utils";
import { useClinicSettings } from "@/components/clinic-settings-provider";
import { ClinicLogo } from "@/components/clinic-logo";
import { NAV_ITEMS } from "@/components/admin/nav-items";
import { hasPermission } from "@/lib/auth/permissions";
import { NotificationsBell } from "@/components/admin/notifications-bell";
import { GlobalSearch } from "@/components/admin/global-search";
import { signOutAction } from "@/app/(admin)/admin/actions";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { STAFF_ROLE_LABELS } from "@/lib/staff-roles";
import type { Staff } from "@/generated/prisma/client";

function SidebarNav({ role, onNavigate }: { role: Staff["role"]; onNavigate?: () => void }) {
  const pathname = usePathname();

  return (
    <nav className="flex flex-col gap-1">
      {NAV_ITEMS.filter(
        (item) => !item.permission || hasPermission(role, item.permission)
      ).map((item) => {
        const active =
          item.href === "/admin"
            ? pathname === "/admin"
            : pathname.startsWith(item.href);

        return (
          <Link
            key={item.href}
            href={item.href}
            onClick={onNavigate}
            className={cn(
              "flex items-center gap-2.5 rounded-xl px-3 py-2.5 text-sm font-medium transition-colors",
              active
                ? "bg-primary text-primary-foreground shadow-sm"
                : "text-muted-foreground hover:bg-accent hover:text-accent-foreground"
            )}
          >
            <item.icon className="size-4 shrink-0" />
            {item.label}
          </Link>
        );
      })}
    </nav>
  );
}

export function AdminShell({
  staff,
  children,
}: {
  staff: Staff;
  children: ReactNode;
}) {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [isSigningOut, startSignOutTransition] = useTransition();
  const settings = useClinicSettings();

  const handleSignOut = () => {
    startSignOutTransition(async () => {
      try {
        await signOutAction();
      } catch (error) {
        // A successful sign-out calls redirect(), which surfaces as a
        // special NEXT_REDIRECT digest — not a real failure.
        const digest = (error as { digest?: string })?.digest;
        if (!digest?.startsWith("NEXT_REDIRECT")) {
          toast.error("تعذّر تسجيل الخروج، حاول مرة أخرى");
        }
      }
    });
  };

  return (
    <div className="flex min-h-svh bg-muted/30">
      <aside className="hidden w-64 shrink-0 border-l border-border/70 bg-card px-4 py-6 lg:flex lg:flex-col">
        <Link href="/admin" className="mb-8 flex items-center gap-2.5 px-2 font-bold">
          <ClinicLogo size="sm" />
          <span className="text-sm leading-tight">{settings.clinicName}</span>
        </Link>
        <SidebarNav role={staff.role} />
      </aside>

      <AnimatePresence>
        {mobileOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setMobileOpen(false)}
              className="fixed inset-0 z-40 bg-black/30 lg:hidden"
            />
            <motion.aside
              initial={{ x: "100%" }}
              animate={{ x: 0 }}
              exit={{ x: "100%" }}
              transition={{ duration: 0.25, ease: "easeOut" }}
              className="fixed inset-y-0 right-0 z-50 w-72 border-l border-border/70 bg-card px-4 py-6 lg:hidden"
            >
              <div className="mb-8 flex items-center justify-between px-2">
                <div className="flex items-center gap-2.5 font-bold">
                  <ClinicLogo size="sm" />
                  <span className="text-sm">{settings.clinicName}</span>
                </div>
                <button onClick={() => setMobileOpen(false)} aria-label="إغلاق">
                  <X className="size-5" />
                </button>
              </div>
              <SidebarNav role={staff.role} onNavigate={() => setMobileOpen(false)} />
            </motion.aside>
          </>
        )}
      </AnimatePresence>

      <div className="flex min-w-0 flex-1 flex-col">
        <header className="flex h-16 items-center justify-between border-b border-border/70 bg-card/80 px-4 backdrop-blur-md sm:px-6">
          <button
            onClick={() => setMobileOpen(true)}
            className="inline-flex size-9 items-center justify-center rounded-lg border border-border lg:hidden"
            aria-label="فتح القائمة"
          >
            <Menu className="size-5" />
          </button>

          <GlobalSearch />

          <div className="flex items-center gap-1.5">
            <NotificationsBell />

            <DropdownMenu>
              <DropdownMenuTrigger className="flex items-center gap-2 rounded-xl px-2 py-1.5 outline-none hover:bg-accent">
                <span className="flex size-8 items-center justify-center rounded-full bg-primary/10 text-primary">
                  <User className="size-4" />
                </span>
                <span className="hidden text-right sm:block">
                  <span className="block text-sm font-medium leading-tight">
                    {staff.fullName}
                  </span>
                  <span className="block text-xs leading-tight text-muted-foreground">
                    {STAFF_ROLE_LABELS[staff.role]}
                  </span>
                </span>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuGroup>
                  <DropdownMenuLabel>{staff.fullName}</DropdownMenuLabel>
                </DropdownMenuGroup>
                <DropdownMenuSeparator />
                <DropdownMenuItem
                  variant="destructive"
                  disabled={isSigningOut}
                  onClick={handleSignOut}
                >
                  <LogOut className="size-4" />
                  {isSigningOut ? "جارٍ تسجيل الخروج..." : "تسجيل الخروج"}
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </header>

        <main className="flex-1 px-4 py-6 sm:px-6 lg:px-8">{children}</main>
      </div>
    </div>
  );
}
