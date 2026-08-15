"use client";

import { useMemo, useState } from "react";
import { motion } from "framer-motion";
import Link from "next/link";
import { Calculator, Package, CalendarDays, TrendingDown, Info } from "lucide-react";
import {
  Line,
  LineChart,
  ResponsiveContainer,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  ReferenceLine,
} from "recharts";
import { TiltCard } from "@/components/public/TiltCard";
import { Card } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { StatCard } from "@/components/ui/StatCard";
import { formatPKR, cn } from "@/lib/utils";

const PER_ORDER_RATE = 15;
const MONTHLY_FLAT_FEE = 7000;
const BREAKEVEN_ORDERS = Math.round(MONTHLY_FLAT_FEE / PER_ORDER_RATE);
const MAX_ORDERS = 3000;
const DEFAULT_ORDERS = 300;

function fadeUpProps(delay = 0) {
  return {
    initial: { opacity: 0, y: 20 },
    whileInView: { opacity: 1, y: 0 },
    viewport: { once: true, margin: "-60px" },
    transition: { duration: 0.5, delay },
  };
}

function buildChartData(orders: number) {
  const domainMax = Math.max(1200, Math.round(orders * 1.4));
  const steps = 24;
  const stepSize = domainMax / steps;
  return Array.from({ length: steps + 1 }, (_, i) => {
    const x = Math.round(i * stepSize);
    return {
      orders: x,
      payPerOrder: x * PER_ORDER_RATE,
      monthly: MONTHLY_FLAT_FEE,
    };
  });
}

