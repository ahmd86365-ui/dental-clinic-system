"use client";

import { motion } from "framer-motion";
import { CalendarCheck, PhoneCall, ShieldCheck, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useClinicSettings } from "@/components/clinic-settings-provider";
import { usePublicI18n } from "@/components/public-i18n-provider";
import { useBookingDialog } from "@/components/appointment/booking-dialog";

export function Hero() {
  const { openDialog } = useBookingDialog();
  const settings = useClinicSettings();
  const { dict } = usePublicI18n();

  return (
    <section id="home" className="relative overflow-hidden">
      <div className="pointer-events-none absolute inset-0 -z-10 bg-[radial-gradient(circle_at_15%_-10%,color-mix(in_oklch,var(--primary),transparent_88%),transparent_55%),radial-gradient(circle_at_85%_10%,color-mix(in_oklch,var(--turquoise),transparent_88%),transparent_55%)]" />

      <div className="mx-auto grid max-w-6xl items-center gap-14 px-4 py-20 sm:px-6 md:grid-cols-2 md:py-28">
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease: "easeOut" }}
        >
          <Badge variant="secondary" className="mb-5 gap-1.5 border border-turquoise/30 bg-turquoise/10 text-turquoise-foreground">
            <Sparkles className="size-3.5 text-turquoise" />
            {dict.hero.badge}
          </Badge>

          <h1 className="text-4xl font-extrabold leading-tight tracking-tight text-primary sm:text-5xl">
            {dict.hero.headingLead}
            <span className="relative mx-2 inline-block text-foreground">
              {settings.doctorName}
              <span className="absolute inset-x-0 -bottom-1 h-2 -z-10 rounded-full bg-turquoise/30" />
            </span>
          </h1>

          <p className="mt-5 max-w-xl text-lg leading-8 text-muted-foreground">
            {settings.clinicDescription}
          </p>

          <div className="mt-8 flex flex-wrap gap-3">
            <Button
              size="lg"
              onClick={openDialog}
              className="gap-2 shadow-md shadow-primary/20"
            >
              <CalendarCheck className="size-4" />
              {dict.hero.primaryCta}
            </Button>
            <Button
              size="lg"
              variant="outline"
              render={<a href="#services" />}
              nativeButton={false}
              className="gap-2"
            >
              <PhoneCall className="size-4" />
              {dict.hero.secondaryCta}
            </Button>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, scale: 0.92 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.7, ease: "easeOut", delay: 0.15 }}
          className="relative mx-auto aspect-square w-full max-w-md"
        >
          {settings.heroImageUrl ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={settings.heroImageUrl}
              alt={settings.doctorName}
              className="absolute inset-0 size-full rounded-[3rem] object-cover shadow-xl"
            />
          ) : (
            <>
              <div className="absolute inset-0 rounded-[3rem] bg-gradient-to-br from-primary via-primary to-turquoise opacity-90" />
              <div className="absolute inset-[3px] rounded-[calc(3rem-3px)] bg-gradient-to-br from-primary/95 to-turquoise/80" />

              <div className="absolute inset-8 rounded-[2.25rem] border border-white/15 backdrop-blur-sm" />

              <div className="absolute inset-0 flex flex-col items-center justify-center gap-4 text-center text-primary-foreground">
                <span className="flex size-24 items-center justify-center rounded-full bg-white/10 ring-1 ring-white/25">
                  <ShieldCheck className="size-10" />
                </span>
                <div>
                  <p className="text-xl font-bold">{settings.doctorName}</p>
                  <p className="text-sm text-primary-foreground/70">
                    {settings.doctorTitle}
                  </p>
                </div>
              </div>
            </>
          )}

          <motion.div
            animate={{ y: [0, -10, 0] }}
            transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
            className="absolute -start-6 top-8 flex items-center gap-2 rounded-2xl border border-border bg-card px-4 py-3 shadow-xl"
          >
            <Sparkles className="size-5 text-turquoise" />
            <div className="text-start">
              <div className="text-sm font-bold">{dict.hero.floatingBadge.title}</div>
              <div className="text-[11px] text-muted-foreground">{dict.hero.floatingBadge.subtitle}</div>
            </div>
          </motion.div>

          <motion.div
            animate={{ y: [0, 10, 0] }}
            transition={{ duration: 4.5, repeat: Infinity, ease: "easeInOut", delay: 0.5 }}
            className="absolute -end-4 bottom-10 flex items-center gap-2 rounded-2xl border border-border bg-card px-4 py-3 shadow-xl"
          >
            <CalendarCheck className="size-5 text-primary" />
            <div className="text-start">
              <div className="text-sm font-bold">{dict.hero.floatingBooking.title}</div>
              <div className="text-[11px] text-muted-foreground">{dict.hero.floatingBooking.subtitle}</div>
            </div>
          </motion.div>
        </motion.div>
      </div>
    </section>
  );
}
