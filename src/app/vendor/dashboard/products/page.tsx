"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { Plus, Trash2, Pencil, Package, Upload, X } from "lucide-react";
import { TiltCard } from "@/components/public/TiltCard";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { createClient } from "@/lib/supabase/client";
import { useVendorSessionContext } from "@/lib/vendor-session-context";
import { formatPKR } from "@/lib/utils";

type ProductOption = {
  name: string;
  type: "multi_free_then_paid" | "single_choice";
  choices: string[];
  free_count?: number;
  extra_price_all?: number;
};

type Product = {
  id: string;
  name: string;
  description: string;
  price: number;
  image_url: string | null;
  category: string | null;
  active: boolean;
  display_order: number;
  options: ProductOption[];
};

const PRODUCT_COLUMNS = "id, name, description, price, image_url, category, active, display_order, options";

const INPUT_CLASS =
  "w-full rounded-[var(--radius-sm)] border border-[var(--border)] bg-[var(--surface)] px-3.5 py-2.5 text-sm text-[var(--text)] outline-none placeholder:text-[var(--text-faint)] focus:border-[var(--accent-violet)]";
const LABEL_CLASS = "mb-1.5 block text-xs font-medium text-[var(--text-muted)]";

type FormState = {
  name: string;
  description: string;
  price: string;
  category: string;
  active: boolean;
  options: ProductOption[];
};

function emptyForm(): FormState {
  return { name: "", description: "", price: "", category: "", active: true, options: [] };
}

function productToForm(p: Product): FormState {
  return {
    name: p.name,
    description: p.description,
    price: String(p.price),
    category: p.category ?? "",
    active: p.active,
    options: p.options ?? [],
  };
}

async function uploadProductImage(file: File, vendorId: string): Promise<string | null> {
  const supabase = createClient();
  const ext = file.name.split(".").pop() || "jpg";
  const path = `products/${vendorId}/${Date.now()}-${Math.random().toString(36).slice(2, 8)}.${ext}`;
  const { error } = await supabase.storage.from("storefront-uploads").upload(path, file);
  if (error) return null;
  const { data } = supabase.storage.from("storefront-uploads").getPublicUrl(path);
  return data.publicUrl;
}

function OptionEditor({ options, onChange }: { options: ProductOption[]; onChange: (o: ProductOption[]) => void }) {
  function updateOption(i: number, patch: Partial<ProductOption>) {
    onChange(options.map((o, idx) => (idx === i ? { ...o, ...patch } : o)));
  }
  function removeOption(i: number) {
    onChange(options.filter((_, idx) => idx !== i));
  }
  function addOption() {
    onChange([...options, { name: "", type: "multi_free_then_paid", choices: [], free_count: 1, extra_price_all: 0 }]);
  }

  return (
    <div className="space-y-3">
      {options.map((o, i) => (
        <div key={i} className="rounded-[var(--radius-sm)] border border-[var(--border)] p-3">
          <div className="flex items-center justify-between gap-2">
            <input
              className={INPUT_CLASS}
              placeholder="Option group name e.g. Toppings"
              value={o.name}
              onChange={(e) => updateOption(i, { name: e.target.value })}
            />
            <button type="button" onClick={() => removeOption(i)} className="shrink-0 rounded-full p-2 text-[var(--text-faint)] hover:bg-[var(--danger-bg)] hover:text-[var(--danger)]">
              <X size={14} />
            </button>
          </div>
          <div className="mt-2 grid grid-cols-1 gap-2 sm:grid-cols-3">
            <select className={INPUT_CLASS} value={o.type} onChange={(e) => updateOption(i, { type: e.target.value as ProductOption["type"] })}>
              <option value="multi_free_then_paid">Multi-select (free then paid)</option>
              <option value="single_choice">Single choice</option>
            </select>
            {o.type === "multi_free_then_paid" && (
              <>
                <input
                  type="number"
                  min={0}
                  className={INPUT_CLASS}
                  placeholder="Free count"
                  value={o.free_count ?? 0}
                  onChange={(e) => updateOption(i, { free_count: Number(e.target.value) || 0 })}
                />
                <input
                  type="number"
                  min={0}
                  className={INPUT_CLASS}
                  placeholder="Extra price (Rs)"
                  value={o.extra_price_all ?? 0}
                  onChange={(e) => updateOption(i, { extra_price_all: Number(e.target.value) || 0 })}
                />
              </>
            )}
          </div>
          <div className="mt-2">
            <input
              className={INPUT_CLASS}
              placeholder="Choices, comma-separated e.g. Honey, Chocolate, Sprinkles"
              value={o.choices.join(", ")}
              onChange={(e) =>
                updateOption(i, {
                  choices: e.target.value
                    .split(",")
                    .map((c) => c.trim())
                    .filter(Boolean),
                })
              }
            />
          </div>
        </div>
      ))}
      <Button type="button" variant="ghost" size="sm" onClick={addOption}>
        <Plus size={13} /> Add option group
      </Button>
    </div>
  );
}

