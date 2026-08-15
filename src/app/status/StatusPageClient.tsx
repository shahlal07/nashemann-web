"use client";

import { motion } from "framer-motion";
import {
  CheckCircle2,
  Globe,
  ClipboardList,
  LayoutDashboard,
  Store,
  MessageCircle,
  Wallet,
  Info,
  ShieldCheck,
} from "lucide-react";
import { Card, CardHeader } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";

function fadeUpProps(delay = 0) {
  return {
    initial: { opacity: 0, y: 20 },
    whileInView: { opacity: 1, y: 0 },
    viewport: { once: true, margin: "-60px" },
    transition: { duration: 0.5, delay },
  };
}

const COMPONENTS = [
  { name: "Public Website", description: "Marketing pages, blog, pricing, and vendor storefronts.", icon: Globe },
  { name: "Vendor Applications", description: "New vendor signup and onboarding flow.", icon: ClipboardList },
  { name: "Admin Dashboard", description: "Internal platform administration and oversight.", icon: LayoutDashboard },
  { name: "Vendor Dashboard", description: "Vendor-facing order, product, and store management.", icon: Store },
  { name: "AI Support Chat", description: "In-app AI-assisted customer and vendor support.", icon: MessageCircle },
  { name: "Payment / Settlement Processing", description: "Order payments and vendor payout settlement.", icon: Wallet },
];

export function StatusPageClient() {
  return (
    <div className="mx-auto max-w-3xl px-5 py-16 lg:py-24">
      <motion.div {...fadeUpProps()} className="text-center">
        <h1 className="font-display text-4xl font-semibold tracking-tight text-[var(--text)] sm:text-5xl">
          System <span className="accent-text">Status</span>
        </h1>
        <p className="mt-4 text-lg text-[var(--text-muted)]">
          Current operational status of Nashemann&apos;s platform components.
        </p>
      </motion.div>

      <motion.div
        {...fadeUpProps(0.05)}
        className="mt-10 flex items-center gap-3 rounded-[var(--radius-lg)] p-5"
        style={{ background: "var(--success-bg)", border: "1px solid rgba(52,211,153,0.3)" }}
      >
        <motion.div
          initial={{ scale: 0.6, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ type: "spring", stiffness: 260, damping: 20, delay: 0.1 }}
        >
          <CheckCircle2 size={28} className="shrink-0 text-[var(--success)]" />
        </motion.div>
        <div>
          <p className="font-display text-lg font-semibold text-[var(--text)]">All Systems Operational</p>
          <p className="text-sm text-[var(--text-muted)]">Every platform component is running normally.</p>
        </div>
      </motion.div>

      <div className="mt-10 space-y-3">
        {COMPONENTS.map((c, i) => (
          <motion.div key={c.name} {...fadeUpProps(0.1 + i * 0.05)}>
            <Card className="flex items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <div
                  className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl"
                  style={{ background: "rgba(139,107,255,0.14)", color: "var(--accent-violet)" }}
                >
                  <c.icon size={16} />
                </div>
                <div>
                  <p className="text-sm font-semibold text-[var(--text)]">{c.name}</p>
                  <p className="text-xs text-[var(--text-faint)]">{c.description}</p>
                </div>
              </div>
              <Badge tone="success" dot>
                Operational
              </Badge>
            </Card>
          </motion.div>
        ))}
      </div>

      <motion.div {...fadeUpProps(0.1)} className="mt-10">
        <div className="glass-panel flex items-start gap-3 rounded-[var(--radius-lg)] p-5">
          <Info size={16} className="mt-0.5 shrink-0 text-[var(--accent-amber)]" />
          <p className="text-sm text-[var(--text-muted)]">
            Status is currently reviewed manually. Automated real-time monitoring is planned — this page will
            switch to live, continuously-updated status checks once that&apos;s wired up. It does not yet reflect
            an automated uptime measurement.
          </p>
        </div>
      </motion.div>

      <div className="mt-14">
        <motion.div {...fadeUpProps()}>
          <CardHeader
            title="Incident history"
            description="Past incidents affecting platform components, if any."
          />
        </motion.div>
        <motion.div {...fadeUpProps(0.05)}>
          <Card className="flex flex-col items-center gap-2 py-10 text-center">
            <ShieldCheck size={22} className="text-[var(--text-faint)]" />
            <p className="text-sm font-medium text-[var(--text)]">No incidents reported</p>
            <p className="text-xs text-[var(--text-faint)]">Nothing to show yet.</p>
          </Card>
        </motion.div>
      </div>
    </div>
  );
}
