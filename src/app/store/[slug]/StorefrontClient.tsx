"use client";

import { useRef, useState } from "react";
import { MapPin, Plus, Minus, Loader2, Upload, CheckCircle2, ShoppingBag, X } from "lucide-react";
import { BrandIcon } from "@/components/shared/BrandIcon";
import { formatPKR } from "@/lib/utils";
import {
  submitStorefrontOrder,
  uploadPaymentScreenshot,
  STOREFRONT_MIN_ORDER_ITEMS,
  STOREFRONT_MIN_ORDER_AMOUNT,
  type StorefrontVendor,
  type StorefrontProduct,
  type VendorPaymentMethod,
  type StorefrontOrderItem,
} from "@/lib/storefront-store";

type CartLine = {
  key: string;
  productId: string;
  name: string;
  unitPrice: number;
  optionGroupName: string | null;
  optionChoice: string | null;
  extraCharge: number;
  qty: number;
};

const PAYMENT_METHOD_LABEL: Record<VendorPaymentMethod["method"], string> = {
  easypaisa: "EasyPaisa",
  jazzcash: "JazzCash",
  bank: "Bank Transfer",
};

function ProductCard({
  product,
  onAdd,
}: {
  product: StorefrontProduct;
  onAdd: (choice: { optionChoice: string | null; optionGroupName: string | null; extraCharge: number }) => void;
}) {
  const group = product.options[0];
  const [selected, setSelected] = useState<string>(group?.choices[0] ?? "");

  const extraCharge = group && selected === "__all__" ? group.extra_price_all ?? 0 : 0;

  return (
    <div className="rounded-[1.25rem] border p-5" style={{ borderColor: "color-mix(in srgb, var(--store-accent) 35%, transparent)", background: "var(--store-surface)" }}>
      <div className="flex items-start justify-between gap-3">
        <div>
          <h3 className="text-base font-semibold" style={{ color: "var(--store-text)" }}>
            {product.name}
          </h3>
          <p className="mt-1 text-sm opacity-70" style={{ color: "var(--store-text)" }}>
            {product.description}
          </p>
        </div>
        <span className="shrink-0 text-sm font-bold" style={{ color: "var(--store-accent-deep)" }}>
          {formatPKR(product.price)}
        </span>
      </div>

      {group && (
        <div className="mt-4 space-y-1.5">
          <p className="text-xs font-medium opacity-60" style={{ color: "var(--store-text)" }}>
            {group.name} — pick {group.free_count ?? 1} free, or all for +{formatPKR(group.extra_price_all ?? 0)}
          </p>
          {group.choices.map((choice) => (
            <label key={choice} className="flex items-center gap-2 text-sm" style={{ color: "var(--store-text)" }}>
              <input
                type="radio"
                name={`${product.id}-option`}
                checked={selected === choice}
                onChange={() => setSelected(choice)}
                className="accent-[var(--store-accent-deep)]"
              />
              {choice}
            </label>
          ))}
          <label className="flex items-center gap-2 text-sm font-medium" style={{ color: "var(--store-text)" }}>
            <input
              type="radio"
              name={`${product.id}-option`}
              checked={selected === "__all__"}
              onChange={() => setSelected("__all__")}
              className="accent-[var(--store-accent-deep)]"
            />
            All {group.choices.length} toppings (+{formatPKR(group.extra_price_all ?? 0)})
          </label>
        </div>
      )}

      <button
        type="button"
        onClick={() =>
          onAdd({
            optionChoice: group ? (selected === "__all__" ? group.choices.join(" + ") : selected) : null,
            optionGroupName: group?.name ?? null,
            extraCharge,
          })
        }
        className="mt-4 flex w-full items-center justify-center gap-1.5 rounded-full py-2.5 text-sm font-semibold text-white transition-opacity hover:opacity-90"
        style={{ background: "var(--store-accent-deep)" }}
      >
        <Plus size={14} /> Add to order
      </button>
    </div>
  );
}

