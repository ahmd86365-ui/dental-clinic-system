"use client";

import { motion } from "framer-motion";
import { Quote, Star } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { usePublicI18n } from "@/components/public-i18n-provider";

export function Testimonials() {
  const { dict } = usePublicI18n();
  const testimonials = dict.testimonials.items;

  return (
    <section className="mx-auto max-w-6xl px-4 py-20 sm:px-6">
      <div className="mx-auto max-w-2xl text-center">
        <span className="text-sm font-semibold text-turquoise-foreground">
          {dict.testimonials.eyebrow}
        </span>
        <h2 className="mt-2 text-3xl font-extrabold tracking-tight text-primary sm:text-4xl">
          {dict.testimonials.heading}
        </h2>
        <p className="mt-4 text-muted-foreground">
          {dict.testimonials.intro}
        </p>
      </div>

      {testimonials.length > 0 ? (
        <div className="mt-14 grid gap-6 lg:grid-cols-3">
          {testimonials.map((item, i) => (
            <motion.div
              key={item.name}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-80px" }}
              transition={{ duration: 0.5, delay: i * 0.08 }}
            >
              <Card className="h-full border-border/70">
                <CardContent className="flex h-full flex-col">
                  <Quote className="size-8 text-turquoise" />
                  <p className="mt-4 flex-1 text-sm leading-7 text-muted-foreground">
                    {item.quote}
                  </p>
                  <div className="mt-6 flex items-center justify-between border-t border-border/70 pt-4">
                    <div>
                      <p className="text-sm font-semibold">{item.name}</p>
                      <p className="text-xs text-muted-foreground">
                        {item.service}
                      </p>
                    </div>
                    <div className="flex gap-0.5 text-turquoise">
                      {Array.from({ length: 5 }).map((_, starIdx) => (
                        <Star key={starIdx} className="size-3.5 fill-current" />
                      ))}
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>
      ) : (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-80px" }}
          transition={{ duration: 0.5 }}
          className="mx-auto mt-14 max-w-xl rounded-2xl border border-dashed border-border/70 bg-card/50 px-6 py-10 text-center"
        >
          <Quote className="mx-auto size-8 text-turquoise" />
          <p className="mt-4 text-sm leading-7 text-muted-foreground">
            {dict.testimonials.placeholder}
          </p>
        </motion.div>
      )}
    </section>
  );
}
