"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { Check, Save } from "lucide-react";
import { TiltCard } from "@/components/public/TiltCard";
import { Button } from "@/components/ui/Button";
import { VendorStatusBadge } from "@/components/ui/Badge";
import { createClient } from "@/lib/supabase/client";
import { useVendorSessionContext } from "@/lib/vendor-session-context";
import type { VendorRecord } from "@/lib/vendor-session";

const INPUT_CLASS =
  "w-full rounded-[var(--radius-sm)] border border-[var(--border)] bg-[var(--surface)] px-3.5 py-2.5 text-sm text-[var(--text)] outline-none placeholder:text-[var(--text-faint)] focus:border-[var(--accent-violet)]";
const LABEL_CLASS = "mb-1.5 block text-xs font-medium text-[var(--text-muted)]";

function vendorToForm(v: VendorRecord) {
  return {
    name: v.name,
    description: v.description ?? "",
    city: v.city,
    category: v.category ?? "",
    contact_email: v.contact_email ?? "",
    contact_phone: v.contact_phone ?? "",
    theme_accent_from: v.theme_accent_from,
    theme_accent_to: v.theme_accent_to,
    theme_logo_emoji: v.theme_logo_emoji,
    theme_logo_url: v.theme_logo_url ?? "",
    theme_font: v.theme_font,
  };
}

