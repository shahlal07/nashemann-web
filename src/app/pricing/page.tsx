"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import Link from "next/link";
import { Check, ArrowRight, HelpCircle } from "lucide-react";
import { TiltCard } from "@/components/public/TiltCard";
import { getPlatformPricing, type PlatformPricing } from "@/lib/mock-data";
import { formatPKR } from "@/lib/utils";

const DEFAULT_PRICING: PlatformPricing = { perOrderFee: 15, monthlyFee: 7000, monthlyBreakEvenOrders: 467, customDomainFee: 4600 };

const FAQS = [
  { q: "Is there really no upfront cost?", a: "Correct — on the Pay Per Order plan, you owe nothing until a customer actually completes an order. The Rs 15 fee is charged to the customer, not deducted from your revenue." },
  { q: "Can I switch plans later?", a: "Yes, anytime from your admin panel's Billing tab — no penalty, effective on your next billing cycle." },
  { q: "What happens if I go over 467 orders/month on Pay Per Order?", a: "Nothing changes automatically — you'll just start paying more in per-order fees than the Monthly plan would cost. We'll flag it so you can switch if it makes sense." },
  { q: "Do you take a cut of my product prices?", a: "No. The platform fee is separate from your pricing — you set your own product prices and keep 100% of that revenue." },
];

export function fadeUpProps(delay = 0) {
  return {
    initial: { opacity: 0, y: 20 },
    whileInView: { opacity: 1, y: 0 },
    viewport: { once: true, margin: "-60px" },
    transition: { duration: 0.5, delay },
  };
}

export default function PricingPage() {
  const [pricing, setPricing] = useState<PlatformPricing>(DEFAULT_PRICING);

  useEffect(() => {
    getPlatformPricing().then(setPricing);
  }, []);

  const PLANS = [
    {
      name: "Pay Per Order",
      price: formatPKR(pricing.perOrderFee),
      unit: "per order",
      description: "For businesses testing the waters — no risk, no commitment.",
      perks: [
        "No signup fee, no monthly bill",
        "Customer pays the platform fee at checkout",
        "Full storefront, admin panel, and support included",
        "Switch to Monthly anytime once you're ready",
      ],
      highlighted: false,
    },
    {
      name: "Monthly",
      price: formatPKR(pricing.monthlyFee),
      unit: "per month",
      description: `Flat cost, unlimited orders — the better deal past ~${Math.ceil(pricing.monthlyFee / pricing.perOrderFee)} orders/month.`,
      perks: [
        "Unlimited orders, one predictable bill",
        "No per-order fee shown to your customers",
        "Priority support",
        "Everything in Pay Per Order",
      ],
      highlighted: true,
    },
  ];

  const ADDONS = [
    { name: "Custom domain", price: formatPKR(pricing.customDomainFee), note: "One-time — yourstore.pk instead of yourstore.nashemann.com" },
  ];

  return (
    <div className="mx-auto max-w-7xl px-5 py-16 lg:px-8 lg:py-24">
      <motion.div {...fadeUpProps()} className="mx-auto max-w-2xl text-center">
        <h1 className="font-display text-4xl font-semibold tracking-tight text-[var(--text)] sm:text-5xl">
          Simple, honest <span className="accent-text">pricing</span>.
        </h1>
        <p className="mt-4 text-lg text-[var(--text-muted)]">
          Two ways to pay. No hidden fees, no long-term contract, no surprise invoice.
        </p>
      </motion.div>

      <div className="mx-auto mt-14 grid max-w-3xl grid-cols-1 gap-6 sm:grid-cols-2">
        {PLANS.map((plan, i) => (
          <motion.div key={plan.name} {...fadeUpProps(i * 0.1)}>
            <TiltCard
              strength={5}
              className="h-full p-8"
              style={plan.highlighted ? { border: "1px solid rgba(139,107,255,0.4)" } : undefined}
            >
              {plan.highlighted && (
                <span className="mb-3 inline-block rounded-full bg-[rgba(139,107,255,0.14)] px-2.5 py-1 text-[0.65rem] font-semibold text-[var(--accent-violet)]">
                  Most predictable
                </span>
              )}
              <h2 className="font-display text-xl font-semibold text-[var(--text)]">{plan.name}</h2>
              <p className="mt-1.5 text-sm text-[var(--text-faint)]">{plan.description}</p>
              <p className="font-display mt-5 text-4xl font-bold text-[var(--text)]">
                {plan.price} <span className="text-sm font-normal text-[var(--text-faint)]">{plan.unit}</span>
              </p>
              <ul className="mt-6 space-y-3">
                {plan.perks.map((p) => (
                  <li key={p} className="flex items-start gap-2 text-sm text-[var(--text-muted)]">
                    <Check size={15} className="mt-0.5 shrink-0 text-[var(--success)]" /> {p}
                  </li>
                ))}
              </ul>
              <Link
                href="/apply"
                className="mt-7 inline-flex w-full items-center justify-center gap-1.5 rounded-full py-3 text-sm font-semibold text-black"
                style={{ background: "var(--accent-gradient)" }}
              >
                Apply with this plan <ArrowRight size={14} />
              </Link>
            </TiltCard>
          </motion.div>
        ))}
      </div>

      <motion.div {...fadeUpProps(0.2)} className="mx-auto mt-8 max-w-3xl">
        {ADDONS.map((a) => (
          <div key={a.name} className="glass-panel flex items-center justify-between rounded-[var(--radius-lg)] p-5">
            <div>
              <p className="text-sm font-semibold text-[var(--text)]">{a.name}</p>
              <p className="text-xs text-[var(--text-faint)]">{a.note}</p>
            </div>
            <p className="font-display text-lg font-semibold text-[var(--text)]">{a.price}</p>
          </div>
        ))}
      </motion.div>

      <div className="mx-auto mt-24 max-w-2xl">
        <motion.h2 {...fadeUpProps()} className="font-display text-center text-2xl font-semibold text-[var(--text)]">
          Questions, answered
        </motion.h2>
        <div className="mt-8 space-y-3">
          {FAQS.map((f, i) => (
            <motion.div key={f.q} {...fadeUpProps(i * 0.06)} className="glass-panel rounded-[var(--radius-md)] p-5">
              <p className="flex items-start gap-2 text-sm font-semibold text-[var(--text)]">
                <HelpCircle size={15} className="mt-0.5 shrink-0 text-[var(--accent-violet)]" /> {f.q}
              </p>
              <p className="mt-2 pl-[1.6rem] text-sm text-[var(--text-muted)]">{f.a}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  );
}
