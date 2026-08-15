"use client";

import { motion } from "framer-motion";
import { Radio } from "lucide-react";
import { useEffect, useState } from "react";
import { TiltCard } from "@/components/public/TiltCard";
import { createClient } from "@/lib/supabase/client";
import { formatDate } from "@/lib/utils";

type AnnouncementCategory = "product_update" | "policy_change" | "promotion";

type SentAnnouncement = {
  id: string;
  category: AnnouncementCategory;
  title: string;
  message: string;
  sentAt: string;
};

const ANNOUNCEMENT_CATEGORY_LABEL: Record<AnnouncementCategory, string> = {
  product_update: "Product Update",
  policy_change: "Policy Change",
  promotion: "Offer / Promotion",
};

type SentAnnouncementRow = {
  id: string;
  category: AnnouncementCategory;
  title: string;
  message: string;
  sent_at: string;
};

export default function UpdatesPage() {
  const [announcements, setAnnouncements] = useState<SentAnnouncement[]>([]);

  useEffect(() => {
    let active = true;
    const supabase = createClient();
    supabase
      .from("sent_announcements")
      .select("id, category, title, message, sent_at")
      .order("sent_at", { ascending: false })
      .then(({ data, error }) => {
        if (!active || error || !data) return;
        setAnnouncements(
          (data as SentAnnouncementRow[]).map((row) => ({
            id: row.id,
            category: row.category,
            title: row.title,
            message: row.message,
            sentAt: row.sent_at,
          }))
        );
      });
    return () => {
      active = false;
    };
  }, []);

  return (
    <div className="mx-auto max-w-3xl px-5 py-16 lg:py-24">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }} className="text-center">
        <span className="inline-flex items-center gap-1.5 rounded-full bg-[rgba(139,107,255,0.14)] px-3 py-1 text-xs font-semibold text-[var(--accent-violet)]">
          <Radio size={13} /> Platform updates
        </span>
        <h1 className="font-display mt-4 text-4xl font-semibold tracking-tight text-[var(--text)] sm:text-5xl">
          What&apos;s new on Nashemann.
        </h1>
        <p className="mt-3 text-[var(--text-muted)]">Product updates, policy changes, and promotions — straight from the team.</p>
      </motion.div>

      <div className="mt-14 space-y-4">
        {announcements.length === 0 && (
          <p className="text-center text-sm text-[var(--text-faint)]">No updates yet — check back soon.</p>
        )}
        {announcements.map((a, i) => (
          <motion.div
            key={a.id}
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-60px" }}
            transition={{ duration: 0.5, delay: i * 0.08 }}
          >
            <TiltCard strength={3} glare={false} className="p-6">
              <div className="flex items-center justify-between gap-2">
                <span className="rounded-full bg-[var(--surface-hover)] px-2.5 py-1 text-[0.65rem] font-semibold text-[var(--text-muted)]">
                  {ANNOUNCEMENT_CATEGORY_LABEL[a.category]}
                </span>
                <span className="text-xs text-[var(--text-faint)]">{formatDate(a.sentAt)}</span>
              </div>
              <h2 className="font-display mt-3 text-lg font-semibold text-[var(--text)]">{a.title}</h2>
              <p className="mt-1.5 text-sm text-[var(--text-muted)]">{a.message}</p>
            </TiltCard>
          </motion.div>
        ))}
      </div>
    </div>
  );
}
