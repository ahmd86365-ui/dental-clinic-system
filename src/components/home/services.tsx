"use client";

import { motion } from "framer-motion";
import {
  Sparkles,
  SmilePlus,
  Syringe,
  Stethoscope,
  ShieldCheck,
  WandSparkles,
  type LucideIcon,
} from "lucide-react";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { useClinicSettings } from "@/components/clinic-settings-provider";
import { usePublicI18n } from "@/components/public-i18n-provider";

const serviceIcons: LucideIcon[] = [
  Sparkles,
  SmilePlus,
  Syringe,
  Stethoscope,
  ShieldCheck,
  WandSparkles,
];

export function Services() {
  const settings = useClinicSettings();
  const { dict } = usePublicI18n();
  const services = dict.services.items.map((item, i) => ({
    ...item,
    icon: serviceIcons[i],
  }));

  return (
    <section id="services" className="mx-auto max-w-6xl px-4 py-20 sm:px-6">
      <div className="mx-auto max-w-2xl text-center">
        <span className="text-sm font-semibold text-turquoise-foreground">
          {dict.services.eyebrow}
        </span>
        <h2 className="mt-2 text-3xl font-extrabold tracking-tight text-primary sm:text-4xl">
          {dict.services.heading}
        </h2>
        <p className="mt-4 text-muted-foreground">
          {dict.services.introBefore}{" "}
          {settings.doctorName}
        </p>
      </div>

      <div className="mt-14 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {services.map((service, i) => (
          <motion.div
            key={service.title}
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-80px" }}
            transition={{ duration: 0.5, delay: i * 0.06 }}
          >
            <Card className="h-full border-border/70 transition-all hover:-translate-y-1 hover:shadow-lg hover:shadow-primary/5">
              <CardHeader>
                <span
                  className={
                    i % 2 === 0
                      ? "flex size-11 items-center justify-center rounded-xl bg-primary/10 text-primary"
                      : "flex size-11 items-center justify-center rounded-xl bg-turquoise/15 text-turquoise-foreground"
                  }
                >
                  <service.icon className="size-5" />
                </span>
                <CardTitle className="mt-3 text-lg">{service.title}</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm leading-6 text-muted-foreground">
                  {service.description}
                </p>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>
    </section>
  );
}
