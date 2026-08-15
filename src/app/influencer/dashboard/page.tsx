"use client";

import { motion } from "framer-motion";
import { Wallet, Store, Percent, Copy, Share2, UserPlus, Clock } from "lucide-react";
import { useEffect, useState } from "react";
import { TiltCard } from "@/components/public/TiltCard";
import { StatCounter } from "@/components/public/StatCounter";
import { VendorStatusBadge, Badge } from "@/components/ui/Badge";
import { getInfluencerDashboard, type InfluencerDashboard } from "@/lib/mock-data";
import { getApplicationsByReferralCode, type StoredApplication } from "@/lib/application-store";
import { formatDate } from "@/lib/utils";

// The influencer dashboard is reached by referral code, not a real
// per-influencer login yet (see AuthForm.tsx) -- this is the demo
// influencer seeded alongside the platform's other demo content.
const DEMO_REFERRAL_CODE = "HANIA30";

export default function InfluencerDashboardPage() {
  const [copied, setCopied] = useState(false);
  const [dashboard, setDashboard] = useState<InfluencerDashboard | null>(null);
  const [referredApplications, setReferredApplications] = useState<StoredApplication[]>([]);
  const referralLink = typeof window !== "undefined" ? `${window.location.origin}/apply?ref=${DEMO_REFERRAL_CODE}` : "";

  useEffect(() => {
    getInfluencerDashboard(DEMO_REFERRAL_CODE).then(setDashboard);
    getApplicationsByReferralCode(DEMO_REFERRAL_CODE).then(setReferredApplications);
  }, []);

  function copyCode() {
    if (!dashboard) return;
    navigator.clipboard?.writeText(dashboard.influencer.referralCode);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  }

  async function shareLink() {
    const link = `${window.location.origin}/apply?ref=${DEMO_REFERRAL_CODE}`;
    if (navigator.share) {
      try {
        await navigator.share({ title: "Start your store on Nashemann", url: link });
        return;
      } catch {
        // user cancelled the native share sheet -- fall through to clipboard copy
      }
    }
    navigator.clipboard?.writeText(link);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  }

  if (!dashboard) return null;
  const { influencer, referredVendors, platformRevenueGenerated, influencerEarnings } = dashboard;

  return (
    <div className="mx-auto max-w-4xl px-5 py-14 lg:py-20">
      <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
        <p className="text-xs text-[var(--text-faint)]">Welcome back</p>
        <h1 className="font-display text-2xl font-semibold text-[var(--text)]">{influencer.name}</h1>
        <p className="mt-1 text-sm text-[var(--text-muted)]">
          {influencer.socialHandle} · {influencer.platform}
        </p>
      </motion.div>

      <div className="mt-8 grid grid-cols-1 gap-4 sm:grid-cols-3">
        {[
          { label: "Businesses referred", value: referredVendors.length, prefix: "", icon: Store },
          { label: "Platform revenue generated", value: platformRevenueGenerated, prefix: "Rs ", icon: Wallet },
          { label: `Your earnings (${influencer.cutPercent}%)`, value: influencerEarnings, prefix: "Rs ", icon: Percent },
        ].map((stat, i) => (
          <motion.div key={stat.label} initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, delay: 0.1 + i * 0.08 }}>
            <TiltCard strength={5} className="p-5">
              <div className="flex h-9 w-9 items-center justify-center rounded-lg" style={{ background: "rgba(139,107,255,0.14)", color: "var(--accent-violet)" }}>
                <stat.icon size={16} />
              </div>
              <p className="mt-3 text-xs font-medium text-[var(--text-muted)]">{stat.label}</p>
              <p className="font-display mt-1 text-2xl font-semibold text-[var(--text)]">
                {stat.prefix}
                <StatCounter value={stat.value} />
              </p>
            </TiltCard>
          </motion.div>
        ))}
      </div>

      <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, delay: 0.3 }} className="mt-6">
        <TiltCard strength={2} glare={false} className="p-6">
          <p className="text-xs text-[var(--text-faint)]">Your referral code</p>
          <div className="mt-2 flex items-center justify-between gap-3">
            <span className="font-display text-2xl font-bold tracking-wider text-[var(--text)]">{influencer.referralCode}</span>
            <div className="flex gap-2">
              <button onClick={copyCode} className="rounded-full border border-[var(--border-strong)] p-2 text-[var(--text-muted)] hover:text-[var(--text)]" aria-label="Copy code">
                <Copy size={15} />
              </button>
              <button
                onClick={shareLink}
                className="flex items-center gap-1.5 rounded-full px-3 py-2 text-xs font-semibold text-black"
                style={{ background: "var(--accent-gradient)" }}
              >
                <Share2 size={13} /> Share link
              </button>
            </div>
          </div>
          <p className="mt-2.5 truncate rounded-[var(--radius-sm)] border border-[var(--border)] bg-[var(--surface)] px-3 py-2 text-xs text-[var(--text-faint)]">
            {referralLink}
          </p>
          {copied && <p className="mt-1 text-xs text-[var(--success)]">Copied to clipboard</p>}
        </TiltCard>
      </motion.div>

      <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, delay: 0.4 }} className="mt-6">
        <TiltCard strength={2} glare={false} className="p-6">
          <p className="mb-3 text-sm font-semibold text-[var(--text)]">Businesses you referred</p>
          <div className="divide-y divide-[var(--border)]">
            {referredVendors.map((v) => (
              <div key={v.id} className="flex items-center justify-between py-3">
                <div className="flex items-center gap-3">
                  <span className="text-lg">{v.logoEmoji}</span>
                  <div>
                    <p className="text-sm font-medium text-[var(--text)]">{v.name}</p>
                    <p className="text-xs text-[var(--text-faint)]">Joined {formatDate(v.joinedAt)}</p>
                  </div>
                </div>
                <VendorStatusBadge status={v.status} />
              </div>
            ))}
            {referredVendors.length === 0 && (
              <p className="py-6 text-center text-sm text-[var(--text-faint)]">No referrals yet — share your link to get started.</p>
            )}
          </div>
        </TiltCard>
      </motion.div>

      <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, delay: 0.5 }} className="mt-6">
        <TiltCard strength={2} glare={false} className="p-6">
          <p className="mb-3 flex items-center gap-1.5 text-sm font-semibold text-[var(--text)]">
            <UserPlus size={15} className="text-[var(--accent-violet)]" /> Signed up through your link
          </p>
          <div className="divide-y divide-[var(--border)]">
            {referredApplications.map((a) => (
              <div key={a.referenceId} className="flex items-center justify-between py-3">
                <div>
                  <p className="text-sm font-medium text-[var(--text)]">{a.businessName}</p>
                  <p className="flex items-center gap-1 text-xs text-[var(--text-faint)]">
                    <Clock size={11} /> Applied {formatDate(a.submittedAt)}
                  </p>
                </div>
                <Badge tone={a.status === "approved" ? "success" : a.status === "rejected" ? "danger" : "warning"} dot>
                  {a.status.charAt(0).toUpperCase() + a.status.slice(1)}
                </Badge>
              </div>
            ))}
            {referredApplications.length === 0 && (
              <p className="py-6 text-center text-sm text-[var(--text-faint)]">
                No one has applied through your link yet — once they do, they&apos;ll show up here before they&apos;re even approved.
              </p>
            )}
          </div>
        </TiltCard>
      </motion.div>
    </div>
  );
}
