"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { ArrowRight, Gift, Users } from "lucide-react";
import { TiltCard } from "../TiltCard";
import { useSiteContent } from "@/lib/site-content";
import { formatPKR } from "@/lib/utils";

export function RewardsTeaser() {
  const REWARDS_CONTENT = useSiteContent("rewards");
  return (
    <section className="mx-auto max-w-7xl px-5 py-20 lg:px-8 lg:py-28">
      <TiltCard strength={4} glare={false} className="overflow-hidden p-8 sm:p-12">
        <div
          className="pointer-events-none absolute -right-20 -top-20 h-72 w-72 rounded-full opacity-20 blur-3xl"
          style={{ background: "var(--accent-gradient)" }}
        />
        <div className="relative grid grid-cols-1 items-center gap-10 lg:grid-cols-2">
          <motion.div initial={{ opacity: 0, y: 16 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.5 }}>
            <span className="inline-flex items-center gap-1.5 rounded-full bg-[rgba(255,176,32,0.14)] px-3 py-1 text-xs font-semibold text-[var(--accent-amber)]">
              <Gift size={13} /> {REWARDS_CONTENT.headline}
            </span>
            <h2 className="font-display mt-4 text-2xl font-semibold tracking-tight text-[var(--text)] sm:text-3xl">
              {REWARDS_CONTENT.referral.headline}
            </h2>
            <p className="mt-3 max-w-md text-[var(--text-muted)]">{REWARDS_CONTENT.referral.description}</p>
            <Link href="/rewards" className="mt-6 inline-flex items-center gap-1.5 text-sm font-semibold text-[var(--accent-violet)] hover:underline">
              See rewards & referral tiers <ArrowRight size={14} />
            </Link>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, scale: 0.94 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="rounded-[var(--radius-lg)] border border-[var(--border)] bg-[var(--surface-solid)] p-6"
          >
            <div className="flex items-center justify-between">
              <span className="flex items-center gap-1.5 text-xs text-[var(--text-faint)]">
                <Users size={13} /> Your referral code
              </span>
            </div>
            <p className="font-display mt-2 text-xl font-bold tracking-wider text-[var(--text)]">
              {REWARDS_CONTENT.referral.yourCode}
            </p>
            <div className="mt-4 rounded-lg bg-[rgba(52,211,153,0.1)] px-3 py-2.5 text-sm font-semibold text-[var(--success)]">
              +{formatPKR(REWARDS_CONTENT.referral.reward)} credit per successful referral
            </div>
          </motion.div>
        </div>
      </TiltCard>
    </section>
  );
}