function ProductForm({
  initial,
  vendorId,
  onCancel,
  onSaved,
}: {
  initial: Product | null;
  vendorId: string;
  onCancel: () => void;
  onSaved: () => void;
}) {
  const [form, setForm] = useState<FormState>(() => (initial ? productToForm(initial) : emptyForm()));
  const [imageUrl, setImageUrl] = useState<string | null>(initial?.image_url ?? null);
  const [uploading, setUploading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleImageChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    const url = await uploadProductImage(file, vendorId);
    setUploading(false);
    if (!url) {
      setError("Image upload failed. Try a smaller file.");
      return;
    }
    setImageUrl(url);
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!form.name.trim()) {
      setError("Product name is required");
      return;
    }
    const price = Number(form.price);
    if (!Number.isFinite(price) || price < 0) {
      setError("Enter a valid price");
      return;
    }
    setSaving(true);
    setError(null);
    const supabase = createClient();
    const payload = {
      name: form.name.trim(),
      description: form.description.trim(),
      price,
      category: form.category.trim() || null,
      active: form.active,
      image_url: imageUrl,
      options: form.options,
    };

    const { error: dbError } = initial
      ? await supabase.from("storefront_products").update(payload).eq("id", initial.id).eq("vendor_id", vendorId)
      : await supabase.from("storefront_products").insert({ ...payload, vendor_id: vendorId });

    setSaving(false);
    if (dbError) {
      setError(dbError.message);
      return;
    }
    onSaved();
  }

  return (
    <motion.form initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }} onSubmit={handleSubmit} className="mt-5">
      <TiltCard strength={1} glare={false} className="space-y-4 p-6">
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div>
            <label className={LABEL_CLASS}>Name</label>
            <input className={INPUT_CLASS} value={form.name} onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))} maxLength={120} required />
          </div>
          <div>
            <label className={LABEL_CLASS}>Price (Rs)</label>
            <input type="number" min={0} className={INPUT_CLASS} value={form.price} onChange={(e) => setForm((f) => ({ ...f, price: e.target.value }))} required />
          </div>
        </div>
        <div>
          <label className={LABEL_CLASS}>Description</label>
          <textarea className={INPUT_CLASS} rows={3} value={form.description} onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))} maxLength={600} />
        </div>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div>
            <label className={LABEL_CLASS}>Category</label>
            <input className={INPUT_CLASS} value={form.category} onChange={(e) => setForm((f) => ({ ...f, category: e.target.value }))} placeholder="e.g. Fruit, Milk" />
          </div>
          <div className="flex items-end gap-2 pb-2.5">
            <label className="flex items-center gap-2 text-sm text-[var(--text)]">
              <input type="checkbox" checked={form.active} onChange={(e) => setForm((f) => ({ ...f, active: e.target.checked }))} />
              Active (visible on storefront)
            </label>
          </div>
        </div>

        <div>
          <label className={LABEL_CLASS}>Product image</label>
          <div className="flex items-center gap-3">
            {imageUrl && (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={imageUrl} alt="" className="h-16 w-16 rounded-[var(--radius-sm)] border border-[var(--border)] object-cover" />
            )}
            <label className="inline-flex cursor-pointer items-center gap-1.5 rounded-[var(--radius-sm)] border border-[var(--border-strong)] bg-[var(--surface)] px-3.5 py-2.5 text-sm font-semibold text-[var(--text)] hover:bg-[var(--surface-hover)]">
              <Upload size={14} /> {uploading ? "Uploading…" : imageUrl ? "Change image" : "Upload image"}
              <input type="file" accept="image/*" className="hidden" onChange={handleImageChange} disabled={uploading} />
            </label>
          </div>
        </div>

        <div>
          <label className={LABEL_CLASS}>Topping / option groups (optional)</label>
          <OptionEditor options={form.options} onChange={(o) => setForm((f) => ({ ...f, options: o }))} />
        </div>

        {error && <p className="text-sm text-[var(--danger)]">{error}</p>}

        <div className="flex gap-3">
          <Button type="submit" variant="primary" disabled={saving || uploading}>
            {saving ? "Saving…" : initial ? "Save changes" : "Add product"}
          </Button>
          <Button type="button" variant="ghost" onClick={onCancel}>
            Cancel
          </Button>
        </div>
      </TiltCard>
    </motion.form>
  );
}

