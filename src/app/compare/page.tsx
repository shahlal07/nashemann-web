import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight, Check, Scale } from "lucide-react";
import { TiltCard } from "@/components/public/TiltCard";
import { Badge } from "@/components/ui/Badge";

const TITLE = "Compare — Nashemann vs Shopify vs WooCommerce vs Custom";
const DESCRIPTION =
  "An honest comparison of Nashemann, Shopify, WooCommerce, and a custom-built store — setup cost, monthly cost, technical skill, time to launch, payment fees, and support.";

export const metadata: Metadata = {
  title: TITLE,
  description: DESCRIPTION,
  alternates: { canonical: "/compare" },
  openGraph: { title: TITLE, description: DESCRIPTION, type: "website" },
};

type Row = {
  label: string;
  nashemann: string;
  shopify: string;
  woocommerce: string;
  custom: string;
};

const ROWS: Row[] = [
  {
    label: "Setup cost",
    nashemann: "Rs 0",
    shopify: "Rs 0 (theme/app costs extra)",
    woocommerce: "Rs 0 plugin — hosting + a developer's time",
    custom: "Typically Rs 100,000+ for a developer",
  },
  {
    label: "Monthly cost",
    nashemann: "Rs 0, then Rs 15/order — or a flat Rs 7,000/mo",
    shopify: "~$21–39/mo (Basic–Grow), plus paid apps",
    woocommerce: "~Rs 3,000–8,000/mo hosting, before plugins",
    custom: "Hosting + ongoing maintenance, varies widely",
  },
  {
    label: "Technical skill required",
    nashemann: "None — storefront is built for you",
    shopify: "Low — mostly point-and-click, some setup",
    woocommerce: "Moderate to high — WordPress, plugins, security",
    custom: "High — you're hiring or becoming a developer",
  },
  {
    label: "Time to launch",
    nashemann: "~2 days on average",
    shopify: "A few days to a couple of weeks",
    woocommerce: "1–3 weeks, more with custom design",
    custom: "Several weeks to a few months",
  },
  {
    label: "Local payment fit (COD, PKR)",
    nashemann: "Built around cash-on-delivery from day one",
    shopify: "No native Shopify Payments in PKR — needs a local gateway or app",
    woocommerce: "Depends entirely on which plugins you install",
    custom: "Whatever you build — full control, full effort",
  },
  {
    label: "Support",
    nashemann: "WhatsApp + AI support, human backup",
    shopify: "24/7 chat support (English-first, global)",
    woocommerce: "Community forums — no official support line",
    custom: "Whoever you hired, if they're still around",
  },
];

