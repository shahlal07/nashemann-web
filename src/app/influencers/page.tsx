"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { Megaphone, TrendingUp, Users, Percent, ArrowRight } from "lucide-react";
import { TiltCard } from "@/components/public/TiltCard";
import { getInfluencerProgramSettings, type InfluencerProgramSettings } from "@/lib/mock-data";

const DEFAULT_SETTINGS: InfluencerProgramSettings = { enabled: true, defaultCutPercent: 30, minFollowerCount: 5000, cutDurationMonths: 12 };

export default function InfluencersPage() {
  const [settings, setSettings] = useState<InfluencerProgramSettings>(DEFAULT_SETTINGS);

  useEffect(() => {
    getInfluencerProgramSettings().then(setSettings);
  }, []);

  const STEPS = [
    { icon: Megaphone, title: "Get your code", desc: "Sign up, get approved, receive your unique referral code and link." },
    { icon: Users, title: "Refer real businesses", desc: "Any small business you bring onto Nashemann counts." },
    { icon: TrendingUp, title: "They grow", desc: "They get a real online store and start taking orders." },
    { icon: Percent, title: "You earn", desc: `You keep ${settings.defaultCutPercent}% of the platform's own revenue from every business you referred.` },
  ];

  return (
    <div className="mx-auto max-w-5xl px-5 py-16 lg:px-8 lg:py-24">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }} className="mx-auto max-w-2xl text-center">
        <span className="inline-flex items-center gap-1.5 rounded-full bg-[rgba(139,107,255,0.14)] px-3 py-1 text-xs font-semibold text-[var(--accent-violet)]">
          <Megaphone size={13} /> Influencer Program
        </span>
        <h1 className="font-display mt-4 text-4xl font-semibold tracking-tight text-[var(--text)] sm:text-5xl">
          Turn your audience into <span className="accent-text">real income</span>.
        </h1>
        <p className="mt-4 text-lg text-[var(--text-muted)]">
          Bring small businesses onto Nashemann and keep {settings.defaultCutPercent}% of the
          platform&apos;s revenue from every one you refer — for {settings.cutDurationMonths} months, automatically.
        </p>
      </motion.div>

      <div className="relative mt-16 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
        <div className="absolute left-0 right-0 top-[28px] hidden h-px bg-gradient-to-r from-transparent via-[var(--border-strong)] to-transparent lg:block" />
        {STEPS.map((step, i) => (
          <motion.div
            key={step.title}
            initial={{ opacity: 0, y: 24 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-60px" }}
            transition={{ duration: 0.5, delay: i * 0.1 }}
            className="text-center"
          >
            <div className="relative z-10 mx-auto flex h-14 w-14 items-center justify-center rounded-2xl text-black" style={{ background: "var(--accent-gradient)" }}>
              <step.icon size={22} />
            </div>
            <h3 className="font-display mt-4 text-base font-semibold text-[var(--text)]">{step.title}</h3>
            <p className="mt-1.5 text-sm text-[var(--text-muted)]">{step.desc}</p>
          </motion.div>
        ))}
      </div>

      <motion.div
        initial={{ opacity: 0, y: 24 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: "-80px" }}
        transition={{ duration: 0.6 }}
        className="mt-20"
      >
        <TiltCard strength={2} glare={false} className="mx-auto flex max-w-xl flex-col items-center p-7 text-center sm:p-8">
          <h2 className="font-display text-lg font-semibold text-[var(--text)]">Ready to join?</h2>
          <p className="mt-2 text-sm text-[var(--text-muted)]">
            Create your influencer account in under a minute — we review every application manually and
            you&apos;ll hear back within 48 hours.
          </p>
          <Link
            href="/signup?role=influencer"
            className="mt-6 inline-flex items-center gap-1.5 rounded-full px-6 py-3.5 text-sm font-semibold text-black shadow-[var(--shadow-glow-violet)]"
            style={{ background: "var(--accent-gradient)" }}
          >
            Apply as an influencer <ArrowRight size={15} />
          </Link>
          <p className="mt-4 text-xs text-[var(--text-faint)]">
            Minimum {settings.minFollowerCount.toLocaleString()} followers to qualify. Already applied?{" "}
            <Link href="/login?role=influencer" className="font-medium text-[var(--accent-violet)] hover:underline">
              Log in
            </Link>
            .
          </p>
        </TiltCard>
      </motion.div>
    </div>
  );
}
