"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { Plus, Trash2, KeyRound, Copy, Check } from "lucide-react";
import { TiltCard } from "@/components/public/TiltCard";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { createClient } from "@/lib/supabase/client";
import { useVendorSessionContext } from "@/lib/vendor-session-context";
import { formatDate, timeAgo } from "@/lib/utils";

type ApiKeyRow = {
  id: string;
  name: string;
  key_prefix: string;
  created_at: string;
  last_used_at: string | null;
  revoked_at: string | null;
};

const INPUT_CLASS =
  "w-full rounded-[var(--radius-sm)] border border-[var(--border)] bg-[var(--surface)] px-3.5 py-2.5 text-sm text-[var(--text)] outline-none placeholder:text-[var(--text-faint)] focus:border-[var(--accent-violet)]";
const LABEL_CLASS = "mb-1.5 block text-xs font-medium text-[var(--text-muted)]";

function randomKey() {
  const bytes = new Uint8Array(24);
  crypto.getRandomValues(bytes);
  const b64 = btoa(String.fromCharCode(...bytes)).replace(/[+/=]/g, "").slice(0, 32);
  return `nshm_${b64}`;
}

async function sha256Hex(input: string) {
  const buf = await crypto.subtle.digest("SHA-256", new TextEncoder().encode(input));
  return Array.from(new Uint8Array(buf))
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
}

export default function VendorApiKeysPage() {
  const { state } = useVendorSessionContext();
  const [keys, setKeys] = useState<ApiKeyRow[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [name, setName] = useState("");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [revealedKey, setRevealedKey] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  async function loadKeys(vendorId: string) {
    const supabase = createClient();
    const { data } = await supabase
      .from("api_keys")
      .select("id, name, key_prefix, created_at, last_used_at, revoked_at")
      .eq("vendor_id", vendorId)
      .order("created_at", { ascending: false });
    setKeys((data ?? []) as ApiKeyRow[]);
  }

  useEffect(() => {
    if (state.status !== "ready") return;
    let active = true;
    (async () => {
      const supabase = createClient();
      const { data } = await supabase
        .from("api_keys")
        .select("id, name, key_prefix, created_at, last_used_at, revoked_at")
        .eq("vendor_id", state.vendor.id)
        .order("created_at", { ascending: false });
      if (active) setKeys((data ?? []) as ApiKeyRow[]);
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
    setSaving(true);
    setError(null);
    const raw = randomKey();
    const hash = await sha256Hex(raw);
    const supabase = createClient();
    const { error: insertError } = await supabase.from("api_keys").insert({
      vendor_id: vendorId,
      name: name.trim() || "API Key",
      key_hash: hash,
      key_prefix: raw.slice(0, 12),
    });
    setSaving(false);
    if (insertError) {
      setError(insertError.message);
      return;
    }
    setRevealedKey(raw);
    setName("");
    setShowForm(false);
    loadKeys(vendorId);
  }

  async function revokeKey(key: ApiKeyRow) {
    const supabase = createClient();
    await supabase.from("api_keys").update({ revoked_at: new Date().toISOString() }).eq("id", key.id).eq("vendor_id", vendorId);
    loadKeys(vendorId);
  }

  function copyKey() {
    if (!revealedKey) return;
    navigator.clipboard.writeText(revealedKey).catch(() => {});
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  }

  return (
    <div className="mx-auto max-w-3xl px-5 py-8 lg:py-10">
      <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }} className="flex items-center justify-between">
        <div>
          <h1 className="font-display text-2xl font-semibold text-[var(--text)]">API keys</h1>
          <p className="mt-1 text-sm text-[var(--text-muted)]">
            Read your own settlement data programmatically. See{" "}
            <code className="rounded bg-[var(--surface-hover)] px-1 py-0.5 text-xs">GET /api/v1/settlements</code>.
          </p>
        </div>
        <Button variant="primary" onClick={() => setShowForm((v) => !v)}>
          <Plus size={14} /> New key
        </Button>
      </motion.div>

      {revealedKey && (
        <TiltCard strength={0} glare={false} className="mt-5 space-y-2 p-5">
          <p className="text-xs font-semibold text-[var(--warning,#d97706)]">
            Copy this key now — it will not be shown again. Only a hash is stored.
          </p>
          <div className="flex items-center gap-2 rounded-[var(--radius-sm)] border border-[var(--border)] bg-[var(--surface)] px-3.5 py-2.5">
            <code className="flex-1 truncate text-sm text-[var(--text)]">{revealedKey}</code>
            <button onClick={copyKey} className="rounded-full p-1.5 text-[var(--text-faint)] hover:bg-[var(--surface-hover)]" aria-label="Copy key">
              {copied ? <Check size={14} /> : <Copy size={14} />}
            </button>
          </div>
          <Button variant="ghost" onClick={() => setRevealedKey(null)}>
            Done
          </Button>
        </TiltCard>
      )}

      {showForm && (
        <motion.form initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }} onSubmit={handleCreate} className="mt-5">
          <TiltCard strength={1} glare={false} className="space-y-4 p-6">
            <div>
              <label className={LABEL_CLASS}>Key name</label>
              <input className={INPUT_CLASS} value={name} onChange={(e) => setName(e.target.value)} placeholder="e.g. Accounting integration" maxLength={60} />
            </div>
            {error && <p className="text-sm text-[var(--danger)]">{error}</p>}
            <div className="flex gap-3">
              <Button type="submit" variant="primary" disabled={saving}>
                {saving ? "Generating…" : "Generate key"}
              </Button>
              <Button type="button" variant="ghost" onClick={() => setShowForm(false)}>
                Cancel
              </Button>
            </div>
          </TiltCard>
        </motion.form>
      )}

      <div className="mt-6 space-y-2">
        {keys.map((k) => (
          <TiltCard key={k.id} strength={1} glare={false} className="flex items-center justify-between p-4">
            <div className="flex items-center gap-3">
              <div className="flex h-9 w-9 items-center justify-center rounded-lg" style={{ background: "rgba(139,107,255,0.14)", color: "var(--accent-violet)" }}>
                <KeyRound size={15} />
              </div>
              <div>
                <p className="font-display text-sm font-semibold tracking-wide text-[var(--text)]">{k.name}</p>
                <p className="text-xs text-[var(--text-faint)]">
                  {k.key_prefix}… · created {formatDate(k.created_at)}
                  {k.last_used_at ? ` · last used ${timeAgo(k.last_used_at)}` : " · never used"}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              {k.revoked_at ? (
                <Badge tone="neutral" dot>
                  Revoked
                </Badge>
              ) : (
                <>
                  <Badge tone="success" dot>
                    Active
                  </Badge>
                  <button onClick={() => revokeKey(k)} className="rounded-full p-2 text-[var(--text-faint)] hover:bg-[var(--danger-bg)] hover:text-[var(--danger)]" aria-label="Revoke key">
                    <Trash2 size={14} />
                  </button>
                </>
              )}
            </div>
          </TiltCard>
        ))}
        {keys.length === 0 && !showForm && (
          <TiltCard strength={0} glare={false} className="p-8 text-center">
            <p className="text-sm text-[var(--text-faint)]">No API keys yet — generate one to pull your settlement data programmatically.</p>
          </TiltCard>
        )}
      </div>
    </div>
  );
}