export function PricingCalculatorClient() {
  const [orders, setOrders] = useState(DEFAULT_ORDERS);

  const payPerOrderCost = orders * PER_ORDER_RATE;
  const monthlyCost = MONTHLY_FLAT_FEE;
  const cheaperPlan = payPerOrderCost === monthlyCost ? "tie" : payPerOrderCost < monthlyCost ? "payPerOrder" : "monthly";
  const savings = Math.abs(payPerOrderCost - monthlyCost);

  const chartData = useMemo(() => buildChartData(orders), [orders]);

  function handleOrdersChange(value: number) {
    if (Number.isNaN(value)) {
      setOrders(0);
      return;
    }
    setOrders(Math.min(Math.max(Math.round(value), 0), MAX_ORDERS));
  }

  return (
    <div className="mx-auto max-w-6xl px-5 py-16 lg:px-8 lg:py-24">
      <motion.div {...fadeUpProps()} className="mx-auto max-w-2xl text-center">
        <div className="mx-auto mb-4 flex h-11 w-11 items-center justify-center rounded-xl" style={{ background: "rgba(139,107,255,0.14)" }}>
          <Calculator size={20} className="text-[var(--accent-violet)]" />
        </div>
        <h1 className="font-display text-4xl font-semibold tracking-tight text-[var(--text)] sm:text-5xl">
          Pricing <span className="accent-text">calculator</span>.
        </h1>
        <p className="mt-4 text-lg text-[var(--text-muted)]">
          Tell us your expected monthly order volume — we&apos;ll work out which plan actually costs less.
        </p>
      </motion.div>

      <motion.div {...fadeUpProps(0.1)} className="mx-auto mt-12 max-w-3xl">
        <TiltCard strength={4} className="p-6 sm:p-8">
          <div className="flex items-center justify-between gap-4">
            <label htmlFor="orders-slider" className="text-sm font-semibold text-[var(--text)]">
              Estimated monthly orders
            </label>
            <input
              id="orders-number"
              type="number"
              min={0}
              max={MAX_ORDERS}
              value={orders}
              onChange={(e) => handleOrdersChange(Number(e.target.value))}
              className="w-28 rounded-[var(--radius-sm)] border border-[var(--border-strong)] bg-[var(--surface)] px-3 py-1.5 text-right text-sm font-semibold text-[var(--text)] focus:outline-none focus:ring-2 focus:ring-[var(--accent-violet)]"
            />
          </div>
          <input
            id="orders-slider"
            type="range"
            min={0}
            max={MAX_ORDERS}
            step={5}
            value={orders}
            onChange={(e) => handleOrdersChange(Number(e.target.value))}
            className="mt-5 h-1.5 w-full cursor-pointer appearance-none rounded-full bg-white/[0.08] accent-[#8b6bff]"
          />
          <div className="mt-2 flex items-center justify-between text-xs text-[var(--text-faint)]">
            <span>0 orders</span>
            <span>{MAX_ORDERS.toLocaleString("en-PK")} orders</span>
          </div>
        </TiltCard>
      </motion.div>

      <motion.div {...fadeUpProps(0.15)} className="mx-auto mt-6 grid max-w-3xl grid-cols-1 gap-4 sm:grid-cols-2">
        <StatCard label="Pay-Per-Order plan cost" value={payPerOrderCost} prefix="Rs " icon={Package} accent="violet" />
        <StatCard label="Monthly plan cost" value={monthlyCost} prefix="Rs " icon={CalendarDays} accent="amber" />
      </motion.div>

      <motion.div {...fadeUpProps(0.2)} className="mx-auto mt-6 max-w-3xl">
        <Card className="flex flex-col items-center gap-2 p-6 text-center sm:flex-row sm:justify-between sm:text-left">
          <div className="flex items-center gap-2">
            <TrendingDown size={18} className="shrink-0 text-[var(--success)]" />
            <p className="text-sm text-[var(--text)]">
              {cheaperPlan === "tie" && "Both plans cost exactly the same at this volume."}
              {cheaperPlan === "payPerOrder" && (
                <>
                  <strong className="font-semibold">Pay-Per-Order</strong> is cheaper at {orders.toLocaleString("en-PK")} orders/month.
                </>
              )}
              {cheaperPlan === "monthly" && (
                <>
                  <strong className="font-semibold">Monthly</strong> is cheaper at {orders.toLocaleString("en-PK")} orders/month.
                </>
              )}
            </p>
          </div>
          {cheaperPlan !== "tie" && (
            <Badge tone="success" dot>
              Save {formatPKR(savings)}/month
            </Badge>
          )}
        </Card>
      </motion.div>

      <motion.div {...fadeUpProps(0.25)} className="mx-auto mt-6 max-w-3xl">
        <TiltCard strength={2} glare={false} className="p-6">
          <div className="mb-4">
            <p className="text-sm font-semibold text-[var(--text)]">Cost vs. order volume</p>
            <p className="text-xs text-[var(--text-faint)]">
              The two plans cross at the breakeven point — {BREAKEVEN_ORDERS.toLocaleString("en-PK")} orders/month.
            </p>
          </div>
          <ResponsiveContainer width="100%" height={240}>
            <LineChart data={chartData} margin={{ left: -20, right: 10, top: 10 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.06)" vertical={false} />
              <XAxis
                dataKey="orders"
                tick={{ fill: "#66666f", fontSize: 12 }}
                axisLine={false}
                tickLine={false}
              />
              <YAxis
                tick={{ fill: "#66666f", fontSize: 12 }}
                axisLine={false}
                tickLine={false}
                tickFormatter={(v) => `${v / 1000}k`}
              />
              <Tooltip
                contentStyle={{ background: "#131318", border: "1px solid rgba(255,255,255,0.1)", borderRadius: 10, fontSize: 13 }}
                labelStyle={{ color: "#f3f3f6" }}
                labelFormatter={(v) => `${v} orders`}
                formatter={(v, name) => [formatPKR(Number(v)), name === "payPerOrder" ? "Pay-Per-Order" : "Monthly"]}
              />
              <ReferenceLine
                x={BREAKEVEN_ORDERS}
                stroke="#ffb020"
                strokeDasharray="4 4"
                label={{ value: "Breakeven", position: "insideTopLeft", fill: "#ffb020", fontSize: 11 }}
              />
              <ReferenceLine
                x={orders}
                stroke="#8b6bff"
                strokeDasharray="2 2"
                label={{ value: "You", position: "insideTopRight", fill: "#8b6bff", fontSize: 11 }}
              />
              <Line type="monotone" dataKey="payPerOrder" stroke="#8b6bff" strokeWidth={2.5} dot={false} />
              <Line type="monotone" dataKey="monthly" stroke="#ffb020" strokeWidth={2.5} dot={false} />
            </LineChart>
          </ResponsiveContainer>
        </TiltCard>
      </motion.div>

      <motion.div {...fadeUpProps(0.3)} className="mx-auto mt-6 max-w-3xl">
        <div className="glass-panel flex items-start gap-2 rounded-[var(--radius-lg)] p-4 text-xs text-[var(--text-faint)]">
          <Info size={14} className={cn("mt-0.5 shrink-0 text-[var(--text-faint)]")} />
          <p>
            Rates shown (Rs {PER_ORDER_RATE}/order, {formatPKR(MONTHLY_FLAT_FEE)}/month) are Nashemann&apos;s current published rates and are
            subject to change. See the{" "}
            <Link href="/pricing" className="font-medium text-[var(--accent-violet)] hover:underline">
              full pricing page
            </Link>{" "}
            for the latest.
          </p>
        </div>
      </motion.div>
    </div>
  );
}
