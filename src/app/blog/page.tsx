import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight, BookOpen, Clock } from "lucide-react";
import { TiltCard } from "@/components/public/TiltCard";
import { BLOG_POSTS } from "./posts";
import { formatDate } from "@/lib/utils";

const TITLE = "Blog";
const DESCRIPTION =
  "Practical, no-nonsense writing on selling online in Pakistan — moving off WhatsApp DMs, pricing, and what actually changes when you launch a real store.";

export const metadata: Metadata = {
  title: TITLE,
  description: DESCRIPTION,
  alternates: { canonical: "/blog" },
  openGraph: { title: `${TITLE} — Nashemann`, description: DESCRIPTION, type: "website" },
};

export default function BlogIndexPage() {
  return (
    <div className="mx-auto max-w-5xl px-5 py-16 lg:px-8 lg:py-24">
      <div className="mx-auto max-w-2xl text-center">
        <span className="inline-flex items-center gap-1.5 rounded-full bg-[rgba(139,107,255,0.14)] px-3 py-1 text-xs font-semibold text-[var(--accent-violet)]">
          <BookOpen size={13} /> Nashemann Blog
        </span>
        <h1 className="font-display mt-4 text-4xl font-semibold tracking-tight text-[var(--text)] sm:text-5xl">
          Selling online, <span className="accent-text">explained plainly</span>.
        </h1>
        <p className="mt-4 text-lg text-[var(--text-muted)]">
          Straight answers for Pakistani small businesses figuring out what moving online actually involves.
        </p>
      </div>

      <div className="mt-14 grid grid-cols-1 gap-6 lg:grid-cols-3">
        {BLOG_POSTS.map((post) => (
          <Link key={post.slug} href={`/blog/${post.slug}`} className="block h-full">
            <TiltCard strength={5} className="flex h-full flex-col p-6">
              <span className="w-fit rounded-full bg-[var(--surface-hover)] px-2.5 py-1 text-[0.65rem] font-semibold text-[var(--text-muted)]">
                {post.tag}
              </span>
              <h2 className="font-display mt-4 text-lg font-semibold leading-snug text-[var(--text)]">{post.title}</h2>
              <p className="mt-2.5 flex-1 text-sm leading-relaxed text-[var(--text-muted)]">{post.excerpt}</p>
              <div className="mt-5 flex items-center justify-between border-t border-[var(--border)] pt-4">
                <div className="flex items-center gap-3 text-xs text-[var(--text-faint)]">
                  <span>{formatDate(post.publishedAt)}</span>
                  <span className="flex items-center gap-1">
                    <Clock size={12} /> {post.readTimeMinutes} min read
                  </span>
                </div>
                <ArrowRight size={15} className="text-[var(--accent-violet)]" />
              </div>
            </TiltCard>
          </Link>
        ))}
      </div>
    </div>
  );
}
