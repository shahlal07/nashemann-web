"use client";

import { useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { PartyPopper, X, type LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";

export function CelebrationBanner({
  title,
  message,
  icon: Icon = PartyPopper,
  onDismiss,
  className,
}: {
  title: string;
  message?: string;
  icon?: LucideIcon;
  onDismiss?: () => void;
  className?: string;
}) {
  const [visible, setVisible] = useState(true);

  const dismiss = () => {
    setVisible(false);
    onDismiss?.();
  };

  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          initial={{ opacity: 0, y: -16, scale: 0.98 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: -12, scale: 0.98 }}
          transition={{ type: "spring", stiffness: 300, damping: 26 }}
          className={cn(
            "relative flex items-center gap-3 overflow-hidden rounded-[var(--radius-lg)] border border-[var(--border-strong)] p-4",
            className
          )}
          style={{ background: "var(--accent-gradient-soft)", boxShadow: "var(--shadow-glow-violet)" }}
          role="status"
        >
          <div
            className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl"
            style={{ background: "rgba(139,107,255,0.18)", color: "var(--accent-violet)" }}
          >
            <Icon size={20} />
          </div>
          <div className="flex-1">
            <p className="font-display text-sm font-semibold text-[var(--text)]">{title}</p>
            {message && <p className="mt-0.5 text-xs text-[var(--text-muted)]">{message}</p>}
          </div>
          <button
            type="button"
            onClick={dismiss}
            aria-label="Dismiss"
            className="shrink-0 rounded-full p-1.5 text-[var(--text-muted)] transition-colors hover:bg-[var(--surface-hover)] hover:text-[var(--text)]"
          >
            <X size={16} />
          </button>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
