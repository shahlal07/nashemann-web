"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { motion, type Variants } from "framer-motion";
import { ArrowRight, Sparkles } from "lucide-react";
import { FloatingShapes } from "../FloatingShapes";
import { MouseGlow } from "../MouseGlow";
import { DashboardMockup } from "../DashboardMockup";
import { StatCounter } from "../StatCounter";
import { useSiteContent } from "@/lib/site-content";
import { getPlatformLiveStats, type PlatformLiveStats } from "@/lib/mock-data";

const container: Variants = {
  hidden: {},
  show: { transition: { staggerChildren: 0.12, delayChildren: 0.1 } },
};
const fadeUp: Variants = {
  hidden: { opacity: 0, y: 24 },
  show: { opacity: 1, y: 0, transition: { duration: 0.6, ease: "easeOut" } },
};

export function Hero() {
  const HERO_CONTENT = useSiteContent("hero");
  const [liveStats, setLiveStats] = useState<PlatformLiveStats | null>(null);

  useEffect(() => {
    let active = true;
    getPlatformLiveStats().then((stats) => {
      if (active) setLiveStats(stats);
    });
    return () => {
      active = false;
    };
  }, []);

  const stats = HERO_CONTENT.stats.map((s) => {
    if (!liveStats) return s;
    const label = s.label.toLowerCase();
    if (label.includes("vendor")) return { ...s, value: liveStats.activeVendors };
    if (label.includes("order")) return { ...s, value: liveStats.ordersLast30d };
    return s;
  });
  const smallScale = liveStats !== null && liveStats.activeVendors > 0 && liveStats.activeVendors < 5;

  return (
    <MouseGlow className="relative overflow-hidden">
      <FloatingShapes />
      <div className="relative mx-auto grid max-w-7xl grid-cols-1 items-center gap-12 px-5 pb-20 pt-16 lg:grid-cols-[1.05fr_0.95fr] lg:px-8 lg:pb-28 lg:pt-24">
        <motion.div variants={container} initial="hidden" animate="show">
          <motion.div variants={fadeUp}>
            <span className="inline-flex items-center gap-1.5 rounded-full border border-[var(--border-strong)] bg-[var(--surface)] px-3.5 py-1.5 text-xs font-medium text-[var(--text-muted)]">
              <Sparkles size={12} className="text-[var(--accent-amber)]" />
              {HERO_CONTENT.eyebrow}
            </span>
          </motion.div>

          <motion.h1
            variants={fadeUp}
            className="font-display mt-5 text-4xl font-semibold leading-[1.08] tracking-tight text-[var(--text)] sm:text-5xl lg:text-6xl"
          >
            {HERO_CONTENT.headline.split(" ").slice(0, -2).join(" ")}{" "}
            <span className="accent-text">{HERO_CONTENT.headline.split(" ").slice(-2).join(" ")}</span>
          </motion.h1>

          <motion.p variants={fadeUp} className="mt-5 max-w-xl text-base leading-relaxed text-[var(--text-muted)] sm:text-lg">
            {HERO_CONTENT.subheadline}
          </motion.p>

          <motion.div variants={fadeUp} className="mt-8 flex flex-wrap items-center gap-3">
            <Link href="/apply">
              <motion.span
                whileHover={{ scale: 1.04, y: -2 }}
                whileTap={{ scale: 0.97 }}
                className="inline-flex items-center gap-2 rounded-full px-6 py-3.5 text-sm font-semibold text-black shadow-[var(--shadow-glow-violet)]"
                style={{ background: "var(--accent-gradient)" }}
              >
                {HERO_CONTENT.primaryCta} <ArrowRight size={16} />
              </motion.span>
            </Link>
            <Link href="/pricing">
              <motion.span
                whileHover={{ scale: 1.04, y: -2, backgroundColor: "var(--surface-hover)" }}
                whileTap={{ scale: 0.97 }}
                className="inline-flex items-center gap-2 rounded-full border border-[var(--border-strong)] bg-[var(--surface)] px-6 py-3.5 text-sm font-semibold text-[var(--text)]"
              >
                {HERO_CONTENT.secondaryCta}
              </motion.span>
            </Link>
          </motion.div>

          <motion.div variants={fadeUp} className="mt-12 flex flex-wrap gap-x-10 gap-y-4">
            {stats.map((s) => {
              const isVendorStat = s.label.toLowerCase().includes("vendor");
              return (
                <div key={s.label}>
                  <p className="font-display text-2xl font-semibold text-[var(--text)]">
                    <StatCounter value={s.value} suffix={isVendorStat && smallScale ? "" : (s.suffix ?? "+")} />
                  </p>
                  <p className="text-xs text-[var(--text-faint)]">
                    {s.label}
                    {isVendorStat && smallScale && <span className="text-[var(--accent-violet)]"> — growing daily</span>}
                  </p>
                </div>
              );
            })}
          </motion.div>
        </motion.div>

        <DashboardMockup />
      </div>
    </MouseGlow>
  );
}
