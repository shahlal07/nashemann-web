"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { ArrowRight, Eye, LayoutDashboard } from "lucide-react";
import { TiltCard } from "../TiltCard";
import { StatCounter } from "../StatCounter";

export function RevenuePreview() {
  return (
    <section className="mx-auto max-w-7xl px-5 py-20 lg:px-8 lg:py-28">
      <div className="grid grid-cols-1 items-center gap-12 lg:grid-cols-2">
        <motion.div
          initial={{ opacity: 0, x: -24 }}
          whileInView={{ opacity: 1, x: 0 }}
          viewport={{ once: true, margin: "-80px" }}
          transition={{ duration: 0.6 }}
        >
          <span className="text-xs font-semibold uppercase tracking-widest text-[var(--accent-amber)]">Full transparency</span>
          <h2 className="font-display mt-3 text-3xl font-semibold tracking-tight text-[var(--text)] sm:text-4xl">
            Watch your revenue move — in real time.
          </h2>
          <p className="mt-4 text-[var(--text-muted)]">
            No waiting for a monthly statement, no guessing. Every order updates your numbers instantly — in your own
            store&apos;s admin panel, or right here on your Nashemann vendor account.
          </p>

          <div className="mt-7 space-y-3">
            <div className="flex items-start gap-3">
              <div className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-[rgba(139,107,255,0.14)] text-[var(--accent-violet)]">
                <LayoutDashboard size={15} />
              </div>
              <div>
                <p className="text-sm font-semibold text-[var(--text)]">Your own admin panel</p>
                <p className="text-sm text-[var(--text-faint)]">Full breakdown — orders, profit, best-sellers, customers.</p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <div className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-[rgba(255,176,32,0.14)] text-[var(--accent-amber)]">
                <Eye size={15} />
              </div>
              <div>
                <p className="text-sm font-semibold text-[var(--text)]">Right here on Nashemann</p>
                <p className="text-sm text-[var(--text-faint)]">A quick-glance revenue view — no separate login needed.</p>
              </div>
            </div>
          </div>

          <Link
            href="/revenue"
            className="mt-7 inline-flex items-center gap-1.5 text-sm font-semibold text-[var(--accent-violet)] hover:underline"
          >
            See your store&apos;s revenue <ArrowRight size={14} />
          </Link>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, x: 24 }}
          whileInView={{ opacity: 1, x: 0 }}
          viewport={{ once: true, margin: "-80px" }}
          transition={{ duration: 0.6, delay: 0.1 }}
        >
          <TiltCard strength={6} className="p-6">
            <p className="text-xs font-medium text-[var(--text-faint)]">Sabz Basket · This month</p>
            <p className="font-display mt-1 text-4xl font-bold text-[var(--text)]">
              Rs <StatCounter value={112800} />
            </p>
            <p className="mt-1 text-xs text-[var(--success)]">↑ 18% vs last month</p>
            <div className="mt-5 grid grid-cols-3 gap-3 border-t border-[var(--border)] pt-5">
              <div>
                <p className="text-[0.65rem] text-[var(--text-faint)]">Orders</p>
                <p className="mt-0.5 text-sm font-semibold text-[var(--text)]">38</p>
              </div>
              <div>
                <p className="text-[0.65rem] text-[var(--text-faint)]">Avg. order</p>
                <p className="mt-0.5 text-sm font-semibold text-[var(--text)]">Rs 2,968</p>
              </div>
              <div>
                <p className="text-[0.65rem] text-[var(--text-faint)]">Platform fee</p>
                <p className="mt-0.5 text-sm font-semibold text-[var(--text)]">Rs 570</p>
              </div>
            </div>
          </TiltCard>
        </motion.div>
      </div>
    </section>
  );
}
