"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Megaphone, TrendingUp, Users, Percent, CheckCircle2 } from "lucide-react";
import { TiltCard } from "@/components/public/TiltCard";
import { getInfluencerProgramSettings, type InfluencerProgramSettings } from "@/lib/mock-data";

const PLATFORMS = ["Instagram", "TikTok", "YouTube", "Facebook", "Other"];

const inputClass =
  "w-full rounded-[var(--radius-sm)] border border-[var(--border)] bg-[var(--surface)] px-4 py-3 text-sm text-[var(--text)] outline-none transition-colors placeholder:text-[var(--text-faint)] focus:border-[var(--accent-violet)] accent-ring";
const labelClass = "mb-1.5 block text-xs font-medium text-[var(--text-muted)]";

const DEFAULT_SETTINGS: InfluencerProgramSettings = { enabled: true, defaultCutPercent: 30, minFollowerCount: 5000, cutDurationMonths: 12 };

export default function InfluencersPage() {
  const [sent, setSent] = useState(false);
  const [settings, setSettings] = useState<InfluencerProgramSettings>(DEFAULT_SETTINGS);

  useEffect(() => {
    getInfluencerProgramSettings().then(setSettings);
  }, []);

  const STEPS = [
    { icon: Megaphone, title: "Get your code", desc: "Apply, get approved, receive your unique referral code and link." },
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
        <TiltCard strength={2} glare={false} className="mx-auto max-w-xl p-7 sm:p-8">
          {sent ? (
            <div className="flex flex-col items-center py-10 text-center">
              <CheckCircle2 size={36} className="text-[var(--success)]" />
              <p className="mt-3 font-semibold text-[var(--text)]">Application submitted</p>
              <p className="mt-1 text-sm text-[var(--text-muted)]">
                We review every influencer manually — you&apos;ll hear back within 48 hours.
              </p>
            </div>
          ) : (
            <form
              onSubmit={(e) => {
                e.preventDefault();
                setSent(true);
              }}
              className="space-y-4"
            >
              <h2 className="font-display text-lg font-semibold text-[var(--text)]">Apply to the program</h2>
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <label className="block">
                  <span className={labelClass}>Your name</span>
                  <input required className={inputClass} />
                </label>
                <label className="block">
                  <span className={labelClass}>Email</span>
                  <input required type="email" className={inputClass} />
                </label>
                <label className="block">
                  <span className={labelClass}>Platform</span>
                  <select required defaultValue="" className={inputClass}>
                    <option value="" disabled>
                      Choose one
                    </option>
                    {PLATFORMS.map((p) => (
                      <option key={p} value={p}>
                        {p}
                      </option>
                    ))}
                  </select>
                </label>
                <label className="block">
                  <span className={labelClass}>Handle</span>
                  <input required placeholder="@yourhandle" className={inputClass} />
                </label>
                <label className="block sm:col-span-2">
                  <span className={labelClass}>Follower / subscriber count</span>
                  <input required type="number" min={0} className={inputClass} />
                </label>
              </div>
              <label className="block">
                <span className={labelClass}>Why do you want to join?</span>
                <textarea required rows={3} placeholder="Tell us about your audience and content." className={inputClass} />
              </label>
              <button
                type="submit"
                className="w-full rounded-full py-3.5 text-sm font-semibold text-black shadow-[var(--shadow-glow-violet)]"
                style={{ background: "var(--accent-gradient)" }}
              >
                Submit application
              </button>
              <p className="text-center text-xs text-[var(--text-faint)]">
                Minimum {settings.minFollowerCount.toLocaleString()} followers to qualify.
              </p>
            </form>
          )}
        </TiltCard>
      </motion.div>
    </div>
  );
}
