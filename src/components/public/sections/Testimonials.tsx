"use client";

import { motion } from "framer-motion";
import { Quote } from "lucide-react";
import { TiltCard } from "../TiltCard";
import { CollapsibleSection } from "../CollapsibleSection";
import { useSiteContent } from "@/lib/site-content";

function TestimonialGrid() {
  const TESTIMONIALS = useSiteContent("testimonials");
  return (
    <div className="mt-8 grid grid-cols-1 gap-5 lg:mt-14 lg:grid-cols-3">
      {TESTIMONIALS.map((t, i) => (
        <motion.div
          key={t.name}
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-60px" }}
          transition={{ duration: 0.5, delay: i * 0.1 }}
        >
          <TiltCard strength={5} className="h-full p-6">
            <Quote size={22} className="text-[var(--accent-violet)] opacity-60" />
            <p className="mt-3 text-sm leading-relaxed text-[var(--text-muted)]">&ldquo;{t.quote}&rdquo;</p>
            <div className="mt-5 flex items-center gap-3 border-t border-[var(--border)] pt-4">
              <span className="text-2xl">{t.emoji}</span>
              <div>
                <p className="text-sm font-semibold text-[var(--text)]">{t.name}</p>
                <p className="text-xs text-[var(--text-faint)]">{t.business}</p>
              </div>
            </div>
          </TiltCard>
        </motion.div>
      ))}
    </div>
  );
}

export function Testimonials() {
  return (
    <section className="border-y border-[var(--border)] bg-[var(--surface-elevated)]/40 py-14 lg:py-28">
      <div className="mx-auto max-w-7xl px-5 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-80px" }}
          transition={{ duration: 0.6 }}
          className="mx-auto max-w-2xl text-center"
        >
          <span className="text-xs font-semibold uppercase tracking-widest text-[var(--accent-violet)]">Real vendors</span>
          <h2 className="font-display mt-3 text-2xl font-semibold tracking-tight text-[var(--text)] sm:text-3xl lg:text-4xl">
            Small businesses, real results.
          </h2>
        </motion.div>

        <div className="mt-8 lg:mt-0">
          <CollapsibleSection label="Read what vendors say">
            <TestimonialGrid />
          </CollapsibleSection>
        </div>
      </div>
    </section>
  );
}
