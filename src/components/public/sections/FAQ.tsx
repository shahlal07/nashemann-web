"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { HelpCircle } from "lucide-react";
import { CollapsibleSection } from "../CollapsibleSection";
import { getPlatformPricing, type PlatformPricing } from "@/lib/mock-data";
import { buildFaqs, DEFAULT_FAQ_PRICING } from "@/lib/faq-content";

function FaqList() {
  const [pricing, setPricing] = useState<PlatformPricing>(DEFAULT_FAQ_PRICING);

  useEffect(() => {
    getPlatformPricing().then(setPricing).catch(() => {});
  }, []);

  const faqs = buildFaqs(pricing);

  return (
    <div className="mt-8 space-y-3 lg:mt-14">
      {faqs.map((f, i) => (
        <motion.div
          key={f.q}
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-60px" }}
          transition={{ duration: 0.4, delay: i * 0.06 }}
          className="glass-panel rounded-[var(--radius-md)] p-5"
        >
          <p className="flex items-start gap-2 text-sm font-semibold text-[var(--text)]">
            <HelpCircle size={15} className="mt-0.5 shrink-0 text-[var(--accent-violet)]" /> {f.q}
          </p>
          <p className="mt-2 pl-[1.6rem] text-sm text-[var(--text-muted)]">{f.a}</p>
        </motion.div>
      ))}
    </div>
  );
}

export function FAQ() {
  return (
    <section id="faq" className="mx-auto max-w-3xl px-5 py-14 lg:px-8 lg:py-24">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: "-80px" }}
        transition={{ duration: 0.6 }}
        className="text-center"
      >
        <span className="text-xs font-semibold uppercase tracking-widest text-[var(--accent-violet)]">FAQ</span>
        <h2 className="font-display mt-3 text-2xl font-semibold tracking-tight text-[var(--text)] sm:text-3xl lg:text-4xl">
          Questions, answered honestly.
        </h2>
      </motion.div>

      <CollapsibleSection label="See frequently asked questions">
        <FaqList />
      </CollapsibleSection>
    </section>
  );
}
