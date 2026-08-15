"use client";

import { motion } from "framer-motion";
import { Icon } from "../Icon";
import { CollapsibleSection } from "../CollapsibleSection";
import { useSiteContent } from "@/lib/site-content";

function Steps() {
  const HOW_IT_WORKS = useSiteContent("how_it_works");
  return (
    <div className="relative mt-8 grid grid-cols-1 gap-8 sm:grid-cols-2 lg:mt-16 lg:grid-cols-4 lg:gap-6">
      <div className="absolute left-0 right-0 top-[52px] hidden h-px bg-gradient-to-r from-transparent via-[var(--border-strong)] to-transparent lg:block" />
      {HOW_IT_WORKS.map((step, i) => (
        <motion.div
          key={step.title}
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-60px" }}
          transition={{ duration: 0.5, delay: i * 0.12 }}
          className="relative"
        >
          <div
            className="relative z-10 mx-auto flex h-14 w-14 items-center justify-center rounded-2xl text-black"
            style={{ background: "var(--accent-gradient)" }}
          >
            <Icon name={step.icon} size={22} />
            <span className="absolute -right-1.5 -top-1.5 flex h-6 w-6 items-center justify-center rounded-full border-2 border-[var(--bg)] bg-[var(--surface-elevated)] text-[0.65rem] font-bold text-[var(--text)]">
              {i + 1}
            </span>
          </div>
          <h3 className="font-display mt-4 text-center text-base font-semibold text-[var(--text)]">{step.title}</h3>
          <p className="mt-1.5 text-center text-sm text-[var(--text-muted)]">{step.description}</p>
        </motion.div>
      ))}
    </div>
  );
}

export function HowItWorks() {
  return (
    <section id="how-it-works" className="mx-auto max-w-7xl px-5 py-14 lg:px-8 lg:py-28">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: "-80px" }}
        transition={{ duration: 0.6 }}
        className="mx-auto max-w-2xl text-center"
      >
        <span className="text-xs font-semibold uppercase tracking-widest text-[var(--accent-violet)]">How it works</span>
        <h2 className="font-display mt-3 text-2xl font-semibold tracking-tight text-[var(--text)] sm:text-3xl lg:text-4xl">
          From application to your first order — days, not months.
        </h2>
      </motion.div>

      <div className="mt-8 lg:mt-0">
        <CollapsibleSection label="See how it works">
          <Steps />
        </CollapsibleSection>
      </div>
    </section>
  );
}
