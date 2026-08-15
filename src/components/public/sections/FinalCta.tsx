"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { ArrowRight } from "lucide-react";
import { FloatingShapes } from "../FloatingShapes";

export function FinalCta() {
  return (
    <section className="relative mx-auto max-w-7xl overflow-hidden px-5 py-20 lg:px-8 lg:py-28">
      <div className="relative overflow-hidden rounded-[2rem] border border-[var(--border-strong)] px-6 py-16 text-center sm:px-12">
        <div className="absolute inset-0 -z-10" style={{ background: "var(--accent-gradient-soft)" }} />
        <FloatingShapes />
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-80px" }}
          transition={{ duration: 0.6 }}
        >
          <h2 className="font-display mx-auto max-w-2xl text-3xl font-semibold tracking-tight text-[var(--text)] sm:text-4xl">
            Your shop deserves a real home online.
          </h2>
          <p className="mx-auto mt-4 max-w-lg text-[var(--text-muted)]">
            Free to apply, live in days, and you only pay once a customer actually orders.
          </p>
          <Link href="/apply">
            <motion.span
              whileHover={{ scale: 1.04, y: -2 }}
              whileTap={{ scale: 0.97 }}
              className="mt-8 inline-flex items-center gap-2 rounded-full px-7 py-3.5 text-sm font-semibold text-black shadow-[var(--shadow-glow-violet)]"
              style={{ background: "var(--accent-gradient)" }}
            >
              Apply for your store <ArrowRight size={16} />
            </motion.span>
          </Link>
        </motion.div>
      </div>
    </section>
  );
}
