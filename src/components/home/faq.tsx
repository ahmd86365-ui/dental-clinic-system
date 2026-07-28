"use client";

import { motion } from "framer-motion";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { usePublicI18n } from "@/components/public-i18n-provider";

export function Faq() {
  const { dict } = usePublicI18n();
  const faqs = dict.faq.items;

  return (
    <section id="faq" className="mx-auto max-w-4xl px-4 py-20 sm:px-6">
      <div className="mx-auto max-w-2xl text-center">
        <span className="text-sm font-semibold text-turquoise-foreground">
          {dict.faq.eyebrow}
        </span>
        <h2 className="mt-2 text-3xl font-extrabold tracking-tight text-primary sm:text-4xl">
          {dict.faq.heading}
        </h2>
        <p className="mt-4 text-muted-foreground">
          {dict.faq.intro}
        </p>
      </div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: "-80px" }}
        transition={{ duration: 0.5 }}
        className="mt-12 rounded-3xl border border-border/70 bg-card px-6 py-2 sm:px-8"
      >
        <Accordion>
          {faqs.map((item, i) => (
            <AccordionItem key={item.question} value={`item-${i}`}>
              <AccordionTrigger className="py-5 text-base">
                {item.question}
              </AccordionTrigger>
              <AccordionContent className="text-muted-foreground">
                {item.answer}
              </AccordionContent>
            </AccordionItem>
          ))}
        </Accordion>
      </motion.div>
    </section>
  );
}
