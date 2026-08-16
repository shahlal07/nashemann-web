"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { Plus, Trash2, Wallet, Upload } from "lucide-react";
import { TiltCard } from "@/components/public/TiltCard";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { createClient } from "@/lib/supabase/client";
import { useVendorSessionContext } from "@/lib/vendor-session-context";

type PaymentMethod = {
  id: string;
  method: "easypaisa" | "jazzcash" | "bank";
  account_name: string;
  account_number: string;
  qr_code_url: string | null;
  active: boolean;
};

const PM_COLUMNS = "id, method, account_name, account_number, qr_code_url, active";

const INPUT_CLASS =
  "w-full rounded-[var(--radius-sm)] border border-[var(--border)] bg-[var(--surface)] px-3.5 py-2.5 text-sm text-[var(--text)] outline-none placeholder:text-[var(--text-faint)] focus:border-[var(--accent-violet)]";
const LABEL_CLASS = "mb-1.5 block text-xs font-medium text-[var(--text-muted)]";

const METHOD_LABEL: Record<PaymentMethod["method"], string> = {
  easypaisa: "EasyPaisa",
  jazzcash: "JazzCash",
  bank: "Bank transfer",
};

async function uploadQrCode(file: File, vendorId: string): Promise<string | null> {
  const supabase = createClient();
  const ext = file.name.split(".").pop() || "jpg";
  const path = `payment-qr/${vendorId}/${Date.now()}-${Math.random().toString(36).slice(2, 8)}.${ext}`;
  const { error } = await supabase.storage.from("storefront-uploads").upload(path, file);
  if (error) return null;
  const { data } = supabase.storage.from("storefront-uploads").getPublicUrl(path);
  return data.publicUrl;
}

