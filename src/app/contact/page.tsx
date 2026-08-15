"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { Mail, Phone, MapPin, Clock, Send, CheckCircle2 } from "lucide-react";
import { TiltCard } from "@/components/public/TiltCard";
import { BrandIcon } from "@/components/shared/BrandIcon";
import { useSiteContent } from "@/lib/site-content";

const inputClass =
  "w-full rounded-[var(--radius-sm)] border border-[var(--border)] bg-[var(--surface)] px-4 py-3 text-sm text-[var(--text)] outline-none transition-colors placeholder:text-[var(--text-faint)] focus:border-[var(--accent-violet)] accent-ring";
const labelClass = "mb-1.5 block text-xs font-medium text-[var(--text-muted)]";

const TONE_BG: Record<string, string> = {
  success: "rgba(52,211,153,0.14)",
  violet: "rgba(139,107,255,0.14)",
  amber: "rgba(255,176,32,0.14)",
};
const TONE_TEXT: Record<string, string> = {
  success: "var(--success)",
  violet: "var(--accent-violet)",
  amber: "var(--accent-amber)",
};

export default function ContactPage() {
  const CONTACT_CONTENT = useSiteContent("contact");
  const SOCIAL_LINKS = useSiteContent("social_links");
  const [sent, setSent] = useState(false);

  const CHANNELS = [
    {
      brand: "whatsapp" as const,
      label: "WhatsApp",
      value: CONTACT_CONTENT.whatsappDisplay,
      href: `https://wa.me/${CONTACT_CONTENT.whatsappNumber}`,
      tone: "success" as const,
    },
    { icon: Mail, label: "Email", value: CONTACT_CONTENT.supportEmail, href: `mailto:${CONTACT_CONTENT.supportEmail}`, tone: "violet" as const },
    { icon: Phone, label: "Phone", value: CONTACT_CONTENT.phoneDisplay, href: CONTACT_CONTENT.phoneHref, tone: "amber" as const },
  ];

  const SOCIALS = [
    { brand: "instagram" as const, href: SOCIAL_LINKS.instagram, label: "Instagram" },
    { brand: "facebook" as const, href: SOCIAL_LINKS.facebook, label: "Facebook" },
    { brand: "linkedin" as const, href: SOCIAL_LINKS.linkedin, label: "LinkedIn" },
    { brand: "youtube" as const, href: SOCIAL_LINKS.youtube, label: "YouTube" },
  ];

  return (
    <div className="mx-auto max-w-6xl px-5 py-16 lg:px-8 lg:py-24">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }} className="mx-auto max-w-2xl text-center">
        <h1 className="font-display text-4xl font-semibold tracking-tight text-[var(--text)] sm:text-5xl">
          We&apos;re here to help.
        </h1>
        <p className="mt-4 text-lg text-[var(--text-muted)]">
          Real humans, backed by an AI assistant that never sleeps. Reach us however&apos;s easiest.
        </p>
      </motion.div>

      <div className="mt-14 grid grid-cols-1 gap-6 lg:grid-cols-[1fr_1.2fr]">
        <div className="space-y-4">
          {CHANNELS.map((c, i) => (
            <motion.a
              key={c.label}
              href={c.href}
              target="_blank"
              rel="noreferrer"
              initial={{ opacity: 0, x: -16 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.4, delay: i * 0.08 }}
              whileHover={{ x: 4 }}
              className="glass-panel flex items-center gap-4 rounded-[var(--radius-lg)] p-5"
            >
              <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl" style={{ background: TONE_BG[c.tone], color: TONE_TEXT[c.tone] }}>
                {c.brand ? <BrandIcon name={c.brand} size={19} /> : c.icon && <c.icon size={19} />}
              </div>
              <div>
                <p className="text-xs text-[var(--text-faint)]">{c.label}</p>
                <p className="text-sm font-semibold text-[var(--text)]">{c.value}</p>
              </div>
            </motion.a>
          ))}

          <div className="glass-panel space-y-3 rounded-[var(--radius-lg)] p-5">
            <p className="flex items-center gap-2 text-sm text-[var(--text-muted)]">
              <MapPin size={15} className="text-[var(--text-faint)]" /> {CONTACT_CONTENT.address}
            </p>
            <p className="flex items-center gap-2 text-sm text-[var(--text-muted)]">
              <Clock size={15} className="text-[var(--text-faint)]" /> {CONTACT_CONTENT.hours}
            </p>
          </div>

          <div className="glass-panel flex items-center gap-2 rounded-[var(--radius-lg)] p-5">
            {SOCIALS.map((s) => (
              <a
                key={s.label}
                href={s.href}
                target="_blank"
                rel="noreferrer"
                aria-label={s.label}
                className="flex h-9 w-9 items-center justify-center rounded-full text-[var(--text-faint)] transition-colors hover:bg-[var(--surface-hover)] hover:text-[var(--text)]"
              >
                <BrandIcon name={s.brand} size={16} />
              </a>
            ))}
          </div>
        </div>

        <TiltCard strength={2} glare={false} className="p-7">
          {sent ? (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex h-full flex-col items-center justify-center py-10 text-center">
              <CheckCircle2 size={36} className="text-[var(--success)]" />
              <p className="mt-3 font-semibold text-[var(--text)]">Message sent</p>
              <p className="mt-1 text-sm text-[var(--text-muted)]">We&apos;ll reply within a few hours.</p>
            </motion.div>
          ) : (
            <form
              onSubmit={(e) => {
                e.preventDefault();
                setSent(true);
              }}
              className="space-y-4"
            >
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <label className="block">
                  <span className={labelClass}>Name</span>
                  <input required className={inputClass} />
                </label>
                <label className="block">
                  <span className={labelClass}>Email</span>
                  <input required type="email" className={inputClass} />
                </label>
              </div>
              <label className="block">
                <span className={labelClass}>Subject</span>
                <input required className={inputClass} />
              </label>
              <label className="block">
                <span className={labelClass}>Message</span>
                <textarea required rows={5} className={inputClass} />
              </label>
              <button
                type="submit"
                className="flex w-full items-center justify-center gap-2 rounded-full py-3.5 text-sm font-semibold text-black shadow-[var(--shadow-glow-violet)]"
                style={{ background: "var(--accent-gradient)" }}
              >
                <Send size={15} /> Send message
              </button>
            </form>
          )}
        </TiltCard>
      </div>
    </div>
  );
}
