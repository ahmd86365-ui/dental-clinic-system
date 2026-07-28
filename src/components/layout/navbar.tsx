"use client";

import { useEffect, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Menu, Phone, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { siteConfig } from "@/config/site";
import { useClinicSettings } from "@/components/clinic-settings-provider";
import { usePublicI18n } from "@/components/public-i18n-provider";
import { ClinicLogo } from "@/components/clinic-logo";
import { useBookingDialog } from "@/components/appointment/booking-dialog";
import { LanguageSwitcher } from "@/components/layout/language-switcher";

export function Navbar() {
  const [open, setOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const { openDialog } = useBookingDialog();
  const settings = useClinicSettings();
  const { dict } = usePublicI18n();

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <header
      className={cn(
        "sticky top-0 z-50 transition-all duration-300",
        scrolled
          ? "border-b border-border/70 bg-background/85 shadow-[0_1px_0_0_var(--border)] backdrop-blur-md"
          : "border-b border-transparent bg-background/60 backdrop-blur-sm"
      )}
    >
      <nav className="mx-auto flex h-18 max-w-6xl items-center justify-between px-4 sm:px-6">
        <a href="#home" className="flex items-center gap-2.5 font-bold">
          <ClinicLogo size="md" />
          <span className="flex flex-col leading-tight">
            <span className="text-base tracking-tight">{settings.clinicName}</span>
            <span className="text-[11px] font-normal text-muted-foreground">
              {settings.doctorTitle}
            </span>
          </span>
        </a>

        <div className="hidden items-center gap-7 lg:flex">
          {siteConfig.nav.map((item) => (
            <a
              key={item.href}
              href={item.href}
              className="text-sm font-medium text-muted-foreground transition-colors hover:text-primary"
            >
              {dict.nav[item.key]}
            </a>
          ))}
        </div>

        <div className="hidden items-center gap-2 lg:flex">
          <LanguageSwitcher />
          <Button
            variant="ghost"
            render={<a href={`tel:${settings.phone.replace(/\s/g, "")}`} />}
            nativeButton={false}
            className="gap-1.5"
          >
            <Phone className="size-4" />
            {settings.phone}
          </Button>
          <Button onClick={openDialog}>{dict.nav.bookButton}</Button>
        </div>

        <button
          type="button"
          onClick={() => setOpen((v) => !v)}
          className="inline-flex size-10 items-center justify-center rounded-xl border border-border lg:hidden"
          aria-label={dict.nav.menuOpenLabel}
        >
          {open ? <X className="size-5" /> : <Menu className="size-5" />}
        </button>
      </nav>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="overflow-hidden border-t border-border/60 lg:hidden"
          >
            <div className="flex flex-col gap-1 px-4 py-4">
              {siteConfig.nav.map((item) => (
                <a
                  key={item.href}
                  href={item.href}
                  onClick={() => setOpen(false)}
                  className="rounded-lg px-3 py-2 text-sm font-medium text-muted-foreground hover:bg-accent hover:text-accent-foreground"
                >
                  {dict.nav[item.key]}
                </a>
              ))}
              <LanguageSwitcher className="mt-2 px-3" />
              <Button
                onClick={() => {
                  setOpen(false);
                  openDialog();
                }}
                className="mt-2"
              >
                {dict.nav.bookButton}
              </Button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
}