export default function VendorPaymentPage() {
  const { state } = useVendorSessionContext();
  const [methods, setMethods] = useState<PaymentMethod[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ method: "easypaisa" as PaymentMethod["method"], account_name: "", account_number: "", qr_code_url: "" as string | null });
  const [uploading, setUploading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function loadMethods(vendorId: string) {
    const supabase = createClient();
    const { data } = await supabase.from("vendor_payment_methods").select(PM_COLUMNS).eq("vendor_id", vendorId).order("created_at", { ascending: false });
    setMethods((data ?? []) as PaymentMethod[]);
  }

  useEffect(() => {
    if (state.status !== "ready") return;
    let active = true;
    (async () => {
      const supabase = createClient();
      const { data } = await supabase.from("vendor_payment_methods").select(PM_COLUMNS).eq("vendor_id", state.vendor.id).order("created_at", { ascending: false });
      if (active) setMethods((data ?? []) as PaymentMethod[]);
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

  async function handleQrChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    const url = await uploadQrCode(file, vendorId);
    setUploading(false);
    if (!url) {
      setError("QR code upload failed. Try a smaller file.");
      return;
    }
    setForm((f) => ({ ...f, qr_code_url: url }));
  }

  async function handleCreate(e: React.FormEvent) {
    e.preventDefault();
    if (!form.account_name.trim() || !form.account_number.trim()) {
      setError("Account name and number are required");
      return;
    }
    setSaving(true);
    setError(null);
    const supabase = createClient();
    const { error: insertError } = await supabase.from("vendor_payment_methods").insert({
      vendor_id: vendorId,
      method: form.method,
      account_name: form.account_name.trim(),
      account_number: form.account_number.trim(),
      qr_code_url: form.qr_code_url || null,
      active: true,
    });
    setSaving(false);
    if (insertError) {
      setError(insertError.message);
      return;
    }
    setForm({ method: "easypaisa", account_name: "", account_number: "", qr_code_url: "" });
    setShowForm(false);
    loadMethods(vendorId);
  }

  async function toggleActive(pm: PaymentMethod) {
    const supabase = createClient();
    await supabase.from("vendor_payment_methods").update({ active: !pm.active }).eq("id", pm.id).eq("vendor_id", vendorId);
    loadMethods(vendorId);
  }

  async function deleteMethod(pm: PaymentMethod) {
    if (!confirm(`Remove ${METHOD_LABEL[pm.method]} · ${pm.account_number}?`)) return;
    const supabase = createClient();
    await supabase.from("vendor_payment_methods").delete().eq("id", pm.id).eq("vendor_id", vendorId);
    loadMethods(vendorId);
  }

  return (
    <div className="mx-auto max-w-3xl px-5 py-8 lg:py-10">
      <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }} className="flex items-center justify-between">
        <div>
          <h1 className="font-display text-2xl font-semibold text-[var(--text)]">Payment methods</h1>
          <p className="mt-1 text-sm text-[var(--text-muted)]">EasyPaisa, JazzCash or bank details customers pay to at checkout.</p>
        </div>
        <Button variant="primary" onClick={() => setShowForm((v) => !v)}>
          <Plus size={14} /> Add method
        </Button>
      </motion.div>

      {showForm && (
        <motion.form initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }} onSubmit={handleCreate} className="mt-5">
          <TiltCard strength={1} glare={false} className="space-y-4 p-6">
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div>
                <label className={LABEL_CLASS}>Method</label>
                <select className={INPUT_CLASS} value={form.method} onChange={(e) => setForm((f) => ({ ...f, method: e.target.value as PaymentMethod["method"] }))}>
                  <option value="easypaisa">EasyPaisa</option>
                  <option value="jazzcash">JazzCash</option>
                  <option value="bank">Bank transfer</option>
                </select>
              </div>
              <div>
                <label className={LABEL_CLASS}>Account name</label>
                <input className={INPUT_CLASS} value={form.account_name} onChange={(e) => setForm((f) => ({ ...f, account_name: e.target.value }))} maxLength={120} required />
              </div>
              <div>
                <label className={LABEL_CLASS}>Account number</label>
                <input className={INPUT_CLASS} value={form.account_number} onChange={(e) => setForm((f) => ({ ...f, account_number: e.target.value }))} placeholder="03xx-xxxxxxx" required />
              </div>
              <div>
                <label className={LABEL_CLASS}>QR code (optional)</label>
                <div className="flex items-center gap-3">
                  {form.qr_code_url && (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={form.qr_code_url} alt="" className="h-10 w-10 rounded-[var(--radius-sm)] border border-[var(--border)] object-cover" />
                  )}
                  <label className="inline-flex cursor-pointer items-center gap-1.5 rounded-[var(--radius-sm)] border border-[var(--border-strong)] bg-[var(--surface)] px-3 py-2 text-xs font-semibold text-[var(--text)] hover:bg-[var(--surface-hover)]">
                    <Upload size={13} /> {uploading ? "Uploading…" : "Upload"}
                    <input type="file" accept="image/*" className="hidden" onChange={handleQrChange} disabled={uploading} />
                  </label>
                </div>
              </div>
            </div>
            {error && <p className="text-sm text-[var(--danger)]">{error}</p>}
            <div className="flex gap-3">
              <Button type="submit" variant="primary" disabled={saving || uploading}>
                {saving ? "Saving…" : "Add method"}
              </Button>
              <Button type="button" variant="ghost" onClick={() => setShowForm(false)}>
                Cancel
              </Button>
            </div>
          </TiltCard>
        </motion.form>
      )}

      <div className="mt-6 space-y-2">
        {methods.map((pm) => (
          <TiltCard key={pm.id} strength={1} glare={false} className="flex items-center justify-between p-4">
            <div className="flex items-center gap-3">
              <div className="flex h-9 w-9 items-center justify-center rounded-lg" style={{ background: "rgba(139,107,255,0.14)", color: "var(--accent-violet)" }}>
                <Wallet size={15} />
              </div>
              <div>
                <p className="text-sm font-semibold text-[var(--text)]">{METHOD_LABEL[pm.method]}</p>
                <p className="text-xs text-[var(--text-faint)]">
                  {pm.account_name} · {pm.account_number}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <button onClick={() => toggleActive(pm)} className="cursor-pointer">
                <Badge tone={pm.active ? "success" : "neutral"} dot>
                  {pm.active ? "Active" : "Hidden"}
                </Badge>
              </button>
              <button onClick={() => deleteMethod(pm)} className="rounded-full p-2 text-[var(--text-faint)] hover:bg-[var(--danger-bg)] hover:text-[var(--danger)]" aria-label="Remove payment method">
                <Trash2 size={14} />
              </button>
            </div>
          </TiltCard>
        ))}
        {methods.length === 0 && !showForm && (
          <TiltCard strength={0} glare={false} className="p-8 text-center">
            <p className="text-sm text-[var(--text-faint)]">No payment methods yet — add one so customers can pay you at checkout.</p>
          </TiltCard>
        )}
      </div>
    </div>
  );
}
