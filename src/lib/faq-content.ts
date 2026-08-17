import type { PlatformPricing } from "@/lib/mock-data";
import { formatPKR } from "@/lib/utils";

export const DEFAULT_FAQ_PRICING: PlatformPricing = {
  perOrderFee: 15,
  monthlyFee: 7000,
  monthlyBreakEvenOrders: 467,
  customDomainFee: 4600,
};

export function buildFaqs(pricing: PlatformPricing) {
  return [
    {
      q: "Is there really no upfront cost to start?",
      a: `Correct — on the Pay Per Order plan you owe nothing until a customer actually completes an order. The ${formatPKR(pricing.perOrderFee)} fee is charged per order, not deducted from a signup or setup cost.`,
    },
    {
      q: "How long does it take to get my store live?",
      a: "Most applications are reviewed within 24 hours. Once approved, your branded storefront is seeded and ready — usually within a couple of days of your first product going in.",
    },
    {
      q: "Do you take a cut of my product prices?",
      a: "No. The platform fee is separate from your pricing — you set your own product prices and keep 100% of that revenue.",
    },
    {
      q: "What's the difference between Pay Per Order and Monthly?",
      a: `Pay Per Order costs ${formatPKR(pricing.perOrderFee)} per order with zero upfront cost — best while you're testing. Monthly is a flat ${formatPKR(pricing.monthlyFee)}/month with unlimited orders, which works out cheaper past roughly ${pricing.monthlyBreakEvenOrders} orders a month. You can switch anytime.`,
    },
    {
      q: "Can I use my own domain instead of a Nashemann subdomain?",
      a: `Yes — a custom domain (e.g. yourstore.pk instead of yourstore.nashemann.store) is a one-time ${formatPKR(pricing.customDomainFee)} add-on, connected from your admin panel.`,
    },
    {
      q: "I currently sell over WhatsApp or Instagram DMs — can I still apply?",
      a: "Absolutely — that's exactly who Nashemann is built for. You keep taking orders however you like while you get set up; there's no penalty for switching over gradually.",
    },
  ];
}