function ProfileForm({ vendor, categories, onSaved }: { vendor: VendorRecord; categories: string[]; onSaved: () => void }) {
  const [form, setForm] = useState(() => vendorToForm(vendor));
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState<string | null>(null);

  function set(key: keyof ReturnType<typeof vendorToForm>) {
    return (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
      setForm((f) => ({ ...f, [key]: e.target.value }));
      setSaved(false);
    };
  }

  async function handleSave(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    setError(null);
    const supabase = createClient();
    const { error: rpcError } = await supabase.rpc("vendor_update_profile", {
      p_name: form.name,
      p_description: form.description,
      p_city: form.city,
      p_category: form.category || null,
      p_contact_email: form.contact_email || null,
      p_contact_phone: form.contact_phone || null,
      p_theme_accent_from: form.theme_accent_from,
      p_theme_accent_to: form.theme_accent_to,
      p_theme_logo_emoji: form.theme_logo_emoji,
      p_theme_logo_url: form.theme_logo_url || null,
      p_theme_font: form.theme_font,
    });
    setSaving(false);
    if (rpcError) {
      setError(rpcError.message);
      return;
    }
    setSaved(true);
    onSaved();
    setTimeout(() => setSaved(false), 2500);
  }

  return (
    <motion.form
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.1 }}
      onSubmit={handleSave}
      className="mt-6 space-y-6"
    >
      <TiltCard strength={1} glare={false} className="space-y-4 p-6">
        <p className="text-sm font-semibold text-[var(--text)]">Basics</p>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div>
            <label className={LABEL_CLASS}>Business name</label>
            <input className={INPUT_CLASS} value={form.name} onChange={set("name")} required maxLength={120} />
          </div>
          <div>
            <label className={LABEL_CLASS}>City</label>
            <input className={INPUT_CLASS} value={form.city} onChange={set("city")} maxLength={80} />
          </div>
        </div>
        <div>
          <label className={LABEL_CLASS}>Description</label>
          <textarea className={INPUT_CLASS} rows={3} value={form.description} onChange={set("description")} maxLength={600} placeholder="What does your store sell, and what makes it different?" />
        </div>
        <div>
          <label className={LABEL_CLASS}>Category</label>
          <select className={INPUT_CLASS} value={form.category} onChange={set("category")}>
            <option value="">Select a category</option>
            {categories.map((c) => (
              <option key={c} value={c}>
                {c}
              </option>
            ))}
          </select>
        </div>
      </TiltCard>

      <TiltCard strength={1} glare={false} className="space-y-4 p-6">
        <p className="text-sm font-semibold text-[var(--text)]">Contact info</p>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div>
            <label className={LABEL_CLASS}>Contact email</label>
            <input type="email" className={INPUT_CLASS} value={form.contact_email} onChange={set("contact_email")} placeholder="hello@yourstore.pk" />
          </div>
          <div>
            <label className={LABEL_CLASS}>Contact phone</label>
            <input className={INPUT_CLASS} value={form.contact_phone} onChange={set("contact_phone")} placeholder="+92 3xx xxxxxxx" />
          </div>
        </div>
      </TiltCard>

      <TiltCard strength={1} glare={false} className="space-y-4 p-6">
        <p className="text-sm font-semibold text-[var(--text)]">Storefront theme</p>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div>
            <label className={LABEL_CLASS}>Logo emoji</label>
            <input className={INPUT_CLASS} value={form.theme_logo_emoji} onChange={set("theme_logo_emoji")} maxLength={4} />
          </div>
          <div>
            <label className={LABEL_CLASS}>Logo image URL (optional)</label>
            <input className={INPUT_CLASS} value={form.theme_logo_url} onChange={set("theme_logo_url")} placeholder="https://..." />
          </div>
          <div>
            <label className={LABEL_CLASS}>Accent colour — from</label>
            <div className="flex items-center gap-2">
              <input type="color" className="h-10 w-12 cursor-pointer rounded-[var(--radius-sm)] border border-[var(--border)] bg-[var(--surface)]" value={form.theme_accent_from} onChange={set("theme_accent_from")} />
              <input className={INPUT_CLASS} value={form.theme_accent_from} onChange={set("theme_accent_from")} />
            </div>
          </div>
          <div>
            <label className={LABEL_CLASS}>Accent colour — to</label>
            <div className="flex items-center gap-2">
              <input type="color" className="h-10 w-12 cursor-pointer rounded-[var(--radius-sm)] border border-[var(--border)] bg-[var(--surface)]" value={form.theme_accent_to} onChange={set("theme_accent_to")} />
              <input className={INPUT_CLASS} value={form.theme_accent_to} onChange={set("theme_accent_to")} />
            </div>
          </div>
          <div>
            <label className={LABEL_CLASS}>Font</label>
            <input className={INPUT_CLASS} value={form.theme_font} onChange={set("theme_font")} placeholder="Inter" />
          </div>
        </div>
      </TiltCard>

      <div className="rounded-[var(--radius-sm)] border border-[var(--border)] bg-[var(--surface)] px-4 py-3 text-xs text-[var(--text-faint)]">
        Plan, status and domain settings are managed by the Nashemann team — reach out to support to change those.
      </div>

      {error && <p className="text-sm text-[var(--danger)]">{error}</p>}

      <div className="flex items-center gap-3">
        <Button type="submit" variant="primary" disabled={saving}>
          <Save size={14} /> {saving ? "Saving…" : "Save changes"}
        </Button>
        {saved && (
          <span className="flex items-center gap-1 text-xs font-semibold text-[var(--success)]">
            <Check size={13} /> Saved
          </span>
        )}
      </div>
    </motion.form>
  );
}

export default function VendorProfilePage() {
  const { state, refresh } = useVendorSessionContext();
  const [categories, setCategories] = useState<string[]>([]);

  useEffect(() => {
    let active = true;
    createClient()
      .from("category_product_schemas")
      .select("category")
      .order("display_order")
      .then(({ data }) => {
        if (active) setCategories((data ?? []).map((r) => r.category as string));
      });
    return () => {
      active = false;
    };
  }, []);

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

  return (
    <div className="mx-auto max-w-3xl px-5 py-8 lg:py-10">
      <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }} className="flex items-center justify-between">
        <div>
          <h1 className="font-display text-2xl font-semibold text-[var(--text)]">Store profile</h1>
          <p className="mt-1 text-sm text-[var(--text-muted)]">
            Business name, description, contact and theming — visible on your storefront and to customers.
          </p>
        </div>
        <VendorStatusBadge status={vendor.status} />
      </motion.div>

      <ProfileForm key={vendor.id} vendor={vendor} categories={categories} onSaved={refresh} />
    </div>
  );
}
