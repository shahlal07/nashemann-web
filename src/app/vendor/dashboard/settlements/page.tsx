"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { Wallet, ChevronDown, ChevronUp, Receipt } from "lucide-react";
import { TiltCard } from "@/components/public/TiltCard";
import { StatCard } from "@/components/ui/StatCard";
import { Badge } from "@/components/ui/Badge";
import { createClient } from "@/lib/supabase/client";
import { useVendorSessionContext } from "@/lib/vendor-session-context";
import { formatPKR, formatDate } from "@/lib/utils";

type Settlement = {
  id: string;
  month: string;
  orders_count: number;
  gross_revenue: number;
  platform_fee: number;
  status: "pending" | "partially_paid" | "paid" | "waived" | "reversed";
  amount_paid: number;
  due_date: string | null;
  waived_reason: string | null;
  reversed_reason: string | null;
};

type Payment = {
  id: string;
  settlement_id: string;
  amount: number;
  method: string;
  reference: string;
  notes: string;
  paid_at: string;
};

const STATUS_TONE = {
  pending: "warning",
  partially_paid: "info",
  paid: "success",
  waived: "neutral",
  reversed: "danger",
} as const;

const MONTH_LABEL = new Intl.DateTimeFormat("en-PK", { month: "long", year: "numeric" });

export default function VendorSettlementsPage() {
  const { state } = useVendorSessionContext();
  const [settlements, setSettlements] = useState<Settlement[]>([]);
  const [payments, setPayments] = useState<Payment[]>([]);
  const [expanded, setExpanded] = useState<string | null>(null);

  useEffect(() => {
    if (state.status !== "ready") return;
    let active = true;
    (async () => {
      const supabase = createClient();
      const { data: settlementRows } = await supabase
        .from("settlements")
        .select("id, month, orders_count, gross_revenue, platform_fee, status, amount_paid, due_date, waived_reason, reversed_reason")
        .eq("vendor_id", state.vendor.id)
        .order("month", { ascending: false });
      if (!active) return;
      const rows = (settlementRows ?? []) as Settlement[];
      setSettlements(rows);

      if (rows.length > 0) {
        const { data: paymentRows } = await supabase
          .from("settlement_payments")
          .select("id, settlement_id, amount, method, reference, notes, paid_at")
          .in("settlement_id", rows.map((r) => r.id))
          .order("paid_at", { ascending: false });
        if (active) setPayments((paymentRows ?? []) as Payment[]);
      }
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

  const totalOwed = settlements.reduce((sum, s) => (s.status === "waived" || s.status === "reversed" ? sum : sum + (Number(s.platform_fee) - Number(s.amount_paid))), 0);
  const totalPaid = settlements.reduce((sum, s) => sum + Number(s.amount_paid), 0);
  const lifetimeFees = settlements.reduce((sum, s) => sum + Number(s.platform_fee), 0);

  return (
    <div className="mx-auto max-w-4xl px-5 py-8 lg:py-10">
      <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
        <h1 className="font-display text-2xl font-semibold text-[var(--text)]">Settlements</h1>
        <p className="mt-1 text-sm text-[var(--text-muted)]">Your platform-fee balance and full payment history with Nashemann.</p>
      </motion.div>

      <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-3">
        <StatCard label="Currently owed" value={Math.max(0, totalOwed)} prefix="Rs " icon={Wallet} accent={totalOwed > 0 ? "amber" : "violet"} />
        <StatCard label="Total paid to date" value={totalPaid} prefix="Rs " icon={Receipt} />
        <StatCard label="Lifetime platform fees" value={lifetimeFees} prefix="Rs " icon={Wallet} />
      </div>

      <div className="mt-6 space-y-3">
        {settlements.map((s) => {
          const balance = Number(s.platform_fee) - Number(s.amount_paid);
          const settlementPayments = payments.filter((p) => p.settlement_id === s.id);
          const isOpen = expanded === s.id;
          return (
            <TiltCard key={s.id} strength={1} glare={false} className="p-0">
              <button
                onClick={() => setExpanded(isOpen ? null : s.id)}
                className="flex w-full items-center justify-between gap-4 p-5 text-left"
              >
                <div>
                  <p className="text-sm font-semibold text-[var(--text)]">{MONTH_LABEL.format(new Date(s.month))}</p>
                  <p className="mt-0.5 text-xs text-[var(--text-faint)]">
                    {s.orders_count} orders · {formatPKR(Number(s.gross_revenue))} revenue
                    {s.due_date && s.status !== "paid" && s.status !== "waived" ? ` · due ${formatDate(s.due_date)}` : ""}
                  </p>
                </div>
                <div className="flex items-center gap-3">
                  <div className="text-right">
                    <p className="text-sm font-semibold text-[var(--text)]">{formatPKR(Number(s.platform_fee))}</p>
                    <Badge tone={STATUS_TONE[s.status]} dot>
                      {s.status.replace("_", " ")}
                    </Badge>
                  </div>
                  {isOpen ? <ChevronUp size={16} className="text-[var(--text-faint)]" /> : <ChevronDown size={16} className="text-[var(--text-faint)]" />}
                </div>
              </button>
              {isOpen && (
                <div className="border-t border-[var(--border)] p-5">
                  <div className="grid grid-cols-2 gap-3 text-xs sm:grid-cols-4">
                    <div>
                      <p className="text-[var(--text-faint)]">Platform fee</p>
                      <p className="mt-0.5 font-medium text-[var(--text)]">{formatPKR(Number(s.platform_fee))}</p>
                    </div>
                    <div>
                      <p className="text-[var(--text-faint)]">Paid so far</p>
                      <p className="mt-0.5 font-medium text-[var(--text)]">{formatPKR(Number(s.amount_paid))}</p>
                    </div>
                    <div>
                      <p className="text-[var(--text-faint)]">Balance</p>
                      <p className="mt-0.5 font-medium text-[var(--text)]">{formatPKR(Math.max(0, balance))}</p>
                    </div>
                    <div>
                      <p className="text-[var(--text-faint)]">Due date</p>
                      <p className="mt-0.5 font-medium text-[var(--text)]">{formatDate(s.due_date)}</p>
                    </div>
                  </div>
                  {s.waived_reason && <p className="mt-3 text-xs text-[var(--text-muted)]">Waived: {s.waived_reason}</p>}
                  {s.reversed_reason && <p className="mt-3 text-xs text-[var(--text-muted)]">Reversed: {s.reversed_reason}</p>}

                  <p className="mb-2 mt-4 text-xs font-semibold text-[var(--text-muted)]">Payment history</p>
                  {settlementPayments.length === 0 ? (
                    <p className="text-xs text-[var(--text-faint)]">No payments recorded yet for this month.</p>
                  ) : (
                    <div className="divide-y divide-[var(--border)]">
                      {settlementPayments.map((p) => (
                        <div key={p.id} className="flex items-center justify-between py-2 text-xs">
                          <div>
                            <p className="font-medium text-[var(--text)]">{formatPKR(Number(p.amount))}</p>
                            <p className="text-[var(--text-faint)]">
                              {p.method.replace("_", " ")}
                              {p.reference ? ` · ${p.reference}` : ""}
                            </p>
                          </div>
                          <p className="text-[var(--text-faint)]">{formatDate(p.paid_at)}</p>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </TiltCard>
          );
        })}
        {settlements.length === 0 && (
          <TiltCard strength={0} glare={false} className="p-8 text-center">
            <p className="text-sm text-[var(--text-faint)]">No settlements recorded yet.</p>
          </TiltCard>
        )}
      </div>
    </div>
  );
}
