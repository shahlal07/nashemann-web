import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, ArrowRight, Clock } from "lucide-react";
import { BLOG_POSTS, getPostBySlug } from "../posts";
import { formatDate } from "@/lib/utils";

export function generateStaticParams() {
  return BLOG_POSTS.map((post) => ({ slug: post.slug }));
}

export async function generateMetadata(props: PageProps<"/blog/[slug]">): Promise<Metadata> {
  const { slug } = await props.params;
  const post = getPostBySlug(slug);
  if (!post) return {};
  return {
    title: post.title,
    description: post.description,
    alternates: { canonical: `/blog/${post.slug}` },
    openGraph: { title: post.title, description: post.description, type: "article", publishedTime: post.publishedAt },
  };
}

export default async function BlogPostPage(props: PageProps<"/blog/[slug]">) {
  const { slug } = await props.params;
  const post = getPostBySlug(slug);
  if (!post) notFound();

  return (
    <article className="mx-auto max-w-2xl px-5 py-16 lg:py-24">
      <Link href="/blog" className="inline-flex items-center gap-1.5 text-sm font-medium text-[var(--text-muted)] hover:text-[var(--text)]">
        <ArrowLeft size={14} /> Back to blog
      </Link>

      <span className="mt-6 inline-block w-fit rounded-full bg-[var(--surface-hover)] px-2.5 py-1 text-[0.65rem] font-semibold text-[var(--text-muted)]">
        {post.tag}
      </span>
      <h1 className="font-display mt-3 text-3xl font-semibold tracking-tight text-[var(--text)] sm:text-4xl">{post.title}</h1>
      <div className="mt-3 flex items-center gap-3 text-xs text-[var(--text-faint)]">
        <span>{formatDate(post.publishedAt)}</span>
        <span className="flex items-center gap-1">
          <Clock size={12} /> {post.readTimeMinutes} min read
        </span>
      </div>

      <div className="prose-content mt-10 space-y-5">
        {post.content.map((block, i) => {
          if (block.type === "h2") {
            return (
              <h2 key={i} className="font-display pt-3 text-xl font-semibold text-[var(--text)]">
                {block.text}
              </h2>
            );
          }
          if (block.type === "ul") {
            return (
              <ul key={i} className="space-y-2.5 pl-1">
                {block.items.map((item, j) => (
                  <li key={j} className="flex items-start gap-2.5 text-[0.95rem] leading-relaxed text-[var(--text-muted)]">
                    <span className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-[var(--accent-violet)]" />
                    {item}
                  </li>
                ))}
              </ul>
            );
          }
          return (
            <p key={i} className="text-[0.95rem] leading-relaxed text-[var(--text-muted)]">
              {block.text}
            </p>
          );
        })}
      </div>

      <div className="glass-panel mt-14 flex flex-col items-center gap-3 rounded-[var(--radius-lg)] p-7 text-center sm:flex-row sm:justify-between sm:text-left">
        <div>
          <p className="font-display text-lg font-semibold text-[var(--text)]">Ready to move your business online?</p>
          <p className="mt-1 text-sm text-[var(--text-muted)]">Apply in 3 minutes — no upfront cost to start.</p>
        </div>
        <Link
          href="/apply"
          className="inline-flex shrink-0 items-center gap-1.5 rounded-full px-5 py-2.5 text-sm font-semibold text-black"
          style={{ background: "var(--accent-gradient)" }}
        >
          Apply for your store <ArrowRight size={14} />
        </Link>
      </div>
    </article>
  );
}
