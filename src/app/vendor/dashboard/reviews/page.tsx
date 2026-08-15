"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { Star, CornerDownRight, Send, ShieldCheck } from "lucide-react";
import { TiltCard } from "@/components/public/TiltCard";
import { Button } from "@/components/ui/Button";
import { createClient } from "@/lib/supabase/client";
import { useVendorSessionContext } from "@/lib/vendor-session-context";
import { formatDate } from "@/lib/utils";

type Review = {
  id: string;
  product_name: string;
  rating: number;
  title: string | null;
  body: string;
  verified_purchase: boolean;
  customer_name: string;
  created_at: string;
  admin_reply_body: string | null;
  admin_reply_at: string | null;
};

function Stars({ rating }: { rating: number }) {
  return (
    <div className="flex gap-0.5">
      {Array.from({ length: 5 }).map((_, i) => (
        <Star key={i} size={13} className={i < rating ? "fill-[var(--accent-amber)] text-[var(--accent-amber)]" : "text-[var(--border-strong)]"} />
      ))}
    </div>
  );
}

export default function VendorReviewsPage() {
  const { state } = useVendorSessionContext();
  const [reviews, setReviews] = useState<Review[]>([]);
  const [replyDrafts, setReplyDrafts] = useState<Record<string, string>>({});
  const [sendingId, setSendingId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  async function loadReviews(vendorId: string) {
    const supabase = createClient();
    const { data } = await supabase
      .from("reviews")
      .select("id, product_name, rating, title, body, verified_purchase, customer_name, created_at, admin_reply_body, admin_reply_at")
      .eq("vendor_id", vendorId)
      .order("created_at", { ascending: false });
    setReviews((data ?? []) as Review[]);
  }

  useEffect(() => {
    if (state.status !== "ready") return;
    let active = true;
    (async () => {
      const vendorId = state.vendor.id;
      const supabase = createClient();
      const { data } = await supabase
        .from("reviews")
        .select("id, product_name, rating, title, body, verified_purchase, customer_name, created_at, admin_reply_body, admin_reply_at")
        .eq("vendor_id", vendorId)
        .order("created_at", { ascending: false });
      if (active) setReviews((data ?? []) as Review[]);
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

  async function sendReply(reviewId: string) {
    const body = (replyDrafts[reviewId] ?? "").trim();
    if (!body) return;
    setSendingId(reviewId);
    setError(null);
    const supabase = createClient();
    const { error: rpcError } = await supabase.rpc("vendor_reply_to_review", { p_review_id: reviewId, p_reply: body });
    setSendingId(null);
    if (rpcError) {
      setError(rpcError.message);
      return;
    }
    setReplyDrafts((d) => ({ ...d, [reviewId]: "" }));
    loadReviews(vendorId);
  }

  return (
    <div className="mx-auto max-w-3xl px-5 py-8 lg:py-10">
      <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
        <h1 className="font-display text-2xl font-semibold text-[var(--text)]">Reviews</h1>
        <p className="mt-1 text-sm text-[var(--text-muted)]">See what customers are saying and reply publicly as your store.</p>
      </motion.div>

      {error && <p className="mt-4 text-sm text-[var(--danger)]">{error}</p>}

      <div className="mt-6 space-y-3">
        {reviews.map((r) => (
          <TiltCard key={r.id} strength={1} glare={false} className="p-5">
            <div className="flex items-start justify-between gap-3">
              <div>
                <div className="flex items-center gap-2">
                  <Stars rating={r.rating} />
                  {r.verified_purchase && (
                    <span className="flex items-center gap-1 text-[0.65rem] font-semibold text-[var(--success)]">
                      <ShieldCheck size={11} /> Verified purchase
                    </span>
                  )}
                </div>
                {r.title && <p className="mt-1.5 text-sm font-semibold text-[var(--text)]">{r.title}</p>}
                <p className="mt-1 text-sm text-[var(--text-muted)]">{r.body}</p>
                <p className="mt-1.5 text-xs text-[var(--text-faint)]">
                  {r.customer_name} · {r.product_name} · {formatDate(r.created_at)}
                </p>
              </div>
            </div>

            {r.admin_reply_body ? (
              <div className="mt-3 flex gap-2 rounded-[var(--radius-sm)] border border-[var(--border)] bg-[var(--surface)] p-3">
                <CornerDownRight size={13} className="mt-0.5 shrink-0 text-[var(--accent-violet)]" />
                <div>
                  <p className="text-xs font-semibold text-[var(--text)]">Your reply</p>
                  <p className="mt-0.5 text-sm text-[var(--text-muted)]">{r.admin_reply_body}</p>
                  <p className="mt-1 text-[0.65rem] text-[var(--text-faint)]">{formatDate(r.admin_reply_at)}</p>
                </div>
              </div>
            ) : (
              <div className="mt-3 flex gap-2">
                <input
                  className="flex-1 rounded-[var(--radius-sm)] border border-[var(--border)] bg-[var(--surface)] px-3.5 py-2 text-sm text-[var(--text)] outline-none placeholder:text-[var(--text-faint)] focus:border-[var(--accent-violet)]"
                  placeholder="Write a public reply…"
                  value={replyDrafts[r.id] ?? ""}
                  onChange={(e) => setReplyDrafts((d) => ({ ...d, [r.id]: e.target.value }))}
                  maxLength={800}
                />
                <Button variant="secondary" onClick={() => sendReply(r.id)} disabled={sendingId === r.id || !(replyDrafts[r.id] ?? "").trim()}>
                  <Send size={13} />
                </Button>
              </div>
            )}
          </TiltCard>
        ))}
        {reviews.length === 0 && (
          <TiltCard strength={0} glare={false} className="p-8 text-center">
            <p className="text-sm text-[var(--text-faint)]">No reviews yet.</p>
          </TiltCard>
        )}
      </div>
    </div>
  );
}
