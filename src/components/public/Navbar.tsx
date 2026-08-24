"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Menu, X, ArrowRight } from "lucide-react";
import { ThemeToggle } from "@/components/shared/ThemeToggle";
import { NotificationBell } from "@/components/shared/NotificationBell";

const LINKS = [
  { label: "Features", href: "/#features" },
  { label: "How it works", href: "/#how-it-works" },
  { label: "Pricing", href: "/pricing" },
  { label: "Rewards", href: "/rewards" },
  { label: "Influencers", href: "/influencers" },
  { label: "Contact", href: "/contact" },
];

export function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <header
      className={`sticky top-0 z-40 transition-all duration-300 ${
        scrolled ? "border-b border-[var(--border)] bg-[var(--bg)]/80 backdrop-blur-xl" : "bg-transparent"
      }`}
    >
      <nav className="mx-auto flex h-16 max-w-7xl items-center justify-between px-5 lg:px-8">
        <Link href="/" className="flex items-center gap-2.5">
          <div
            className="flex h-8 w-8 items-center justify-center rounded-lg text-sm font-bold text-black"
            style={{ background: "var(--accent-gradient)" }}
          >
            N
          </div>
          <span className="font-display text-[1.05rem] font-semibold tracking-tight text-[var(--text)]">
            Nashemann
          </span>
        </Link>

        <div className="hidden items-center gap-8 lg:flex">
          {LINKS.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="relative text-sm font-medium text-[var(--text-muted)] transition-colors hover:text-[var(--text)]"
            >
              {link.label}
            </Link>
          ))}
        </div>

        <div className="hidden items-center gap-2 lg:flex">
          <NotificationBell />
          <ThemeToggle />
          <Link
            href="/account"
            className="px-2 text-sm font-medium text-[var(--text-muted)] hover:text-[var(--text)]"
          >
            My Account
          </Link>
          <Link href="/apply">
            <motion.span
              whileHover={{ scale: 1.03 }}
              whileTap={{ scale: 0.97 }}
              className="inline-flex items-center gap-1.5 rounded-full px-4 py-2 text-sm font-semibold text-black shadow-[var(--shadow-glow-violet)]"
              style={{ background: "var(--accent-gradient)" }}
            >
              Apply for your store <ArrowRight size={14} />
            </motion.span>
          </Link>
        </div>

        <div className="flex items-center gap-1 lg:hidden">
          <NotificationBell />
          <ThemeToggle />
          <button
            onClick={() => setOpen(true)}
            className="rounded-lg p-2 text-[var(--text)]"
            aria-label="Open menu"
          >
            <Menu size={22} />
          </button>
        </div>
      </nav>

      <AnimatePresence>
        {open && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm lg:hidden"
              onClick={() => setOpen(false)}
            />
            <motion.div
              initial={{ x: "100%" }}
              animate={{ x: 0 }}
              exit={{ x: "100%" }}
              transition={{ type: "spring", stiffness: 300, damping: 32 }}
              className="fixed inset-y-0 right-0 z-50 w-72 bg-[var(--surface-elevated)] p-6 lg:hidden"
            >
              <button onClick={() => setOpen(false)} className="mb-6 ml-auto flex rounded-lg p-1.5 text-[var(--text-muted)]" aria-label="Close menu">
                <X size={20} />
              </button>
              <div className="flex flex-col gap-1">
                {LINKS.map((link) => (
                  <Link
                    key={link.href}
                    href={link.href}
                    onClick={() => setOpen(false)}
                    className="rounded-lg px-3 py-2.5 text-sm font-medium text-[var(--text-muted)] hover:bg-[var(--surface-hover)] hover:text-[var(--text)]"
                  >
                    {link.label}
                  </Link>
                ))}
                <Link
                  href="/account"
                  onClick={() => setOpen(false)}
                  className="rounded-lg px-3 py-2.5 text-sm font-medium text-[var(--text-muted)] hover:bg-[var(--surface-hover)] hover:text-[var(--text)]"
                >
                  My Account
                </Link>
                <Link
                  href="/revenue"
                  onClick={() => setOpen(false)}
                  className="rounded-lg px-3 py-2.5 text-sm font-medium text-[var(--text-muted)] hover:bg-[var(--surface-hover)] hover:text-[var(--text)]"
                >
                  Store revenue login
                </Link>
              </div>
              <Link
                href="/apply"
                onClick={() => setOpen(false)}
                className="mt-4 block rounded-full px-4 py-2.5 text-center text-sm font-semibold text-black"
                style={{ background: "var(--accent-gradient)" }}
              >
                Apply for your store
              </Link>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </header>
  );
}
