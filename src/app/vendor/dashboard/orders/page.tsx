"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { ShoppingBag, Phone, MapPin, Image as ImageIcon } from "lucide-react";
import { TiltCard } from "@/components/public/TiltCard";
import { Badge } from "@/components/ui/Badge";
import { createClient } from "@/lib/supabase/client";
import { useVendorSessionContext } from "@/lib/vendor-session-context";
import { formatPKR, formatDateTime } from "@/lib/utils";

type OrderItem = {
  productId: string;
  name: string;
  qty: number;
  unitPrice: number;
  selectedOptions: { groupName: string; choices: string[]; extraCharge: number }[];
  lineTotal: number;
};

type OrderStatus = "pending" | "confirmed" | "fulfilled" | "cancelled";

type Order = {
  id: string;
  customer_name: string;
  customer_phone: string;
  customer_address: string;
  customer_email: string | null;
  items: OrderItem[];
  total_amount: number;
  payment_method: string;
  payment_screenshot_url: string | null;
  status: OrderStatus;
  created_at: string;
};

const ORDER_COLUMNS =
  "id, customer_name, customer_phone, customer_address, customer_email, items, total_amount, payment_method, payment_screenshot_url, status, created_at";

const STATUS_TONE: Record<OrderStatus, "warning" | "info" | "success" | "danger"> = {
  pending: "warning",
  confirmed: "info",
  fulfilled: "success",
  cancelled: "danger",
};

const STATUS_FLOW: Record<OrderStatus, OrderStatus | null> = {
  pending: "confirmed",
  confirmed: "fulfilled",
  fulfilled: null,
  cancelled: null,
};

const STATUS_LABEL: Record<OrderStatus, string> = {
  pending: "Pending",
  confirmed: "Confirmed",
  fulfilled: "Fulfilled",
  cancelled: "Cancelled",
};

function OrderCard({ order, onAdvance, onCancel }: { order: Order; onAdvance: (o: Order) => void; onCancel: (o: Order) => void }) {
  const next = STATUS_FLOW[order.status];
  return (
    <TiltCard strength={1} glare={false} className="space-y-4 p-5">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <p className="text-sm font-semibold text-[var(--text)]">{order.customer_name}</p>
          <p className="mt-0.5 flex items-center gap-1.5 text-xs text-[var(--text-faint)]">
            <Phone size={11} /> {order.customer_phone}
          </p>
          <p className="mt-0.5 flex items-start gap-1.5 text-xs text-[var(--text-faint)]">
            <MapPin size={11} className="mt-0.5 shrink-0" /> {order.customer_address}
          </p>
        </div>
        <div className="text-right">
          <Badge tone={STATUS_TONE[order.status]} dot>
            {STATUS_LABEL[order.status]}
          </Badge>
          <p className="mt-1.5 text-xs text-[var(--text-faint)]">{formatDateTime(order.created_at)}</p>
        </div>
      </div>

      <div className="space-y-1.5 border-t border-[var(--border)] pt-3">
        {order.items.map((item, i) => (
          <div key={i} className="flex items-start justify-between text-xs">
            <div>
              <span className="text-[var(--text)]">
                {item.qty}× {item.name}
              </span>
              {item.selectedOptions?.length > 0 && (
                <p className="mt-0.5 text-[var(--text-faint)]">
                  {item.selectedOptions.map((o) => `${o.groupName}: ${o.choices.join(", ")}`).join(" · ")}
                </p>
              )}
            </div>
            <span className="shrink-0 text-[var(--text-muted)]">{formatPKR(item.lineTotal)}</span>
          </div>
        ))}
        <div className="flex items-center justify-between border-t border-[var(--border)] pt-2 text-sm font-semibold text-[var(--text)]">
          <span>Total ({order.payment_method})</span>
          <span>{formatPKR(order.total_amount)}</span>
        </div>
      </div>

      {order.payment_screenshot_url ? (
        <a href={order.payment_screenshot_url} target="_blank" rel="noreferrer" className="block">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={order.payment_screenshot_url} alt="Payment screenshot" className="h-32 w-full rounded-[var(--radius-sm)] border border-[var(--border)] object-cover" />
        </a>
      ) : (
        <div className="flex h-16 items-center justify-center gap-1.5 rounded-[var(--radius-sm)] border border-dashed border-[var(--border)] text-xs text-[var(--text-faint)]">
          <ImageIcon size={13} /> No payment screenshot
        </div>
      )}

      {order.status !== "cancelled" && order.status !== "fulfilled" && (
        <div className="flex gap-2 pt-1">
          {next && (
            <button
              onClick={() => onAdvance(order)}
              className="flex-1 rounded-[var(--radius-sm)] px-3.5 py-2 text-xs font-semibold text-black"
              style={{ background: "var(--accent-gradient)" }}
            >
              Mark as {STATUS_LABEL[next]}
            </button>
          )}
          <button
            onClick={() => onCancel(order)}
            className="rounded-[var(--radius-sm)] border border-[rgba(251,113,133,0.3)] bg-[var(--danger-bg)] px-3.5 py-2 text-xs font-semibold text-[var(--danger)] hover:bg-[rgba(251,113,133,0.18)]"
          >
            Cancel
          </button>
        </div>
      )}
    </TiltCard>
  );
}

