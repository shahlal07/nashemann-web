import { buildFaqs, DEFAULT_FAQ_PRICING } from "@/lib/faq-content";
import { getPlatformPricing } from "@/lib/mock-data";

export async function FaqJsonLd() {
  // JSON-LD is crawled by search engines, so it must reflect the live
  // platform_pricing row like the visible FAQ section does -- previously it
  // always emitted the seeded defaults regardless of actual pricing.
  const pricing = await getPlatformPricing().catch(() => DEFAULT_FAQ_PRICING);
  const faqs = buildFaqs(pricing);
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
