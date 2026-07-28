"use client";

import { motion } from "framer-motion";
import { Award, Clock, HeartHandshake, Users } from "lucide-react";
import { useClinicSettings } from "@/components/clinic-settings-provider";
import { usePublicI18n } from "@/components/public-i18n-provider";

const reasonIcons = [Award, HeartHandshake, Clock, Users];

export function WhyUs() {
  const settings = useClinicSettings();
  const { dict } = usePublicI18n();
  const reasons = dict.whyUs.reasons.map((item, i) => ({
    ...item,
    icon: reasonIcons[i],
  }));

  return (
    <section id="why-us" className="relative overflow-hidden bg-primary py-20 text-primary-foreground">
      <div className="pointer-events-none absolute inset-0 -z-10 bg-[radial-gradient(circle_at_100%_0%,color-mix(in_oklch,var(--turquoise),transparent_80%),transparent_55%)]" />

      <div className="mx-auto max-w-6xl px-4 sm:px-6">
        <div className="mx-auto max-w-2xl text-center">
          <span className="text-sm font-semibold text-turquoise">
            {dict.whyUs.eyebrow}
          </span>
          <h2 className="mt-2 text-3xl font-extrabold tracking-tight sm:text-4xl">
            {dict.whyUs.headingBefore} {settings.clinicName}{dict.whyUs.headingAfter}
          </h2>
          <p className="mt-4 text-primary-foreground/75">
            {dict.whyUs.intro}
          </p>
        </div>

        <div className="mt-14 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {reasons.map((reason, i) => (
            <motion.div
              key={reason.title}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-80px" }}
              transition={{ duration: 0.5, delay: i * 0.08 }}
              className="rounded-2xl border border-white/10 bg-white/5 p-6 text-center backdrop-blur-sm"
            >
              <span className="mx-auto flex size-12 items-center justify-center rounded-full bg-turquoise/20 text-turquoise">
                <reason.icon className="size-6" />
              </span>
              <h3 className="mt-4 font-semibold">{reason.title}</h3>
              <p className="mt-2 text-sm leading-6 text-primary-foreground/70">
                {reason.description}
              </p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
