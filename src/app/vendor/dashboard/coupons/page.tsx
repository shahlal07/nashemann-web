"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { Plus, Trash2, Ticket } from "lucide-react";
import { TiltCard } from "@/components/public/TiltCard";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { createClient } from "@/lib/supabase/client";
import { useVendorSessionContext } from "@/lib/vendor-session-context";
import { formatDate } from "@/lib/utils";

type Coupon = {
  id: string;
  code: string;
  discount_type: "percent" | "fixed" | "free_shipping";
  discount_value: number;
  min_order_amount: number;
  max_uses: number | null;
  used_count: number;
  active: boolean;
  starts_at: string | null;
  expires_at: string | null;
};

const INPUT_CLASS =
  "w-full rounded-[var(--radius-sm)] border border-[var(--border)] bg-[var(--surface)] px-3.5 py-2.5 text-sm text-[var(--text)] outline-none placeholder:text-[var(--text-faint)] focus:border-[var(--accent-violet)]";
const LABEL_CLASS = "mb-1.5 block text-xs font-medium text-[var(--text-muted)]";

export default function VendorCouponsPage() {
  const { state } = useVendorSessionContext();
  const [coupons, setCoupons] = useState<Coupon[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ code: "", discount_type: "percent", discount_value: "10", min_order_amount: "0", max_uses: "", expires_at: "" });
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  async function loadCoupons(vendorId: string) {
    const supabase = createClient();
    const { data } = await supabase
      .from("coupons")
      .select("id, code, discount_type, discount_value, min_order_amount, max_uses, used_count, active, starts_at, expires_at")
      .eq("vendor_id", vendorId)
      .eq("scope", "vendor")
      .order("created_at", { ascending: false });
    setCoupons((data ?? []) as Coupon[]);
  }

  useEffect(() => {
    if (state.status !== "ready") return;
    let active = true;
    (async () => {
      const vendorId = state.vendor.id;
      const supabase = createClient();
      const { data } = await supabase
        .from("coupons")
        .select("id, code, discount_type, discount_value, min_order_amount, max_uses, used_count, active, starts_at, expires_at")
        .eq("vendor_id", vendorId)
        .eq("scope", "vendor")
        .order("created_at", { ascending: false });
      if (active) setCoupons((data ?? []) as Coupon[]);
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

  async function handleCreate(e: React.FormEvent) {
    e.preventDefault();
    if (!form.code.trim()) {
      setError("Coupon code is required");
      return;
    }
    setSaving(true);
    setError(null);
    const supabase = createClient();
    const { error: insertError } = await supabase.from("coupons").insert({
      code: form.code.trim().toUpperCase(),
      scope: "vendor",
      vendor_id: vendorId,
      discount_type: form.discount_type,
      discount_value: form.discount_type === "free_shipping" ? 0 : Number(form.discount_value) || 0,
      min_order_amount: Number(form.min_order_amount) || 0,
      max_uses: form.max_uses ? Number(form.max_uses) : null,
      expires_at: form.expires_at ? new Date(form.expires_at).toISOString() : null,
      active: true,
    });
    setSaving(false);
    if (insertError) {
      setError(insertError.message.includes("duplicate") ? "That coupon code is already in use." : insertError.message);
      return;
    }
    setForm({ code: "", discount_type: "percent", discount_value: "10", min_order_amount: "0", max_uses: "", expires_at: "" });
    setShowForm(false);
    loadCoupons(vendorId);
  }

  async function toggleActive(coupon: Coupon) {
    const supabase = createClient();
    await supabase.from("coupons").update({ active: !coupon.active }).eq("id", coupon.id).eq("vendor_id", vendorId);
    loadCoupons(vendorId);
  }

  async function deleteCoupon(coupon: Coupon) {
    const supabase = createClient();
    await supabase.from("coupons").delete().eq("id", coupon.id).eq("vendor_id", vendorId);
    loadCoupons(vendorId);
  }

  return (
    <div className="mx-auto max-w-3xl px-5 py-8 lg:py-10">
      <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }} className="flex items-center justify-between">
        <div>
          <h1 className="font-display text-2xl font-semibold text-[var(--text)]">Coupons</h1>
          <p className="mt-1 text-sm text-[var(--text-muted)]">Discount codes scoped to your store only. Platform-wide coupons are managed by Nashemann.</p>
        </div>
        <Button variant="primary" onClick={() => setShowForm((v) => !v)}>
          <Plus size={14} /> New coupon
        </Button>
      </motion.div>

      {showForm && (
        <motion.form initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }} onSubmit={handleCreate} className="mt-5">
          <TiltCard strength={1} glare={false} className="space-y-4 p-6">
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div>
                <label className={LABEL_CLASS}>Code</label>
                <input className={INPUT_CLASS} value={form.code} onChange={(e) => setForm((f) => ({ ...f, code: e.target.value }))} placeholder="SAVE20" maxLength={40} required />
              </div>
              <div>
                <label className={LABEL_CLASS}>Discount type</label>
                <select className={INPUT_CLASS} value={form.discount_type} onChange={(e) => setForm((f) => ({ ...f, discount_type: e.target.value }))}>
                  <option value="percent">Percent off</option>
                  <option value="fixed">Fixed amount off</option>
                  <option value="free_shipping">Free shipping</option>
                </select>
              </div>
              {form.discount_type !== "free_shipping" && (
                <div>
                  <label className={LABEL_CLASS}>{form.discount_type === "percent" ? "Percent value" : "Amount (Rs)"}</label>
                  <input type="number" min={0} className={INPUT_CLASS} value={form.discount_value} onChange={(e) => setForm((f) => ({ ...f, discount_value: e.target.value }))} />
                </div>
              )}
              <div>
                <label className={LABEL_CLASS}>Minimum order (Rs)</label>
                <input type="number" min={0} className={INPUT_CLASS} value={form.min_order_amount} onChange={(e) => setForm((f) => ({ ...f, min_order_amount: e.target.value }))} />
              </div>
              <div>
                <label className={LABEL_CLASS}>Max uses (optional)</label>
                <input type="number" min={1} className={INPUT_CLASS} value={form.max_uses} onChange={(e) => setForm((f) => ({ ...f, max_uses: e.target.value }))} placeholder="Unlimited" />
              </div>
              <div>
                <label className={LABEL_CLASS}>Expires on (optional)</label>
                <input type="date" className={INPUT_CLASS} value={form.expires_at} onChange={(e) => setForm((f) => ({ ...f, expires_at: e.target.value }))} />
              </div>
            </div>
            {error && <p className="text-sm text-[var(--danger)]">{error}</p>}
            <div className="flex gap-3">
              <Button type="submit" variant="primary" disabled={saving}>
                {saving ? "Creating…" : "Create coupon"}
              </Button>
              <Button type="button" variant="ghost" onClick={() => setShowForm(false)}>
                Cancel
              </Button>
            </div>
          </TiltCard>
        </motion.form>
      )}

      <div className="mt-6 space-y-2">
        {coupons.map((c) => (
          <TiltCard key={c.id} strength={1} glare={false} className="flex items-center justify-between p-4">
            <div className="flex items-center gap-3">
              <div className="flex h-9 w-9 items-center justify-center rounded-lg" style={{ background: "rgba(139,107,255,0.14)", color: "var(--accent-violet)" }}>
                <Ticket size={15} />
              </div>
              <div>
                <p className="font-display text-sm font-semibold tracking-wide text-[var(--text)]">{c.code}</p>
                <p className="text-xs text-[var(--text-faint)]">
                  {c.discount_type === "percent" ? `${c.discount_value}% off` : c.discount_type === "fixed" ? `Rs ${c.discount_value} off` : "Free shipping"}
                  {" · "}
                  {c.used_count} used{c.max_uses ? ` of ${c.max_uses}` : ""}
                  {c.expires_at ? ` · expires ${formatDate(c.expires_at)}` : ""}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <button onClick={() => toggleActive(c)} className="cursor-pointer">
                <Badge tone={c.active ? "success" : "neutral"} dot>
                  {c.active ? "Active" : "Paused"}
                </Badge>
              </button>
              <button onClick={() => deleteCoupon(c)} className="rounded-full p-2 text-[var(--text-faint)] hover:bg-[var(--danger-bg)] hover:text-[var(--danger)]" aria-label="Delete coupon">
                <Trash2 size={14} />
              </button>
            </div>
          </TiltCard>
        ))}
        {coupons.length === 0 && !showForm && (
          <TiltCard strength={0} glare={false} className="p-8 text-center">
            <p className="text-sm text-[var(--text-faint)]">No coupons yet — create one to run your own promotions.</p>
          </TiltCard>
        )}
      </div>
    </div>
  );
}
