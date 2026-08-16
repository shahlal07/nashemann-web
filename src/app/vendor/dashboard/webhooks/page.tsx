"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { Plus, Trash2, Webhook } from "lucide-react";
import { TiltCard } from "@/components/public/TiltCard";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { createClient } from "@/lib/supabase/client";
import { useVendorSessionContext } from "@/lib/vendor-session-context";
import { timeAgo } from "@/lib/utils";

type WebhookRow = {
  id: string;
  url: string;
  event_type: string;
  active: boolean;
  created_at: string;
  last_triggered_at: string | null;
  last_status_code: number | null;
};

const INPUT_CLASS =
  "w-full rounded-[var(--radius-sm)] border border-[var(--border)] bg-[var(--surface)] px-3.5 py-2.5 text-sm text-[var(--text)] outline-none placeholder:text-[var(--text-faint)] focus:border-[var(--accent-violet)]";
const LABEL_CLASS = "mb-1.5 block text-xs font-medium text-[var(--text-muted)]";

function randomSecret() {
  const bytes = new Uint8Array(24);
  crypto.getRandomValues(bytes);
  return btoa(String.fromCharCode(...bytes)).replace(/[+/=]/g, "").slice(0, 32);
}

export default function VendorWebhooksPage() {
  const { state } = useVendorSessionContext();
  const [hooks, setHooks] = useState<WebhookRow[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [url, setUrl] = useState("");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function loadHooks(vendorId: string) {
    const supabase = createClient();
    const { data } = await supabase
      .from("webhook_subscriptions")
      .select("id, url, event_type, active, created_at, last_triggered_at, last_status_code")
      .eq("vendor_id", vendorId)
      .order("created_at", { ascending: false });
    setHooks((data ?? []) as WebhookRow[]);
  }

  useEffect(() => {
    if (state.status !== "ready") return;
    let active = true;
    (async () => {
      const supabase = createClient();
      const { data } = await supabase
        .from("webhook_subscriptions")
        .select("id, url, event_type, active, created_at, last_triggered_at, last_status_code")
        .eq("vendor_id", state.vendor.id)
        .order("created_at", { ascending: false });
      if (active) setHooks((data ?? []) as WebhookRow[]);
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
    if (!url.trim() || !/^https:\/\//.test(url.trim())) {
      setError("Enter a valid https:// URL");
      return;
    }
    setSaving(true);
    setError(null);
    const supabase = createClient();
    const { error: insertError } = await supabase.from("webhook_subscriptions").insert({
      vendor_id: vendorId,
      url: url.trim(),
      event_type: "settlement.paid",
      secret: randomSecret(),
      active: true,
    });
    setSaving(false);
    if (insertError) {
      setError(insertError.message);
      return;
    }
    setUrl("");
    setShowForm(false);
    loadHooks(vendorId);
  }

  async function toggleActive(hook: WebhookRow) {
    const supabase = createClient();
    await supabase.from("webhook_subscriptions").update({ active: !hook.active }).eq("id", hook.id).eq("vendor_id", vendorId);
    loadHooks(vendorId);
  }

  async function removeHook(hook: WebhookRow) {
    const supabase = createClient();
    await supabase.from("webhook_subscriptions").delete().eq("id", hook.id).eq("vendor_id", vendorId);
    loadHooks(vendorId);
  }

  return (
    <div className="mx-auto max-w-3xl px-5 py-8 lg:py-10">
      <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }} className="flex items-center justify-between">
        <div>
          <h1 className="font-display text-2xl font-semibold text-[var(--text)]">Webhooks</h1>
          <p className="mt-1 text-sm text-[var(--text-muted)]">
            Get notified the instant a settlement is marked paid. We POST a signed JSON payload to your URL.
          </p>
        </div>
        <Button variant="primary" onClick={() => setShowForm((v) => !v)}>
          <Plus size={14} /> New webhook
        </Button>
      </motion.div>

      {showForm && (
        <motion.form initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }} onSubmit={handleCreate} className="mt-5">
          <TiltCard strength={1} glare={false} className="space-y-4 p-6">
            <div>
              <label className={LABEL_CLASS}>Endpoint URL (event: settlement.paid)</label>
              <input className={INPUT_CLASS} value={url} onChange={(e) => setUrl(e.target.value)} placeholder="https://example.com/webhooks/nashemann" />
            </div>
            {error && <p className="text-sm text-[var(--danger)]">{error}</p>}
            <div className="flex gap-3">
              <Button type="submit" variant="primary" disabled={saving}>
                {saving ? "Saving…" : "Register webhook"}
              </Button>
              <Button type="button" variant="ghost" onClick={() => setShowForm(false)}>
                Cancel
              </Button>
            </div>
          </TiltCard>
        </motion.form>
      )}

      <div className="mt-6 space-y-2">
        {hooks.map((h) => (
          <TiltCard key={h.id} strength={1} glare={false} className="flex items-center justify-between p-4">
            <div className="flex items-center gap-3">
              <div className="flex h-9 w-9 items-center justify-center rounded-lg" style={{ background: "rgba(139,107,255,0.14)", color: "var(--accent-violet)" }}>
                <Webhook size={15} />
              </div>
              <div>
                <p className="max-w-sm truncate text-sm font-medium text-[var(--text)]">{h.url}</p>
                <p className="text-xs text-[var(--text-faint)]">
                  {h.event_type}
                  {h.last_triggered_at ? ` · last fired ${timeAgo(h.last_triggered_at)}` : " · never fired"}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <button onClick={() => toggleActive(h)} className="cursor-pointer">
                <Badge tone={h.active ? "success" : "neutral"} dot>
                  {h.active ? "Active" : "Paused"}
                </Badge>
              </button>
              <button onClick={() => removeHook(h)} className="rounded-full p-2 text-[var(--text-faint)] hover:bg-[var(--danger-bg)] hover:text-[var(--danger)]" aria-label="Remove webhook">
                <Trash2 size={14} />
              </button>
            </div>
          </TiltCard>
        ))}
        {hooks.length === 0 && !showForm && (
          <TiltCard strength={0} glare={false} className="p-8 text-center">
            <p className="text-sm text-[var(--text-faint)]">No webhooks yet.</p>
          </TiltCard>
        )}
      </div>
    </div>
  );
}
