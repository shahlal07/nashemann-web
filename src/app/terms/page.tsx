import type { Metadata } from "next";
import { createClient } from "@/lib/supabase/server";
import { SITE_CONTENT_DEFAULTS, type TermsContent } from "@/lib/site-content-data";

export const metadata: Metadata = {
  title: "Terms & Conditions",
  description: "The terms that govern using Nashemann as a vendor, influencer, or customer of any store on the platform.",
};

async function getTerms(): Promise<TermsContent> {
  try {
    const supabase = await createClient();
    const { data } = await supabase.from("platform_site_content").select("value").eq("key", "terms").maybeSingle();
    return (data?.value as TermsContent) ?? SITE_CONTENT_DEFAULTS.terms;
  } catch {
    return SITE_CONTENT_DEFAULTS.terms;
  }
}

export default async function TermsPage() {
  const terms = await getTerms();

  return (
    <div className="mx-auto max-w-3xl px-5 py-16 lg:py-24">
      <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[var(--accent-violet)]">Legal</p>
      <h1 className="font-display mt-2 text-3xl font-semibold tracking-tight text-[var(--text)] sm:text-4xl">
        Terms &amp; Conditions
      </h1>
      <p className="mt-3 text-sm text-[var(--text-faint)]">Last updated: {terms.lastUpdated}</p>
      <p className="mt-6 text-[var(--text-muted)]">{terms.intro}</p>

      <div className="mt-10 space-y-8">
        {terms.sections.map((s) => (
          <section key={s.title}>
            <h2 className="font-display text-lg font-semibold text-[var(--text)]">{s.title}</h2>
            <p className="mt-2 whitespace-pre-wrap leading-relaxed text-[var(--text-muted)]">{s.body}</p>
          </section>
        ))}
      </div>
    </div>
  );
}