export default function ComparePage() {
  return (
    <div className="mx-auto max-w-6xl px-5 py-16 lg:px-8 lg:py-24">
      <div className="mx-auto max-w-2xl text-center">
        <span className="inline-flex items-center gap-1.5 rounded-full bg-[rgba(139,107,255,0.14)] px-3 py-1 text-xs font-semibold text-[var(--accent-violet)]">
          <Scale size={13} /> Honest comparison
        </span>
        <h1 className="font-display mt-4 text-4xl font-semibold tracking-tight text-[var(--text)] sm:text-5xl">
          Nashemann vs the alternatives.
        </h1>
        <p className="mt-4 text-lg text-[var(--text-muted)]">
          Shopify and WooCommerce are both solid, well-built platforms — they just weren&apos;t built around a Pakistani small
          business paying cash-on-delivery for the first time. Here&apos;s how the options actually stack up.
        </p>
      </div>

      <div className="mt-14 overflow-x-auto">
        <TiltCard strength={2} glare={false} className="min-w-[720px] p-0">
          <table className="w-full border-collapse text-sm">
            <thead>
              <tr className="border-b border-[var(--border)]">
                <th className="p-4 text-left text-xs font-semibold uppercase tracking-wide text-[var(--text-faint)]">
                  &nbsp;
                </th>
                <th className="p-4 text-left">
                  <span className="font-display text-base font-semibold text-[var(--text)]">Nashemann</span>
                  <Badge tone="violet" className="ml-2">
                    Built for PK
                  </Badge>
                </th>
                <th className="p-4 text-left">
                  <span className="font-display text-base font-semibold text-[var(--text)]">Shopify</span>
                </th>
                <th className="p-4 text-left">
                  <span className="font-display text-base font-semibold text-[var(--text)]">WooCommerce</span>
                </th>
                <th className="p-4 text-left">
                  <span className="font-display text-base font-semibold text-[var(--text)]">Custom build</span>
                </th>
              </tr>
            </thead>
            <tbody>
              {ROWS.map((row, i) => (
                <tr key={row.label} className={i % 2 === 0 ? "bg-[var(--surface)]/40" : undefined}>
                  <td className="p-4 align-top text-xs font-semibold uppercase tracking-wide text-[var(--text-faint)]">
                    {row.label}
                  </td>
                  <td className="p-4 align-top text-[var(--text)]">
                    <span className="flex items-start gap-1.5">
                      <Check size={14} className="mt-0.5 shrink-0 text-[var(--success)]" />
                      {row.nashemann}
                    </span>
                  </td>
                  <td className="p-4 align-top text-[var(--text-muted)]">{row.shopify}</td>
                  <td className="p-4 align-top text-[var(--text-muted)]">{row.woocommerce}</td>
                  <td className="p-4 align-top text-[var(--text-muted)]">{row.custom}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </TiltCard>
      </div>

      <p className="mx-auto mt-4 max-w-3xl text-center text-xs text-[var(--text-faint)]">
        Prices and figures above are approximate as of 2026 and vary by plan, region, and provider — check each platform
        directly for current rates. Nashemann&apos;s per-order fee is charged to the customer at checkout, not deducted
        from your revenue.
      </p>

      <div className="mx-auto mt-16 max-w-3xl">
        <h2 className="font-display text-center text-xl font-semibold text-[var(--text)]">
          When each option actually makes sense
        </h2>
        <div className="mt-8 grid grid-cols-1 gap-5 sm:grid-cols-2">
          <div className="glass-panel rounded-[var(--radius-lg)] p-5">
            <p className="text-sm font-semibold text-[var(--text)]">Choose Shopify if…</p>
            <p className="mt-2 text-sm text-[var(--text-muted)]">
              You sell internationally, want the largest app ecosystem, and are comfortable wiring up a payment gateway
              yourself for the Pakistani market.
            </p>
          </div>
          <div className="glass-panel rounded-[var(--radius-lg)] p-5">
            <p className="text-sm font-semibold text-[var(--text)]">Choose WooCommerce if…</p>
            <p className="mt-2 text-sm text-[var(--text-muted)]">
              You already run WordPress, have a developer on hand, and want full control over hosting and code — at the
              cost of maintaining it yourself.
            </p>
          </div>
          <div className="glass-panel rounded-[var(--radius-lg)] p-5">
            <p className="text-sm font-semibold text-[var(--text)]">Choose a custom build if…</p>
            <p className="mt-2 text-sm text-[var(--text-muted)]">
              Your business has requirements no existing platform covers, and you have the budget and timeline for a
              developer to build and maintain it long-term.
            </p>
          </div>
          <div className="glass-panel rounded-[var(--radius-lg)] p-5" style={{ border: "1px solid rgba(139,107,255,0.35)" }}>
            <p className="text-sm font-semibold text-[var(--text)]">Choose Nashemann if…</p>
            <p className="mt-2 text-sm text-[var(--text-muted)]">
              You want to test selling online without upfront cost or technical setup, and you sell mostly to
              cash-on-delivery customers in Pakistan.
            </p>
          </div>
        </div>
      </div>

      <div className="mx-auto mt-16 max-w-xl text-center">
        <Link
          href="/apply"
          className="inline-flex items-center gap-1.5 rounded-full px-6 py-3 text-sm font-semibold text-black"
          style={{ background: "var(--accent-gradient)" }}
        >
          Apply for your store <ArrowRight size={14} />
        </Link>
      </div>
    </div>
  );
}
