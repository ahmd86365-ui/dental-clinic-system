"use client";

import { motion } from "framer-motion";
import { Clock, Mail, MapPin, MessageCircle, Phone } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useClinicSettings } from "@/components/clinic-settings-provider";
import { usePublicI18n } from "@/components/public-i18n-provider";
import { formatWorkingHoursSummary } from "@/lib/working-hours";

export function Contact() {
  const settings = useClinicSettings();
  const { dict, locale } = usePublicI18n();

  const details = [
    { icon: Phone, label: dict.contact.labels.phone, value: settings.phone },
    { icon: Mail, label: dict.contact.labels.email, value: settings.email },
    { icon: MapPin, label: dict.contact.labels.address, value: settings.address },
    {
      icon: Clock,
      label: dict.contact.labels.hours,
      value: formatWorkingHoursSummary(settings.workingHours, locale),
    },
  ];

  return (
    <section id="contact" className="mx-auto max-w-6xl px-4 py-20 sm:px-6">
      <div className="mx-auto max-w-2xl text-center">
        <span className="text-sm font-semibold text-turquoise-foreground">
          {dict.contact.eyebrow}
        </span>
        <h2 className="mt-2 text-3xl font-extrabold tracking-tight text-primary sm:text-4xl">
          {dict.contact.heading}
        </h2>
        <p className="mt-4 text-muted-foreground">
          {dict.contact.intro}
        </p>
      </div>

      <div className="mt-14 grid gap-6 lg:grid-cols-2">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-80px" }}
          transition={{ duration: 0.5 }}
          className="grid gap-4 sm:grid-cols-2"
        >
          {details.map((item) => (
            <div
              key={item.label}
              className="rounded-2xl border border-border/70 bg-card p-5"
            >
              <span className="flex size-10 items-center justify-center rounded-xl bg-primary/10 text-primary">
                <item.icon className="size-5" />
              </span>
              <div className="mt-3 text-xs text-muted-foreground">
                {item.label}
              </div>
              <div className="mt-1 text-sm font-semibold">{item.value}</div>
            </div>
          ))}
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-80px" }}
          transition={{ duration: 0.5, delay: 0.1 }}
          className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-primary to-primary/85 p-8 text-primary-foreground"
        >
          <div className="pointer-events-none absolute -start-10 -top-10 size-40 rounded-full bg-turquoise/20 blur-2xl" />
          <h3 className="text-xl font-bold">{dict.contact.ctaTitle}</h3>
          <p className="mt-3 text-sm leading-7 text-primary-foreground/75">
            {dict.contact.ctaText}
          </p>

          <div className="mt-8 flex flex-wrap gap-3">
            <Button
              size="lg"
              variant="secondary"
              render={<a href={`tel:${settings.phone.replace(/\s/g, "")}`} />}
              nativeButton={false}
              className="gap-2"
            >
              <Phone className="size-4" />
              {dict.contact.callNow}
            </Button>
            <Button
              size="lg"
              variant="outline"
              className="gap-2 border-primary-foreground/30 bg-transparent text-primary-foreground hover:bg-primary-foreground/10"
              render={
                <a
                  href={`https://wa.me/${settings.whatsapp.replace(/\D/g, "")}`}
                  target="_blank"
                  rel="noopener noreferrer"
                />
              }
              nativeButton={false}
            >
              <MessageCircle className="size-4" />
              {dict.contact.whatsapp}
            </Button>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
