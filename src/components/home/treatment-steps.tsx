"use client";

import { motion } from "framer-motion";
import { ClipboardList, MessageCircleHeart, Sparkles, Stethoscope } from "lucide-react";
import { usePublicI18n } from "@/components/public-i18n-provider";

const stepIcons = [MessageCircleHeart, ClipboardList, Stethoscope, Sparkles];

export function TreatmentSteps() {
  const { dict } = usePublicI18n();
  const steps = dict.treatmentSteps.steps.map((item, i) => ({
    ...item,
    icon: stepIcons[i],
  }));

  return (
    <section className="mx-auto max-w-6xl px-4 py-20 sm:px-6">
      <div className="mx-auto max-w-2xl text-center">
        <span className="text-sm font-semibold text-turquoise-foreground">
          {dict.treatmentSteps.eyebrow}
        </span>
        <h2 className="mt-2 text-3xl font-extrabold tracking-tight text-primary sm:text-4xl">
          {dict.treatmentSteps.heading}
        </h2>
        <p className="mt-4 text-muted-foreground">
          {dict.treatmentSteps.intro}
        </p>
      </div>

      <div className="relative mt-16 grid gap-10 sm:grid-cols-2 lg:grid-cols-4">
        <div className="absolute inset-x-0 top-7 hidden h-px bg-border lg:block" />

        {steps.map((step, i) => (
          <motion.div
            key={step.title}
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-80px" }}
            transition={{ duration: 0.5, delay: i * 0.1 }}
            className="relative text-center"
          >
            <div className="relative z-10 mx-auto flex size-14 items-center justify-center rounded-2xl bg-card text-primary shadow-md ring-1 ring-border">
              <step.icon className="size-6" />
              <span className="absolute -top-2 -end-2 flex size-6 items-center justify-center rounded-full bg-turquoise text-[11px] font-bold text-turquoise-foreground">
                {i + 1}
              </span>
            </div>
            <h3 className="mt-5 font-semibold">{step.title}</h3>
            <p className="mt-2 text-sm leading-6 text-muted-foreground">
              {step.description}
            </p>
          </motion.div>
        ))}
      </div>
    </section>
  );
}
