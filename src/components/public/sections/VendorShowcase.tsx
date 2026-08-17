"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { ArrowUpRight, ShoppingBag, Sparkles } from "lucide-react";
import { TiltCard } from "../TiltCard";
import { getShowcaseVendors, type ShowcaseVendor } from "@/lib/mock-data";

function storeUrl(v: ShowcaseVendor): string {
  const customDomain = v.customDomain?.trim();
  if (customDomain) return /^https?:\/\//i.test(customDomain) ? customDomain : `https://${customDomain}`;
  const rootDomain = process.env.NEXT_PUBLIC_PLATFORM_ROOT_DOMAIN || "nashemann.store";
  return `https://${v.subdomain}.${rootDomain}`;
}

function VendorCard({ v, i }: { v: ShowcaseVendor; i: number }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 24 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-60px" }}
      transition={{ duration: 0.5, delay: i * 0.1 }}
    >
      <TiltCard strength={5} className="h-full p-6">
        <div className="flex items-start justify-between">
          <div
            className="flex h-12 w-12 items-center justify-center rounded-2xl text-2xl"
            style={{ boxShadow: `0 0 0 2px ${v.accentFrom}` }}
          >
            {v.logoUrl ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={v.logoUrl}
                alt={v.name}
                loading="lazy"
                decoding="async"
                width={48}
                height={48}
                className="h-full w-full rounded-2xl object-cover"
              />
            ) : (
              v.logoEmoji
            )}
          </div>
          {!v.whiteLabelEnabled && (
            <span className="inline-flex items-center gap-1 rounded-full border border-[var(--border-strong)] bg-[var(--surface)] px-2.5 py-1 text-[0.65rem] font-medium text-[var(--text-faint)]">
              <Sparkles size={10} className="text-[var(--accent-amber)]" /> Powered by Nashemann
            </span>
          )}
        </div>

        <h3 className="font-display mt-4 text-lg font-semibold text-[var(--text)]">{v.name}</h3>
        <p className="mt-0.5 text-xs text-[var(--text-faint)]">
          {v.category ?? "Store"} · {v.city}
        </p>

        <div className="mt-5 flex items-center gap-2 border-t border-[var(--border)] pt-4">
          <ShoppingBag size={13} className="text-[var(--accent-violet)]" />
          <p className="text-xs text-[var(--text-muted)]">
            <span className="font-semibold text-[var(--text)]">{v.ordersLast30d}</span> orders in the last 30 days
          </p>
        </div>

        <a
          href={storeUrl(v)}
          target="_blank"
          rel="noreferrer"
          className="mt-5 inline-flex items-center gap-1.5 text-sm font-semibold text-[var(--accent-violet)] hover:underline"
        >
          Visit store <ArrowUpRight size={14} />
        </a>
      </TiltCard>
    </motion.div>
  );
}

export function VendorShowcase() {
  const [vendors, setVendors] = useState<ShowcaseVendor[] | null>(null);

  useEffect(() => {
    let active = true;
    getShowcaseVendors().then((v) => {
      if (active) setVendors(v);
    }).catch(() => {});
    return () => {
      active = false;
    };
  }, []);

  if (vendors && vendors.length === 0) return null;

  return (
    <section className="mx-auto max-w-7xl px-5 py-14 lg:px-8 lg:py-24">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: "-80px" }}
        transition={{ duration: 0.6 }}
        className="mx-auto max-w-2xl text-center"
      >
        <span className="text-xs font-semibold uppercase tracking-widest text-[var(--accent-violet)]">Live on Nashemann</span>
        <h2 className="font-display mt-3 text-2xl font-semibold tracking-tight text-[var(--text)] sm:text-3xl lg:text-4xl">
          Real stores, already selling.
        </h2>
      </motion.div>

      <div className="mt-8 grid grid-cols-1 gap-5 sm:grid-cols-2 lg:mt-14 lg:grid-cols-3">
        {!vendors
          ? Array.from({ length: 3 }).map((_, i) => (
              <div key={i} className="glass-panel h-52 animate-pulse rounded-[var(--radius-lg)]" />
            ))
          : vendors.map((v, i) => <VendorCard key={v.id} v={v} i={i} />)}
      </div>

      <div className="mt-10 text-center">
        <Link href="/apply" className="text-sm font-semibold text-[var(--accent-violet)] hover:underline">
          Want your store here too? Apply now →
        </Link>
      </div>
    </section>
  );
}
