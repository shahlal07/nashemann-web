"use client";

import { motion } from "framer-motion";
import { TrendingUp, ShoppingBag, Wallet } from "lucide-react";
import { TiltCard } from "./TiltCard";

const BARS = [40, 55, 48, 70, 62, 85, 78, 95];

export function DashboardMockup() {
  return (
    <motion.div
      initial={{ opacity: 0, y: 40, scale: 0.94 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ duration: 0.8, delay: 0.5, ease: "easeOut" }}
      className="relative mx-auto w-full max-w-md overflow-hidden sm:overflow-visible"
    >
      <div
        className="absolute -inset-10 -z-10 rounded-full opacity-40 blur-3xl"
        style={{ background: "var(--accent-gradient)" }}
      />
      <TiltCard strength={8} className="p-5" style={{ boxShadow: "0 30px 80px -20px rgba(139,107,255,0.4)" }}>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="flex h-6 w-6 items-center justify-center rounded-md text-[0.6rem] font-bold text-black" style={{ background: "var(--accent-gradient)" }}>
              N
            </div>
            <span className="text-xs font-semibold text-[var(--text)]">Sabz Basket — Dashboard</span>
          </div>
          <span className="flex items-center gap-1 rounded-full bg-[var(--success-bg)] px-2 py-0.5 text-[0.65rem] font-semibold text-[var(--success)]">
            <span className="h-1.5 w-1.5 rounded-full bg-current" /> Live
          </span>
        </div>

        <div className="mt-4 grid grid-cols-2 gap-2.5">
          <div className="rounded-xl border border-[var(--border)] bg-[var(--surface)] p-3">
            <p className="flex items-center gap-1 text-[0.65rem] text-[var(--text-faint)]">
              <Wallet size={11} /> Revenue today
            </p>
            <p className="font-display mt-1 text-lg font-semibold text-[var(--text)]">Rs 24,850</p>
          </div>
          <div className="rounded-xl border border-[var(--border)] bg-[var(--surface)] p-3">
            <p className="flex items-center gap-1 text-[0.65rem] text-[var(--text-faint)]">
              <ShoppingBag size={11} /> Orders today
            </p>
            <p className="font-display mt-1 text-lg font-semibold text-[var(--text)]">38</p>
          </div>
        </div>

        <div className="mt-3 rounded-xl border border-[var(--border)] bg-[var(--surface)] p-3">
          <p className="mb-2 flex items-center gap-1 text-[0.65rem] text-[var(--text-faint)]">
            <TrendingUp size={11} /> This week
          </p>
          <div className="flex h-16 items-end gap-1.5">
            {BARS.map((h, i) => (
              <motion.div
                key={i}
                initial={{ height: 0 }}
                animate={{ height: `${h}%` }}
                transition={{ delay: 0.9 + i * 0.06, duration: 0.5, ease: "easeOut" }}
                className="flex-1 rounded-t-sm"
                style={{ background: i === BARS.length - 1 ? "var(--accent-gradient)" : "rgba(139,107,255,0.25)" }}
              />
            ))}
          </div>
        </div>
      </TiltCard>
    </motion.div>
  );
}
