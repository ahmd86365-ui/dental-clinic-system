"use client";

import { motion } from "framer-motion";
import { GraduationCap, ShieldCheck, Sparkles, Stethoscope } from "lucide-react";
import { useClinicSettings } from "@/components/clinic-settings-provider";
import { usePublicI18n } from "@/components/public-i18n-provider";

const credentialIcons = [GraduationCap, Sparkles, Stethoscope, ShieldCheck];

export function AboutDoctor() {
  const settings = useClinicSettings();
  const { dict } = usePublicI18n();
  const credentials = dict.aboutDoctor.credentials.map((item, i) => ({
    ...item,
    icon: credentialIcons[i],
  }));

  return (
    <section id="about" className="mx-auto max-w-6xl px-4 py-20 sm:px-6">
      <div className="grid items-center gap-14 md:grid-cols-2">
        <motion.div
          initial={{ opacity: 0, x: 24 }}
          whileInView={{ opacity: 1, x: 0 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 0.6 }}
          className="relative mx-auto aspect-[4/5] w-full max-w-sm"
        >
          <div className="absolute inset-4 -z-10 rounded-[2.5rem] bg-turquoise/10" />
          <div className="absolute inset-0 flex items-center justify-center overflow-hidden rounded-[2.5rem] border border-border bg-gradient-to-b from-secondary to-card shadow-lg">
            {settings.doctorPhotoUrl ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={settings.doctorPhotoUrl}
                alt={settings.doctorName}
                className="size-full object-cover"
              />
            ) : (
              <span className="flex size-28 items-center justify-center rounded-full bg-primary/10 text-primary">
                <Stethoscope className="size-12" />
              </span>
            )}
          </div>
          <div className="absolute -bottom-6 end-6 flex items-center gap-3 rounded-2xl border border-border bg-card px-5 py-3 shadow-xl">
            <span className="flex size-9 items-center justify-center rounded-full bg-turquoise/15 text-turquoise-foreground">
              <ShieldCheck className="size-4" />
            </span>
            <div>
              <div className="text-sm font-bold">{dict.aboutDoctor.badgeTitle}</div>
              <div className="text-[11px] text-muted-foreground">{dict.aboutDoctor.badgeSubtitle}</div>
            </div>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, x: -24 }}
          whileInView={{ opacity: 1, x: 0 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 0.6, delay: 0.1 }}
        >
          <span className="text-sm font-semibold text-turquoise-foreground">
            {dict.aboutDoctor.eyebrow}
          </span>
          <h2 className="mt-2 text-3xl font-extrabold tracking-tight text-primary sm:text-4xl">
            {settings.doctorName}
          </h2>
          <p className="mt-1 text-sm font-medium text-muted-foreground">
            {settings.doctorTitle}
          </p>

          <p className="mt-5 leading-8 text-muted-foreground">
            {dict.aboutDoctor.bio}
          </p>

          <div className="mt-5 space-y-2 text-sm leading-7 text-muted-foreground">
            <p>{dict.aboutDoctor.mission}</p>
            <p>{dict.aboutDoctor.vision}</p>
          </div>

          <div className="mt-8 grid gap-4 sm:grid-cols-2">
            {credentials.map((item) => (
              <div
                key={item.title}
                className="flex items-start gap-3 rounded-2xl border border-border/70 bg-card p-4"
              >
                <span className="mt-0.5 flex size-9 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary">
                  <item.icon className="size-4" />
                </span>
                <div>
                  <p className="text-sm font-semibold leading-5">
                    {item.title}
                  </p>
                  <p className="mt-0.5 text-xs text-muted-foreground">
                    {item.subtitle}
                  </p>
                </div>
              </div>
            ))}
          </div>

          <div className="mt-6 flex flex-wrap items-center gap-2 text-sm">
            <span className="font-semibold text-foreground">{dict.aboutDoctor.valuesLabel}</span>
            {dict.aboutDoctor.values.map((value) => (
              <span
                key={value}
                className="rounded-full border border-border bg-card px-3 py-1 text-xs text-muted-foreground"
              >
                {value}
              </span>
            ))}
          </div>
        </motion.div>
      </div>
    </section>
  );
}