export default function VendorOrdersPage() {
  const { state } = useVendorSessionContext();
  const [orders, setOrders] = useState<Order[]>([]);
  const [filter, setFilter] = useState<"all" | OrderStatus>("all");

  async function loadOrders(vendorId: string) {
    const supabase = createClient();
    const { data } = await supabase.from("storefront_orders").select(ORDER_COLUMNS).eq("vendor_id", vendorId).order("created_at", { ascending: false });
    setOrders((data ?? []) as Order[]);
  }

  useEffect(() => {
    if (state.status !== "ready") return;
    let active = true;
    (async () => {
      const supabase = createClient();
      const { data } = await supabase.from("storefront_orders").select(ORDER_COLUMNS).eq("vendor_id", state.vendor.id).order("created_at", { ascending: false });
      if (active) setOrders((data ?? []) as Order[]);
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

  const vendorId = state.vendor.id;

  async function updateStatus(order: Order, status: OrderStatus) {
    const supabase = createClient();
    await supabase.from("storefront_orders").update({ status }).eq("id", order.id).eq("vendor_id", vendorId);
    loadOrders(vendorId);
  }

  const visibleOrders = filter === "all" ? orders : orders.filter((o) => o.status === filter);

  return (
    <div className="mx-auto max-w-3xl px-5 py-8 lg:py-10">
      <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
        <h1 className="font-display text-2xl font-semibold text-[var(--text)]">Orders</h1>
        <p className="mt-1 text-sm text-[var(--text-muted)]">Orders placed on your storefront, with customer details and payment proof.</p>
      </motion.div>

      <div className="mt-5 flex flex-wrap gap-1.5">
        {(["all", "pending", "confirmed", "fulfilled", "cancelled"] as const).map((f) => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            className="rounded-full border px-3 py-1.5 text-xs font-semibold transition-colors"
            style={
              filter === f
                ? { background: "var(--accent-gradient)", color: "black", borderColor: "transparent" }
                : { borderColor: "var(--border-strong)", color: "var(--text-muted)" }
            }
          >
            {f === "all" ? "All" : STATUS_LABEL[f]}
          </button>
        ))}
      </div>

      <div className="mt-5 space-y-3">
        {visibleOrders.map((order) => (
          <OrderCard
            key={order.id}
            order={order}
            onAdvance={(o) => {
              const next = STATUS_FLOW[o.status];
              if (next) updateStatus(o, next);
            }}
            onCancel={(o) => updateStatus(o, "cancelled")}
          />
        ))}
        {visibleOrders.length === 0 && (
          <TiltCard strength={0} glare={false} className="flex flex-col items-center gap-2 p-10 text-center">
            <ShoppingBag size={20} className="text-[var(--text-faint)]" />
            <p className="text-sm text-[var(--text-faint)]">No orders {filter !== "all" ? `with status "${STATUS_LABEL[filter]}"` : "yet"}.</p>
          </TiltCard>
        )}
      </div>
    </div>
  );
}
