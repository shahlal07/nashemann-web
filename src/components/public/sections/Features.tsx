"use client";

import { motion } from "framer-motion";
import { TiltCard } from "../TiltCard";
import { Icon } from "../Icon";
import { CollapsibleSection } from "../CollapsibleSection";
import { useSiteContent } from "@/lib/site-content";

function FeatureGrid() {
  const FEATURES = useSiteContent("features");
  return (
    <div className="mt-8 grid grid-cols-1 gap-5 sm:grid-cols-2 lg:mt-14 lg:grid-cols-3">
      {FEATURES.map((f, i) => (
        <motion.div
          key={f.title}
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-60px" }}
          transition={{ duration: 0.5, delay: (i % 3) * 0.1 }}
        >
          <TiltCard className="group h-full p-6" strength={7}>
            <div
              className="flex h-11 w-11 items-center justify-center rounded-xl"
              style={{ background: "var(--accent-gradient-soft)" }}
            >
              <Icon name={f.icon} size={20} className="text-[var(--accent-violet)]" />
            </div>
            <h3 className="font-display mt-4 text-base font-semibold text-[var(--text)]">{f.title}</h3>
            <p className="mt-1.5 text-sm leading-relaxed text-[var(--text-muted)]">{f.description}</p>
          </TiltCard>
        </motion.div>
      ))}
    </div>
  );
}

export function Features() {
  return (
    <section id="features" className="border-y border-[var(--border)] bg-[var(--surface-elevated)]/40 py-14 lg:py-28">
      <div className="mx-auto max-w-7xl px-5 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-80px" }}
          transition={{ duration: 0.6 }}
          className="mx-auto max-w-2xl text-center"
        >
          <span className="text-xs font-semibold uppercase tracking-widest text-[var(--accent-violet)]">Everything included</span>
          <h2 className="font-display mt-3 text-2xl font-semibold tracking-tight text-[var(--text)] sm:text-3xl lg:text-4xl">
            Real infrastructure, not a website builder.
          </h2>
          <p className="mt-3 text-sm text-[var(--text-muted)] lg:mt-4 lg:text-base">
            The same tooling running TheAamGhar&apos;s real, live business — branding, orders, inventory, revenue, and support — available to your store from day one.
          </p>
        </motion.div>

        <div className="mt-8 lg:mt-0">
          <CollapsibleSection label="See everything included">
            <FeatureGrid />
          </CollapsibleSection>
        </div>
      </div>
    </section>
  );
}
