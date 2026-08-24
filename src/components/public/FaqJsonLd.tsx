import { buildFaqs, DEFAULT_FAQ_PRICING } from "@/lib/faq-content";

// Reverted to sync + hardcoded defaults: every other data-fetching call in
// this codebase that uses the browser Supabase client (mock-data.ts's
// getPlatformPricing/getCategorySchemas/etc.) is only ever called from a
// "use client" component's effect, never during server-side rendering --
// this was the one place breaking that convention. Given this repo's
// documented history of subtle server/client boundary crashes taking down
// the whole site, reverting rather than risking it for what's just SEO
// structured data (the visible FAQ section already shows live pricing via
// its own client-side fetch).
export function FaqJsonLd() {
  const faqs = buildFaqs(DEFAULT_FAQ_PRICING);
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: faqs.map((f) => ({
      "@type": "Question",
      name: f.q,
      acceptedAnswer: { "@type": "Answer", text: f.a },
    })),
  };
  return (
    <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
  );
}