export function StorefrontClient({
  vendor,
  products,
  paymentMethods,
}: {
  vendor: StorefrontVendor;
  products: StorefrontProduct[];
  paymentMethods: VendorPaymentMethod[];
}) {
  const [cart, setCart] = useState<CartLine[]>([]);
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [address, setAddress] = useState("");
  const [email, setEmail] = useState("");
  const [screenshotFile, setScreenshotFile] = useState<File | null>(null);
  const [screenshotPreview, setScreenshotPreview] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [confirmedOrderId, setConfirmedOrderId] = useState<string | null>(null);
  const [formError, setFormError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const primaryPaymentMethod = paymentMethods[0] ?? null;

  function splitBioAndTagline(description: string): [string, string] {
    const sentences = description.trim().match(/[^.]+\.?/g);
    if (!sentences || sentences.length < 2) return [description, ""];
    const tagline = sentences[sentences.length - 1].trim().replace(/\.$/, "");
    const bio = sentences.slice(0, -1).join("").trim();
    return [bio, tagline];
  }

  const [bio, tagline] = splitBioAndTagline(vendor.description);

  function addToCart(product: StorefrontProduct, choice: { optionChoice: string | null; optionGroupName: string | null; extraCharge: number }) {
    setCart((prev) => {
      const key = `${product.id}::${choice.optionChoice ?? "none"}`;
      const existing = prev.find((l) => l.key === key);
      if (existing) {
        return prev.map((l) => (l.key === key ? { ...l, qty: l.qty + 1 } : l));
      }
      return [
        ...prev,
        {
          key,
          productId: product.id,
          name: product.name,
          unitPrice: product.price,
          optionGroupName: choice.optionGroupName,
          optionChoice: choice.optionChoice,
          extraCharge: choice.extraCharge,
          qty: 1,
        },
      ];
    });
  }

  function updateQty(key: string, delta: number) {
    setCart((prev) =>
      prev
        .map((l) => (l.key === key ? { ...l, qty: l.qty + delta } : l))
        .filter((l) => l.qty > 0)
    );
  }

  const totalItems = cart.reduce((sum, l) => sum + l.qty, 0);
  const totalAmount = cart.reduce((sum, l) => sum + l.qty * (l.unitPrice + l.extraCharge), 0);
  const meetsMinimum = totalItems >= STOREFRONT_MIN_ORDER_ITEMS && totalAmount >= STOREFRONT_MIN_ORDER_AMOUNT;

  async function handleSubmitOrder() {
    setFormError(null);
    if (!name.trim() || !phone.trim() || !address.trim()) {
      setFormError("Please fill in your name, phone, and complete address.");
      return;
    }
    if (cart.length === 0) {
      setFormError("Your order is empty.");
      return;
    }
    if (!meetsMinimum) {
      setFormError(
        `Minimum order is ${STOREFRONT_MIN_ORDER_ITEMS} items (${formatPKR(STOREFRONT_MIN_ORDER_AMOUNT)}). You currently have ${totalItems} item(s) totaling ${formatPKR(totalAmount)}.`
      );
      return;
    }
    if (!screenshotFile) {
      setFormError("Please upload a screenshot of your payment.");
      return;
    }

    setSubmitting(true);
    try {
      const screenshotUrl = await uploadPaymentScreenshot(screenshotFile);
      if (!screenshotUrl) {
        setFormError("Screenshot upload failed. Please try again.");
        setSubmitting(false);
        return;
      }

      const items: StorefrontOrderItem[] = cart.map((l) => ({
        productId: l.productId,
        name: l.name,
        qty: l.qty,
        unitPrice: l.unitPrice,
        selectedOptions: l.optionChoice
          ? [{ groupName: l.optionGroupName ?? "", choices: l.optionChoice.split(" + "), extraCharge: l.extraCharge }]
          : [],
        lineTotal: l.qty * (l.unitPrice + l.extraCharge),
      }));

      const orderId = await submitStorefrontOrder({
        vendorId: vendor.id,
        customerName: name.trim(),
        customerPhone: phone.trim(),
        customerAddress: address.trim(),
        customerEmail: email.trim() || undefined,
        items,
        totalAmount,
        paymentMethod: primaryPaymentMethod?.method ?? "easypaisa",
        paymentScreenshotUrl: screenshotUrl,
      });

      setConfirmedOrderId(orderId);
      setCart([]);

      fetch("/api/notifications/storefront-order", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          vendorId: vendor.id,
          orderId,
          customerName: name.trim(),
          customerPhone: phone.trim(),
          customerAddress: address.trim(),
          customerEmail: email.trim() || undefined,
          items: items.map((i) => ({ name: i.name, qty: i.qty, unitPrice: i.unitPrice + (i.selectedOptions[0]?.extraCharge ?? 0) })),
          totalAmount,
        }),
      }).catch(() => {});
    } catch {
      setFormError("Something went wrong placing your order. Please try again.");
    } finally {
      setSubmitting(false);
    }
  }

  const themeStyle = {
    "--store-accent": vendor.themeAccentFrom,
    "--store-bg": vendor.themeAccentTo,
    "--store-text": `color-mix(in srgb, ${vendor.themeAccentFrom} 55%, black 35%)`,
    "--store-accent-deep": `color-mix(in srgb, ${vendor.themeAccentFrom} 75%, black 20%)`,
    "--store-surface": `color-mix(in srgb, ${vendor.themeAccentTo} 100%, white 0%)`,
  } as React.CSSProperties;

  if (confirmedOrderId) {
    return (
      <div style={themeStyle} className="min-h-[70vh]" data-color-mode="unset">
        <div className="mx-auto flex max-w-lg flex-col items-center px-5 py-24 text-center">
          <CheckCircle2 size={48} style={{ color: "var(--store-accent-deep)" }} />
          <h1 className="mt-4 text-2xl font-semibold" style={{ color: "var(--store-text)" }}>
            Order received!
          </h1>
          <p className="mt-2 text-sm opacity-70" style={{ color: "var(--store-text)" }}>
            Thank you, {name}. {vendor.name} will confirm your preorder and delivery details on{" "}
            {vendor.contactPhone ?? "the number on file"} shortly.
          </p>
          <p className="mt-4 rounded-full px-4 py-1.5 text-xs font-mono" style={{ background: "var(--store-surface)", color: "var(--store-accent-deep)" }}>
            Order #{confirmedOrderId.slice(0, 8)}
          </p>
        </div>
      </div>
    );
  }

  return (
    <div style={{ ...themeStyle, background: "var(--store-bg)" }}>
      <section className="px-5 py-16 text-center sm:py-20">
        <div className="mx-auto max-w-2xl">
          <div
            className="mx-auto flex h-24 w-24 items-center justify-center rounded-full border-2 text-4xl"
            style={{ borderColor: "var(--store-accent-deep)", background: "white" }}
          >
            {vendor.themeLogoUrl ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={vendor.themeLogoUrl} alt={vendor.name} className="h-full w-full rounded-full object-cover" />
            ) : (
              vendor.themeLogoEmoji
            )}
          </div>
          <h1 className="font-display mt-5 text-4xl italic" style={{ color: "var(--store-accent-deep)" }}>
            {vendor.name.toLowerCase()}
          </h1>
          {tagline && (
            <p className="mt-1 text-xs font-medium uppercase tracking-widest opacity-70" style={{ color: "var(--store-text)" }}>
              {tagline}
            </p>
          )}
          <p className="mx-auto mt-4 max-w-md text-sm leading-relaxed opacity-80" style={{ color: "var(--store-text)" }}>
            {bio}
          </p>
          <div className="mt-3 flex items-center justify-center gap-1.5 text-xs opacity-70" style={{ color: "var(--store-text)" }}>
            <MapPin size={12} /> {vendor.city}
          </div>
          {(vendor.instagramUrl || vendor.youtubeUrl) && (
            <div className="mt-4 flex items-center justify-center gap-3">
              {vendor.instagramUrl && (
                <a href={vendor.instagramUrl} target="_blank" rel="noreferrer" style={{ color: "var(--store-accent-deep)" }}>
                  <BrandIcon name="instagram" size={18} />
                </a>
              )}
              {vendor.youtubeUrl && (
                <a href={vendor.youtubeUrl} target="_blank" rel="noreferrer" style={{ color: "var(--store-accent-deep)" }}>
                  <BrandIcon name="youtube" size={18} />
                </a>
              )}
            </div>
          )}
          <p className="mt-5 inline-block rounded-full px-4 py-1.5 text-xs font-semibold" style={{ background: "var(--store-surface)", color: "var(--store-accent-deep)" }}>
            Preorders only · Minimum order {STOREFRONT_MIN_ORDER_ITEMS} items ({formatPKR(STOREFRONT_MIN_ORDER_AMOUNT)})
          </p>
        </div>
      </section>

      <section className="mx-auto max-w-3xl px-5 pb-12">
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          {products.map((p) => (
            <ProductCard key={p.id} product={p} onAdd={(choice) => addToCart(p, choice)} />
          ))}
        </div>
      </section>

      <section className="mx-auto max-w-3xl px-5 pb-24">
        <div className="rounded-[1.5rem] border p-6" style={{ borderColor: "color-mix(in srgb, var(--store-accent) 35%, transparent)", background: "var(--store-surface)" }}>
          <h2 className="flex items-center gap-2 text-lg font-semibold" style={{ color: "var(--store-text)" }}>
            <ShoppingBag size={18} /> Your order
          </h2>

          {cart.length === 0 ? (
            <p className="mt-3 text-sm opacity-60" style={{ color: "var(--store-text)" }}>
              Add items above to start your preorder.
            </p>
          ) : (
            <div className="mt-4 space-y-3">
              {cart.map((l) => (
                <div key={l.key} className="flex items-center justify-between gap-3 border-b pb-3" style={{ borderColor: "color-mix(in srgb, var(--store-accent) 25%, transparent)" }}>
                  <div>
                    <p className="text-sm font-medium" style={{ color: "var(--store-text)" }}>
                      {l.name}
                    </p>
                    {l.optionChoice && (
                      <p className="text-xs opacity-60" style={{ color: "var(--store-text)" }}>
                        {l.optionGroupName}: {l.optionChoice}
                      </p>
                    )}
                    <p className="text-xs opacity-60" style={{ color: "var(--store-text)" }}>
                      {formatPKR(l.unitPrice + l.extraCharge)} each
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    <button type="button" onClick={() => updateQty(l.key, -1)} className="flex h-7 w-7 items-center justify-center rounded-full" style={{ background: "var(--store-bg)", color: "var(--store-accent-deep)" }}>
                      <Minus size={13} />
                    </button>
                    <span className="w-5 text-center text-sm font-semibold" style={{ color: "var(--store-text)" }}>
                      {l.qty}
                    </span>
                    <button type="button" onClick={() => updateQty(l.key, 1)} className="flex h-7 w-7 items-center justify-center rounded-full" style={{ background: "var(--store-bg)", color: "var(--store-accent-deep)" }}>
                      <Plus size={13} />
                    </button>
                  </div>
                </div>
              ))}
              <div className="flex items-center justify-between pt-1">
                <span className="text-sm font-medium" style={{ color: "var(--store-text)" }}>
                  {totalItems} item(s)
                </span>
                <span className="text-lg font-bold" style={{ color: "var(--store-accent-deep)" }}>
                  {formatPKR(totalAmount)}
                </span>
              </div>
              {!meetsMinimum && (
                <p className="text-xs font-medium" style={{ color: "#b45309" }}>
                  Minimum order is {STOREFRONT_MIN_ORDER_ITEMS} items ({formatPKR(STOREFRONT_MIN_ORDER_AMOUNT)}). Add {Math.max(0, STOREFRONT_MIN_ORDER_ITEMS - totalItems)} more item(s).
                </p>
              )}
            </div>
          )}

          {cart.length > 0 && (
            <div className="mt-6 space-y-4 border-t pt-5" style={{ borderColor: "color-mix(in srgb, var(--store-accent) 25%, transparent)" }}>
              <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                <input
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Your full name"
                  className="rounded-xl border bg-white px-4 py-2.5 text-sm outline-none"
                  style={{ borderColor: "color-mix(in srgb, var(--store-accent) 40%, transparent)", color: "#1a1a1a" }}
                />
                <input
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="Phone number"
                  className="rounded-xl border bg-white px-4 py-2.5 text-sm outline-none"
                  style={{ borderColor: "color-mix(in srgb, var(--store-accent) 40%, transparent)", color: "#1a1a1a" }}
                />
              </div>
              <textarea
                value={address}
                onChange={(e) => setAddress(e.target.value)}
                placeholder="Complete delivery address"
                rows={2}
                className="w-full rounded-xl border bg-white px-4 py-2.5 text-sm outline-none"
                style={{ borderColor: "color-mix(in srgb, var(--store-accent) 40%, transparent)", color: "#1a1a1a" }}
              />
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Email (optional, for order confirmation)"
                className="w-full rounded-xl border bg-white px-4 py-2.5 text-sm outline-none"
                style={{ borderColor: "color-mix(in srgb, var(--store-accent) 40%, transparent)", color: "#1a1a1a" }}
              />

              {primaryPaymentMethod && (
                <div className="rounded-xl p-4 text-sm" style={{ background: "var(--store-bg)", color: "var(--store-text)" }}>
                  <p className="font-semibold">Pay via {PAYMENT_METHOD_LABEL[primaryPaymentMethod.method]}</p>
                  <p className="mt-1 opacity-80">
                    {primaryPaymentMethod.accountName} — {primaryPaymentMethod.accountNumber}
                  </p>
                  <p className="mt-1 text-xs opacity-70">Send {formatPKR(totalAmount)}, then upload your payment screenshot below.</p>
                </div>
              )}

              <div>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={(e) => {
                    const file = e.target.files?.[0] ?? null;
                    setScreenshotFile(file);
                    setScreenshotPreview(file ? URL.createObjectURL(file) : null);
                  }}
                />
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="flex w-full items-center justify-center gap-2 rounded-xl border-2 border-dashed py-4 text-sm font-medium"
                  style={{ borderColor: "color-mix(in srgb, var(--store-accent) 50%, transparent)", color: "var(--store-text)" }}
                >
                  {screenshotPreview ? (
                    <span className="flex items-center gap-2">
                      <CheckCircle2 size={15} style={{ color: "var(--store-accent-deep)" }} /> Screenshot attached
                      <X
                        size={13}
                        onClick={(e) => {
                          e.stopPropagation();
                          setScreenshotFile(null);
                          setScreenshotPreview(null);
                          if (fileInputRef.current) fileInputRef.current.value = "";
                        }}
                      />
                    </span>
                  ) : (
                    <>
                      <Upload size={15} /> Upload payment screenshot
                    </>
                  )}
                </button>
              </div>

              {formError && (
                <p className="text-sm font-medium" style={{ color: "#b91c1c" }}>
                  {formError}
                </p>
              )}

              <button
                type="button"
                disabled={submitting}
                onClick={handleSubmitOrder}
                className="flex w-full items-center justify-center gap-2 rounded-full py-3 text-sm font-semibold text-white transition-opacity hover:opacity-90 disabled:opacity-60"
                style={{ background: "var(--store-accent-deep)" }}
              >
                {submitting && <Loader2 size={15} className="animate-spin" />}
                Place preorder — {formatPKR(totalAmount)}
              </button>
            </div>
          )}
        </div>
      </section>
    </div>
  );
}
