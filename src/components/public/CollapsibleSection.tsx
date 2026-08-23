"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { ChevronDown } from "lucide-react";

/**
 * Mobile-only collapse: on phones the full section starts hidden behind a
 * single toggle button so the page doesn't feel like one long unbroken
 * scroll of cards -- same pattern as vendor-storefronts's WhyChooseUs/Story/FAQ
 * sections. On lg+ (desktop) the content is always shown, no toggle at all,
 * since congestion is a small-viewport problem only.
 */
export function CollapsibleSection({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  const [open, setOpen] = useState(false);

  return (
    <>
      <div className="lg:hidden">
        {!open ? (
          <motion.button
            initial={{ opacity: 0, y: 12 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-40px" }}
            transition={{ duration: 0.4 }}
            onClick={() => setOpen(true)}
            className="mx-auto flex items-center gap-2 rounded-full border border-[var(--border-strong)] bg-[var(--surface)] px-5 py-3 text-sm font-semibold text-[var(--text)]"
          >
            {label} <ChevronDown size={15} />
          </motion.button>
        ) : (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            transition={{ duration: 0.4, ease: "easeOut" }}
            className="overflow-hidden"
          >
            {children}
          </motion.div>
        )}
      </div>

      <div className="hidden lg:block">{children}</div>
    </>
  );
}
