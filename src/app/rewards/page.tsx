"use client";

import { motion } from "framer-motion";
import { Copy, Share2, Gift, Trophy } from "lucide-react";
import { useEffect, useState } from "react";
import { TiltCard } from "@/components/public/TiltCard";
import { Icon } from "@/components/public/Icon";
import { useSiteContent } from "@/lib/site-content";
import { formatPKR } from "@/lib/utils";
import { createClient } from "@/lib/supabase/client";

const MEDAL = ["🥇", "🥈", "🥉"];

type LeaderboardEntry = { id: string; name: string; lifetimePoints: number };

type VendorLoyaltyRow = {
  vendor_id: string;
  lifetime_points: number;
  vendors: { name: string } | { name: string }[] | null;
};

function vendorName(vendors: VendorLoyaltyRow["vendors"]): string {
  if (!vendors) return "Unknown vendor";
  return Array.isArray(vendors) ? (vendors[0]?.name ?? "Unknown vendor") : vendors.name;
}

export default function RewardsPage() {
  const REWARDS_CONTENT = useSiteContent("rewards");
  const [copied, setCopied] = useState(false);
  const [leaderboard, setLeaderboard] = useState<LeaderboardEntry[]>([]);

  useEffect(() => {
    let active = true;
    const supabase = createClient();
    supabase
      .from("vendor_loyalty")
      .select("vendor_id, lifetime_points, vendors(name)")
      .order("lifetime_points", { ascending: false })
      .limit(10)
      .then(({ data, error }) => {
        if (!active || error || !data) return;
        setLeaderboard(
          (data as unknown as VendorLoyaltyRow[]).map((row) => ({
            id: row.vendor_id,
            name: vendorName(row.vendors),
            lifetimePoints: row.lifetime_points,
          }))
        );
      });
    return () => {
      active = false;
    };
  }, []);

  function copyCode() {
    navigator.clipboard?.writeText(REWARDS_CONTENT.referral.yourCode);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  }

  return (
    <div className="mx-auto max-w-6xl px-5 py-16 lg:px-8 lg:py-24">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }} className="mx-auto max-w-2xl text-center">
        <span className="inline-flex items-center gap-1.5 rounded-full bg-[rgba(255,176,32,0.14)] px-3 py-1 text-xs font-semibold text-[var(--accent-amber)]">
          <Gift size={13} /> {REWARDS_CONTENT.headline}
        </span>
        <h1 className="font-display mt-4 text-4xl font-semibold tracking-tight text-[var(--text)] sm:text-5xl">
          {REWARDS_CONTENT.subheadline}
        </h1>
      </motion.div>

      <div className="mt-16">
        <h2 className="font-display text-center text-xl font-semibold text-[var(--text)]">Growth tiers</h2>
        <p className="mx-auto mt-2 max-w-md text-center text-sm text-[var(--text-muted)]">
          The more orders your store completes, the more Nashemann gives back — automatically.
        </p>

        <div className="relative mt-12 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
          <div className="absolute left-0 right-0 top-[28px] hidden h-px bg-gradient-to-r from-transparent via-[var(--border-strong)] to-transparent lg:block" />
          {REWARDS_CONTENT.tiers.map((tier, i) => (
            <motion.div
              key={tier.name}
              initial={{ opacity: 0, y: 24 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-60px" }}
              transition={{ duration: 0.5, delay: i * 0.1 }}
            >
              <TiltCard strength={6} className="h-full p-5 text-center">
                <div
                  className="relative z-10 mx-auto flex h-14 w-14 items-center justify-center rounded-2xl text-black"
                  style={{ background: "var(--accent-gradient)" }}
                >
                  <Icon name={tier.icon} size={22} />
                </div>
                <h3 className="font-display mt-4 text-base font-semibold text-[var(--text)]">{tier.name}</h3>
                <p className="mt-1 text-xs text-[var(--text-faint)]">{tier.ordersRequired} orders</p>
                <p className="mt-3 text-sm text-[var(--text-muted)]">{tier.perk}</p>
              </TiltCard>
            </motion.div>
          ))}
        </div>
      </div>

      <motion.div
        initial={{ opacity: 0, y: 24 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: "-80px" }}
        transition={{ duration: 0.6 }}
        className="mx-auto mt-24 max-w-2xl"
      >
        <h2 className="font-display flex items-center justify-center gap-2 text-center text-xl font-semibold text-[var(--text)]">
          <Trophy size={18} className="text-[var(--accent-amber)]" /> Vendor leaderboard
        </h2>
        <p className="mx-auto mt-2 max-w-md text-center text-sm text-[var(--text-muted)]">
          Ranked by lifetime reward points earned across the platform.
        </p>

        <TiltCard strength={3} glare={false} className="mt-8 p-2">
          <div className="divide-y divide-[var(--border)]">
            {leaderboard.map((entry, i) => (
              <div key={entry.id} className="flex items-center justify-between gap-3 px-4 py-3">
                <div className="flex items-center gap-3">
                  <span className="w-6 text-center text-lg">{MEDAL[i] ?? `#${i + 1}`}</span>
                  <span className="text-sm font-medium text-[var(--text)]">{entry.name}</span>
                </div>
                <span className="text-sm font-semibold text-[var(--accent-violet)]">{entry.lifetimePoints.toLocaleString()} pts</span>
              </div>
            ))}
            {leaderboard.length === 0 && (
              <p className="px-4 py-6 text-center text-sm text-[var(--text-faint)]">No vendors on the leaderboard yet.</p>
            )}
          </div>
        </TiltCard>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 24 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: "-80px" }}
        transition={{ duration: 0.6 }}
        className="mt-16"
      >
        <TiltCard strength={3} glare={false} className="overflow-hidden p-8 sm:p-12">
          <div className="pointer-events-none absolute -right-16 -top-16 h-64 w-64 rounded-full opacity-20 blur-3xl" style={{ background: "var(--accent-gradient)" }} />
          <div className="relative grid grid-cols-1 items-center gap-10 lg:grid-cols-2">
            <div>
              <h2 className="font-display text-2xl font-semibold text-[var(--text)] sm:text-3xl">
                {REWARDS_CONTENT.referral.headline}
              </h2>
              <p className="mt-3 max-w-md text-[var(--text-muted)]">{REWARDS_CONTENT.referral.description}</p>
            </div>

            <div className="rounded-[var(--radius-lg)] border border-[var(--border)] bg-[var(--surface-solid)] p-6">
              <p className="text-xs text-[var(--text-faint)]">Your referral code</p>
              <div className="mt-2 flex items-center justify-between gap-3">
                <span className="font-display text-2xl font-bold tracking-wider text-[var(--text)]">
                  {REWARDS_CONTENT.referral.yourCode}
                </span>
                <button onClick={copyCode} className="rounded-full border border-[var(--border-strong)] p-2 text-[var(--text-muted)] hover:text-[var(--text)]" aria-label="Copy code">
                  <Copy size={15} />
                </button>
              </div>
              {copied && <p className="mt-1 text-xs text-[var(--success)]">Copied to clipboard</p>}
              <div className="mt-4 rounded-lg bg-[rgba(52,211,153,0.1)] px-3 py-2.5 text-sm font-semibold text-[var(--success)]">
                +{formatPKR(REWARDS_CONTENT.referral.reward)} credit per successful referral
              </div>
              <button className="mt-4 flex w-full items-center justify-center gap-2 rounded-full py-2.5 text-sm font-semibold text-black" style={{ background: "var(--accent-gradient)" }}>
                <Share2 size={14} /> Share your link
              </button>
            </div>
          </div>
        </TiltCard>
      </motion.div>
    </div>
  );
}
