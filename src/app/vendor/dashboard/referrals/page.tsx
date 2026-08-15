"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { UserPlus, Sparkles, Gift, AtSign } from "lucide-react";
import { TiltCard } from "@/components/public/TiltCard";
import { StatCard } from "@/components/ui/StatCard";
import { createClient } from "@/lib/supabase/client";
import { useVendorSessionContext } from "@/lib/vendor-session-context";
import { formatPKR, formatDate } from "@/lib/utils";

type Referrer = { name: string; social_handle: string; platform: string; referred_at: string };

type Loyalty = { lifetime_points: number; credits: number } | null;

type Redemption = { id: string; tier: string; coupon_code: string; credits: number; redeemed_at: string };

export default function VendorReferralsPage() {
  const { state } = useVendorSessionContext();
  const [referrer, setReferrer] = useState<Referrer | null>(null);
  const [loyalty, setLoyalty] = useState<Loyalty>(null);
  const [redemptions, setRedemptions] = useState<Redemption[]>([]);

  useEffect(() => {
    if (state.status !== "ready") return;
    let active = true;
    (async () => {
      const supabase = createClient();
      const vendorId = state.vendor.id;

      const { data: link } = await supabase.from("influencer_referred_vendors").select("influencer_id, referred_at").eq("vendor_id", vendorId).maybeSingle();
      if (link && active) {
        const { data: inf } = await supabase.from("influencers").select("name, social_handle, platform").eq("id", link.influencer_id).single();
        if (inf && active) setReferrer({ ...inf, referred_at: link.referred_at });
      }

      const [{ data: loyaltyRow }, { data: redemptionRows }] = await Promise.all([
        supabase.from("vendor_loyalty").select("lifetime_points, credits").eq("vendor_id", vendorId).maybeSingle(),
        supabase.from("reward_redemptions").select("id, tier, coupon_code, credits, redeemed_at").eq("vendor_id", vendorId).order("redeemed_at", { ascending: false }),
      ]);
      if (!active) return;
      setLoyalty(loyaltyRow ?? null);
      setRedemptions((redemptionRows ?? []) as Redemption[]);
    })();
    return () => {
      active = false;
    };
  }, [state]);

  if (state.status === "loading") return null;

  if (state.status === "no-access") {
    return (
      <div className="mx-auto max-w-md px-5 py-24 text-center">
        <p className="text-sm text-[var(--text-muted)]">You need to be signed in as a vendor admin to see this page.</p>
        <div className="mt-4 flex justify-center gap-3">
          <Link href="/login" className="rounded-full px-5 py-2.5 text-sm font-semibold text-black" style={{ background: "var(--accent-gradient)" }}>
            Log in
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-3xl px-5 py-8 lg:py-10">
      <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
        <h1 className="font-display text-2xl font-semibold text-[var(--text)]">Referrals & rewards</h1>
        <p className="mt-1 text-sm text-[var(--text-muted)]">Read-only visibility into how you joined Nashemann and any loyalty rewards you&apos;ve earned.</p>
      </motion.div>

      <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-2">
        <StatCard label="Lifetime points" value={loyalty?.lifetime_points ?? 0} icon={Sparkles} />
        <StatCard label="Reward credits" value={loyalty?.credits ?? 0} prefix="Rs " icon={Gift} accent="amber" />
      </div>

      <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, delay: 0.2 }} className="mt-6">
        <TiltCard strength={1} glare={false} className="p-6">
          <p className="mb-3 flex items-center gap-1.5 text-sm font-semibold text-[var(--text)]">
            <UserPlus size={15} className="text-[var(--accent-violet)]" /> How you joined
          </p>
          {referrer ? (
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-[var(--text)]">Referred by {referrer.name}</p>
                <p className="mt-0.5 flex items-center gap-1 text-xs text-[var(--text-faint)]">
                  <AtSign size={12} /> {referrer.social_handle} on {referrer.platform} · joined {formatDate(referrer.referred_at)}
                </p>
              </div>
            </div>
          ) : (
            <p className="text-sm text-[var(--text-faint)]">You joined Nashemann directly — no influencer referral on file.</p>
          )}
        </TiltCard>
      </motion.div>

      <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, delay: 0.3 }} className="mt-6">
        <TiltCard strength={1} glare={false} className="p-6">
          <p className="mb-3 text-sm font-semibold text-[var(--text)]">Reward redemptions</p>
          <div className="divide-y divide-[var(--border)]">
            {redemptions.map((r) => (
              <div key={r.id} className="flex items-center justify-between py-3">
                <div>
                  <p className="text-sm font-medium text-[var(--text)]">{r.tier} tier</p>
                  <p className="text-xs text-[var(--text-faint)]">
                    {r.coupon_code} · {formatDate(r.redeemed_at)}
                  </p>
                </div>
                <p className="text-sm font-semibold text-[var(--text)]">{formatPKR(Number(r.credits))}</p>
              </div>
            ))}
            {redemptions.length === 0 && <p className="py-6 text-center text-sm text-[var(--text-faint)]">No reward redemptions yet.</p>}
          </div>
        </TiltCard>
      </motion.div>
    </div>
  );
}