export default function VendorProductsPage() {
  const { state } = useVendorSessionContext();
  const [products, setProducts] = useState<Product[]>([]);
  const [editing, setEditing] = useState<Product | null | undefined>(undefined);

  async function loadProducts(vendorId: string) {
    const supabase = createClient();
    const { data } = await supabase.from("storefront_products").select(PRODUCT_COLUMNS).eq("vendor_id", vendorId).order("display_order", { ascending: true });
    setProducts((data ?? []) as Product[]);
  }

  useEffect(() => {
    if (state.status !== "ready") return;
    let active = true;
    (async () => {
      const supabase = createClient();
      const { data } = await supabase.from("storefront_products").select(PRODUCT_COLUMNS).eq("vendor_id", state.vendor.id).order("display_order", { ascending: true });
      if (active) setProducts((data ?? []) as Product[]);
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

  async function toggleActive(p: Product) {
    const supabase = createClient();
    await supabase.from("storefront_products").update({ active: !p.active }).eq("id", p.id).eq("vendor_id", vendorId);
    loadProducts(vendorId);
  }

  async function deleteProduct(p: Product) {
    if (!confirm(`Delete "${p.name}"? This can't be undone.`)) return;
    const supabase = createClient();
    await supabase.from("storefront_products").delete().eq("id", p.id).eq("vendor_id", vendorId);
    loadProducts(vendorId);
  }

  return (
    <div className="mx-auto max-w-3xl px-5 py-8 lg:py-10">
      <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }} className="flex items-center justify-between">
        <div>
          <h1 className="font-display text-2xl font-semibold text-[var(--text)]">Products</h1>
          <p className="mt-1 text-sm text-[var(--text-muted)]">Manage what customers see on your storefront.</p>
        </div>
        {editing === undefined && (
          <Button variant="primary" onClick={() => setEditing(null)}>
            <Plus size={14} /> New product
          </Button>
        )}
      </motion.div>

      {editing !== undefined && (
        <ProductForm
          key={editing?.id ?? "new"}
          initial={editing}
          vendorId={vendorId}
          onCancel={() => setEditing(undefined)}
          onSaved={() => {
            setEditing(undefined);
            loadProducts(vendorId);
          }}
        />
      )}

      <div className="mt-6 space-y-2">
        {products.map((p) => (
          <TiltCard key={p.id} strength={1} glare={false} className="flex items-center justify-between gap-3 p-4">
            <div className="flex min-w-0 items-center gap-3">
              {p.image_url ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={p.image_url} alt="" className="h-11 w-11 shrink-0 rounded-lg object-cover" />
              ) : (
                <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-lg" style={{ background: "rgba(139,107,255,0.14)", color: "var(--accent-violet)" }}>
                  <Package size={16} />
                </div>
              )}
              <div className="min-w-0">
                <p className="truncate text-sm font-semibold text-[var(--text)]">{p.name}</p>
                <p className="text-xs text-[var(--text-faint)]">
                  {formatPKR(p.price)}
                  {p.category ? ` · ${p.category}` : ""}
                </p>
              </div>
            </div>
            <div className="flex shrink-0 items-center gap-2">
              <button onClick={() => toggleActive(p)} className="cursor-pointer">
                <Badge tone={p.active ? "success" : "neutral"} dot>
                  {p.active ? "Active" : "Hidden"}
                </Badge>
              </button>
              <button onClick={() => setEditing(p)} className="rounded-full p-2 text-[var(--text-faint)] hover:bg-[var(--surface-hover)] hover:text-[var(--text)]" aria-label="Edit product">
                <Pencil size={14} />
              </button>
              <button onClick={() => deleteProduct(p)} className="rounded-full p-2 text-[var(--text-faint)] hover:bg-[var(--danger-bg)] hover:text-[var(--danger)]" aria-label="Delete product">
                <Trash2 size={14} />
              </button>
            </div>
          </TiltCard>
        ))}
        {products.length === 0 && editing === undefined && (
          <TiltCard strength={0} glare={false} className="p-8 text-center">
            <p className="text-sm text-[var(--text-faint)]">No products yet — add your first one.</p>
          </TiltCard>
        )}
      </div>
    </div>
  );
}
