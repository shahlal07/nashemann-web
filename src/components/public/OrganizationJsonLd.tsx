import { createClient } from "@/lib/supabase/server";
import type { ContactContent, SocialLinks } from "@/lib/site-content";

const SITE_URL = "https://nashemann-web.vercel.app";

// Duplicated (not imported) from site-content.ts's SITE_CONTENT_DEFAULTS: importing a
// value export from a "use client" module into a Server Component resolves to
// `undefined` at build/prerender time, so this fallback is kept self-contained here.
const FALLBACK_CONTACT: ContactContent = {
  whatsappNumber: "923001234567",
  whatsappDisplay: "+92 300 1234567",
  supportEmail: "hello@nashemann.com",
  phoneDisplay: "+92 42 1234 5678",
  phoneHref: "tel:+924212345678",
  address: "Gulberg III, Lahore, Pakistan",
  hours: "Mon–Sat, 9am–8pm PKT",
};
const FALLBACK_SOCIAL: SocialLinks = {
  instagram: "https://instagram.com/nashemann",
  facebook: "https://facebook.com/nashemann",
  tiktok: "https://tiktok.com/@nashemann",
  linkedin: "https://linkedin.com/company/nashemann",
  youtube: "https://youtube.com/@nashemann",
};

async function getContactAndSocial(): Promise<{ contact: ContactContent; social: SocialLinks }> {
  try {
    const supabase = await createClient();
    const { data, error } = await supabase.from("site_content").select("key, value").in("key", ["contact", "social_links"]);
    if (error || !data) throw error ?? new Error("no data");
    const map = new Map(data.map((row) => [row.key as string, row.value]));
    return {
      contact: (map.get("contact") as ContactContent) ?? FALLBACK_CONTACT,
      social: (map.get("social_links") as SocialLinks) ?? FALLBACK_SOCIAL,
    };
  } catch {
    return { contact: FALLBACK_CONTACT, social: FALLBACK_SOCIAL };
  }
}

export async function OrganizationJsonLd() {
  const { contact, social } = await getContactAndSocial();

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Organization",
    name: "Nashemann",
    url: SITE_URL,
    logo: `${SITE_URL}/favicon.ico`,
    description: "The infrastructure behind independent online stores in Pakistan — branded storefronts, orders, and revenue tracking, live in days.",
    email: contact.supportEmail,
    telephone: contact.phoneDisplay,
    address: {
      "@type": "PostalAddress",
      streetAddress: contact.address,
      addressCountry: "PK",
    },
    sameAs: [social.instagram, social.facebook, social.tiktok, social.linkedin, social.youtube].filter(Boolean),
    contactPoint: {
      "@type": "ContactPoint",
      contactType: "customer support",
      email: contact.supportEmail,
      telephone: contact.phoneDisplay,
      areaServed: "PK",
    },
  };

  return (
    <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
  );
}
