"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { Check, ArrowRight } from "lucide-react";
import { TiltCard } from "../TiltCard";
import { getPlatformPricing, type PlatformPricing } from "@/lib/mock-data";
import { formatPKR } from "@/lib/utils";

const DEFAULT_PRICING: PlatformPricing = { perOrderFee: 15, monthlyFee: 7000, monthlyBreakEvenOrders: 467, customDomainFee: 4600 };

export function PricingTeaser() {
  const [pricing, setPricing] = useState<PlatformPricing>(DEFAULT_PRICING);

  useEffect(() => {
    getPlatformPricing().then(setPricing);
  }, []);

  const PLANS = [
    {
      name: "Pay Per Order",
      price: `${formatPKR(pricing.perOrderFee)}`,
      unit: "/ order",
      description: "Zero upfront cost — only pay when you actually sell.",
      perks: ["No monthly bill", "Customer covers the fee at checkout", "Best for new & untested businesses"],
      highlighted: false,
    },
    {
      name: "Monthly",
      price: formatPKR(pricing.monthlyFee),
      unit: "/ month",
      description: `Best once you're past ~${Math.ceil(pricing.monthlyFee / pricing.perOrderFee)} orders/month.`,
      perks: ["Unlimited orders", "Predictable flat cost", "No per-order fee shown to customers"],
      highlighted: true,
    },
  ];

  return (
    <section className="mx-auto max-w-7xl px-5 py-20 lg:px-8 lg:py-28">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: "-80px" }}
        transition={{ duration: 0.6 }}
        className="mx-auto max-w-2xl text-center"
      >
        <span className="text-xs font-semibold uppercase tracking-widest text-[var(--accent-violet)]">Pricing</span>
        <h2 className="font-display mt-3 text-3xl font-semibold tracking-tight text-[var(--text)] sm:text-4xl">
          Grow first. Pay only when you&apos;re growing.
        </h2>
      </motion.div>

      <div className="mx-auto mt-14 grid max-w-3xl grid-cols-1 gap-5 sm:grid-cols-2">
        {PLANS.map((plan, i) => (
          <motion.div
            key={plan.name}
            initial={{ opacity: 0, y: 24 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-60px" }}
            transition={{ duration: 0.5, delay: i * 0.1 }}
          >
            <TiltCard
              strength={5}
              className="h-full p-7"
              style={plan.highlighted ? { border: "1px solid rgba(139,107,255,0.4)" } : undefined}
            >
              {plan.highlighted && (
                <span className="mb-3 inline-block rounded-full bg-[rgba(139,107,255,0.14)] px-2.5 py-1 text-[0.65rem] font-semibold text-[var(--accent-violet)]">
                  Most predictable
                </span>
              )}
              <h3 className="font-display text-lg font-semibold text-[var(--text)]">{plan.name}</h3>
              <p className="mt-1 text-sm text-[var(--text-faint)]">{plan.description}</p>
              <p className="font-display mt-4 text-3xl font-bold text-[var(--text)]">
                {plan.price} <span className="text-sm font-normal text-[var(--text-faint)]">{plan.unit}</span>
              </p>
              <ul className="mt-5 space-y-2.5">
                {plan.perks.map((p) => (
                  <li key={p} className="flex items-center gap-2 text-sm text-[var(--text-muted)]">
                    <Check size={14} className="shrink-0 text-[var(--success)]" /> {p}
                  </li>
                ))}
              </ul>
            </TiltCard>
          </motion.div>
        ))}
      </div>

      <div className="mt-10 text-center">
        <Link href="/pricing" className="inline-flex items-center gap-1.5 text-sm font-semibold text-[var(--accent-violet)] hover:underline">
          Compare plans in detail <ArrowRight size={14} />
        </Link>
      </div>
    </section>
  );
}
