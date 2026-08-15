"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { X, Sparkles } from "lucide-react";
import { useSiteContent } from "@/lib/site-content";

const DISMISS_KEY = "nashemann_promo_dismissed";

export function PromoPopup() {
  const PROMO_POPUP = useSiteContent("promo_popup");
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    if (!PROMO_POPUP.enabled) return;
    if (typeof window !== "undefined" && sessionStorage.getItem(DISMISS_KEY)) return;
    const t = setTimeout(() => setVisible(true), PROMO_POPUP.delayMs);
    return () => clearTimeout(t);
  }, [PROMO_POPUP.enabled, PROMO_POPUP.delayMs]);

  function dismiss() {
    setVisible(false);
    sessionStorage.setItem(DISMISS_KEY, "1");
  }

  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          initial={{ opacity: 0, y: 40, scale: 0.95 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: 20, scale: 0.95 }}
          transition={{ type: "spring", stiffness: 260, damping: 24 }}
          className="fixed bottom-5 left-5 z-40 w-[calc(100vw-2.5rem)] max-w-sm overflow-hidden rounded-[var(--radius-lg)] lg:bottom-8 lg:left-8"
          style={{ background: "var(--surface-solid)", border: "1px solid var(--border-strong)", boxShadow: "var(--shadow-soft)" }}
        >
          <div className="h-1.5 w-full" style={{ background: "var(--accent-gradient)" }} />
          <div className="p-5">
            <div className="flex items-start justify-between gap-3">
              <span className="inline-flex items-center gap-1.5 rounded-full bg-[rgba(255,176,32,0.14)] px-2.5 py-1 text-[0.65rem] font-semibold text-[var(--accent-amber)]">
                <Sparkles size={11} /> {PROMO_POPUP.eyebrow}
              </span>
              <button onClick={dismiss} className="text-[var(--text-faint)] hover:text-[var(--text)]" aria-label="Dismiss">
                <X size={16} />
              </button>
            </div>
            <h3 className="font-display mt-3 text-base font-semibold text-[var(--text)]">{PROMO_POPUP.headline}</h3>
            <p className="mt-1.5 text-sm text-[var(--text-muted)]">{PROMO_POPUP.description}</p>
            <Link
              href="/apply"
              onClick={dismiss}
              className="mt-4 inline-flex items-center rounded-full px-4 py-2 text-sm font-semibold text-black"
              style={{ background: "var(--accent-gradient)" }}
            >
              {PROMO_POPUP.cta}
            </Link>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
