"use client";

import Link from "next/link";
import { BrandIcon } from "@/components/shared/BrandIcon";
import { useSiteContent } from "@/lib/site-content";

const COLUMNS = [
  {
    heading: "Platform",
    links: [
      { label: "Features", href: "/#features" },
      { label: "How it works", href: "/#how-it-works" },
      { label: "Pricing", href: "/pricing" },
      { label: "Rewards & Referrals", href: "/rewards" },
      { label: "Influencer Program", href: "/influencers" },
      { label: "Updates", href: "/updates" },
    ],
  },
  {
    heading: "Get started",
    links: [
      { label: "Apply for your store", href: "/apply" },
      { label: "Track my application", href: "/apply/track" },
    ],
  },
  {
    heading: "Support",
    links: [
      { label: "Chat with us", href: "/chat" },
      { label: "Contact us", href: "/contact" },
      { label: "Report a bug", href: "/report-bug" },
    ],
  },
];

export function Footer() {
  const CONTACT_CONTENT = useSiteContent("contact");
  const SOCIAL_LINKS = useSiteContent("social_links");
  const SOCIAL_ICONS = [
    { name: "instagram" as const, href: SOCIAL_LINKS.instagram, label: "Instagram" },
    { name: "facebook" as const, href: SOCIAL_LINKS.facebook, label: "Facebook" },
    { name: "linkedin" as const, href: SOCIAL_LINKS.linkedin, label: "LinkedIn" },
    { name: "youtube" as const, href: SOCIAL_LINKS.youtube, label: "YouTube" },
    { name: "whatsapp" as const, href: `https://wa.me/${CONTACT_CONTENT.whatsappNumber}`, label: "WhatsApp" },
  ];
  return (
    <footer className="border-t border-[var(--border)] bg-[var(--surface-elevated)]">
      <div className="mx-auto max-w-7xl px-5 py-12 lg:px-8">
        <div className="grid grid-cols-2 gap-8 sm:grid-cols-4">
          <div className="col-span-2 sm:col-span-1">
            <div className="flex items-center gap-2.5">
              <div
                className="flex h-8 w-8 items-center justify-center rounded-lg text-sm font-bold text-black"
                style={{ background: "var(--accent-gradient)" }}
              >
                N
              </div>
              <span className="font-display text-[1.05rem] font-semibold text-[var(--text)]">Nashemann</span>
            </div>
            <p className="mt-3 max-w-xs text-sm text-[var(--text-faint)]">
              The infrastructure behind independent online stores across Pakistan.
            </p>
          </div>

          {COLUMNS.map((col) => (
            <div key={col.heading}>
              <p className="text-xs font-semibold uppercase tracking-wide text-[var(--text-faint)]">{col.heading}</p>
              <ul className="mt-3 space-y-2.5">
                {col.heading === "Get started" && (
                  <li>
                    <Link href="/signup" className="text-sm text-[var(--text-muted)] hover:text-[var(--text)]">
                      Sign up
                    </Link>
                    <span className="mx-1.5 text-[var(--text-faint)]">/</span>
                    <Link href="/login" className="text-sm text-[var(--text-muted)] hover:text-[var(--text)]">
                      Log in
                    </Link>
                  </li>
                )}
                {col.links.map((l) => (
                  <li key={l.href}>
                    <Link href={l.href} className="text-sm text-[var(--text-muted)] hover:text-[var(--text)]">
                      {l.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <div className="mt-10 flex flex-col items-center justify-between gap-4 border-t border-[var(--border)] pt-6 sm:flex-row">
          <p className="text-xs text-[var(--text-faint)]">© 2026 Nashemann. All rights reserved.</p>
          <div className="flex items-center gap-4">
            <p className="text-xs text-[var(--text-faint)]">{CONTACT_CONTENT.supportEmail}</p>
            <div className="flex items-center gap-1">
              {SOCIAL_ICONS.map((s) => (
                <a
                  key={s.label}
                  href={s.href}
                  target="_blank"
                  rel="noreferrer"
                  aria-label={s.label}
                  className="flex h-8 w-8 items-center justify-center rounded-full text-[var(--text-faint)] transition-colors hover:bg-[var(--surface-hover)] hover:text-[var(--text)]"
                >
                  <BrandIcon name={s.name} size={15} />
                </a>
              ))}
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}
