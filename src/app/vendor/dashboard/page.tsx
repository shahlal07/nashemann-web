"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import { useEffect, useState } from "react";
import { Wallet, ShoppingBag, TrendingUp, ExternalLink, LayoutDashboard } from "lucide-react";
import { TiltCard } from "@/components/public/TiltCard";
import { StatCounter } from "@/components/public/StatCounter";
import { createClient } from "@/lib/supabase/client";
import { useVendorSessionContext } from "@/lib/vendor-session-context";
import { formatPKR } from "@/lib/utils";
import { AreaChart, Area, ResponsiveContainer, XAxis, YAxis, Tooltip, CartesianGrid } from "recharts";

type RevenuePoint = { month: string; revenue: number };

type SettlementRow = { month: string; orders_count: number; gross_revenue: number; platform_fee: number };

const MONTH_LABEL = new Intl.DateTimeFormat("en-PK", { month: "short" });

export default function VendorDashboardPage() {
  const { state } = useVendorSessionContext();
  const [trend, setTrend] = useState<RevenuePoint[]>([]);
  const [latestSettlement, setLatestSettlement] = useState<SettlementRow | null>(null);
  const [growth, setGrowth] = useState(0);

  useEffect(() => {
    if (state.status !== "ready") return;
    let active = true;
    (async () => {
      const supabase = createClient();
      const { data: settlementRows } = await supabase
        .from("settlements")
        .select("month, orders_count, gross_revenue, platform_fee")
        .eq("vendor_id", state.vendor.id)
        .order("month", { ascending: true })
        .limit(6);
      if (!active) return;

      const settlements = (settlementRows ?? []) as SettlementRow[];
      const latest = settlements[settlements.length - 1] ?? null;
      const previous = settlements[settlements.length - 2];
      setLatestSettlement(latest);
      setGrowth(latest && previous && previous.gross_revenue > 0 ? Math.round(((latest.gross_revenue - previous.gross_revenue) / previous.gross_revenue) * 100) : 0);
      setTrend(settlements.map((s) => ({ month: MONTH_LABEL.format(new Date(s.month)), revenue: Number(s.gross_revenue) })));
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

  const vendor = state.vendor;
  const revenueThisMonth = latestSettlement ? Number(latestSettlement.gross_revenue) : Number(vendor.revenue_last_30d);
  const ordersThisMonth = latestSettlement ? latestSettlement.orders_count : vendor.orders_last_30d;
  const platformFeeThisMonth = latestSettlement ? Number(latestSettlement.platform_fee) : 0;

  return (
    <div className="mx-auto max-w-4xl px-5 py-8 lg:py-10">
      <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }} className="flex items-center gap-4">
        <div className="flex h-14 w-14 items-center justify-center rounded-2xl text-2xl" style={{ background: "var(--accent-gradient-soft)" }}>
          {vendor.theme_logo_emoji}
        </div>
        <div>
          <p className="text-xs text-[var(--text-faint)]">Welcome back</p>
          <h1 className="font-display text-2xl font-semibold text-[var(--text)]">{vendor.name}</h1>
        </div>
      </motion.div>

      <div className="mt-8 grid grid-cols-1 gap-4 sm:grid-cols-3">
        {[
          { label: "Revenue this month", value: revenueThisMonth, prefix: "Rs ", icon: Wallet, tone: "violet" as const },
          { label: "Orders this month", value: ordersThisMonth, prefix: "", icon: ShoppingBag, tone: "amber" as const },
          { label: "Platform fee this month", value: platformFeeThisMonth, prefix: "Rs ", icon: TrendingUp, tone: "violet" as const },
        ].map((stat, i) => (
          <motion.div key={stat.label} initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, delay: 0.1 + i * 0.08 }}>
            <TiltCard strength={5} className="p-5">
              <div
                className="flex h-9 w-9 items-center justify-center rounded-lg"
                style={{ background: stat.tone === "violet" ? "rgba(139,107,255,0.14)" : "rgba(255,176,32,0.14)", color: stat.tone === "violet" ? "var(--accent-violet)" : "var(--accent-amber)" }}
              >
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
          <div className="mb-4 flex items-center justify-between">
            <div>
              <p className="text-sm font-semibold text-[var(--text)]">Revenue trend</p>
              <p className="text-xs text-[var(--text-faint)]">Last 6 months</p>
            </div>
            <span className="text-xs font-semibold text-[var(--success)]">↑ {growth}% vs last month</span>
          </div>
          {trend.length > 0 ? (
            <ResponsiveContainer width="100%" height={220}>
              <AreaChart data={trend} margin={{ left: -20, right: 10 }}>
                <defs>
                  <linearGradient id="vendorRevFill" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#8b6bff" stopOpacity={0.4} />
                    <stop offset="100%" stopColor="#8b6bff" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.06)" vertical={false} />
                <XAxis dataKey="month" tick={{ fill: "#66666f", fontSize: 12 }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fill: "#66666f", fontSize: 12 }} axisLine={false} tickLine={false} tickFormatter={(v) => `${v / 1000}k`} />
                <Tooltip
                  contentStyle={{ background: "#131318", border: "1px solid rgba(255,255,255,0.1)", borderRadius: 10, fontSize: 13 }}
                  labelStyle={{ color: "#f3f3f6" }}
                  formatter={(v) => [formatPKR(Number(v)), "Revenue"]}
                />
                <Area type="monotone" dataKey="revenue" stroke="#8b6bff" strokeWidth={2.5} fill="url(#vendorRevFill)" />
              </AreaChart>
            </ResponsiveContainer>
          ) : (
            <p className="py-14 text-center text-sm text-[var(--text-faint)]">No settlements recorded yet.</p>
          )}
        </TiltCard>
      </motion.div>

      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.4 }} className="mt-6 flex flex-col items-center gap-3 sm:flex-row sm:justify-between">
        <p className="text-xs text-[var(--text-faint)]">
          This is a quick-glance view. For full order management, products, and settings, use your store&apos;s own admin panel.
        </p>
        <Link
          href="#"
          onClick={(e) => e.preventDefault()}
          className="inline-flex shrink-0 items-center gap-1.5 rounded-full border border-[var(--border-strong)] px-4 py-2 text-xs font-semibold text-[var(--text)]"
        >
          <LayoutDashboard size={13} /> Open full admin panel <ExternalLink size={11} />
        </Link>
      </motion.div>
    </div>
  );
}
