"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import {
  SITE_CONTENT_DEFAULTS,
  type SiteContent,
  type HeroContent,
  type HowItWorksItem,
  type FeatureItem,
  type TestimonialItem,
  type RewardsContent,
  type ContactContent,
  type SocialLinks,
  type PromoPopupContent,
  type AiSupportContent,
  type TermsContent,
} from "@/lib/site-content-data";

export {
  SITE_CONTENT_DEFAULTS,
  type SiteContent,
  type HeroStat,
  type HeroContent,
  type HowItWorksItem,
  type FeatureItem,
  type TestimonialItem,
  type RewardsTier,
  type RewardsContent,
  type ContactContent,
  type SocialLinks,
  type PromoPopupContent,
  type AiSupportContent,
  type TermsSection,
  type TermsContent,
} from "@/lib/site-content-data";

/**
 * Every string/number on the public marketing site is fetched from the
 * `platform_site_content` table (key/value jsonb rows) instead of living
 * inline in JSX. SITE_CONTENT_DEFAULTS (imported above from the
 * non-"use client" site-content-data.ts) mirrors the seeded rows exactly,
 * so a component's first paint (before the fetch resolves) looks identical
 * to the fetched result -- no flash of different content.
 */

let cached: Promise<SiteContent> | null = null;

async function fetchSiteContent(): Promise<SiteContent> {
  try {
    const supabase = createClient();
    const { data, error } = await supabase.from("platform_site_content").select("key, value");
    if (error || !data) return SITE_CONTENT_DEFAULTS;
    const map = new Map(data.map((row) => [row.key as string, row.value]));
    return {
      hero: (map.get("hero") as HeroContent) ?? SITE_CONTENT_DEFAULTS.hero,
      how_it_works: (map.get("how_it_works") as HowItWorksItem[]) ?? SITE_CONTENT_DEFAULTS.how_it_works,
      features: (map.get("features") as FeatureItem[]) ?? SITE_CONTENT_DEFAULTS.features,
      testimonials: (map.get("testimonials") as TestimonialItem[]) ?? SITE_CONTENT_DEFAULTS.testimonials,
      rewards: (map.get("rewards") as RewardsContent) ?? SITE_CONTENT_DEFAULTS.rewards,
      contact: (map.get("contact") as ContactContent) ?? SITE_CONTENT_DEFAULTS.contact,
      social_links: (map.get("social_links") as SocialLinks) ?? SITE_CONTENT_DEFAULTS.social_links,
      promo_popup: (map.get("promo_popup") as PromoPopupContent) ?? SITE_CONTENT_DEFAULTS.promo_popup,
      ai_support: (map.get("ai_support") as AiSupportContent) ?? SITE_CONTENT_DEFAULTS.ai_support,
      terms: (map.get("terms") as TermsContent) ?? SITE_CONTENT_DEFAULTS.terms,
    };
  } catch {
    // Supabase client creation or network failure — gracefully degrade to
    // the hardcoded defaults so the page always renders.
    return SITE_CONTENT_DEFAULTS;
  }
}

export function getSiteContent(): Promise<SiteContent> {
  if (!cached) cached = fetchSiteContent();
  return cached;
}

/** Reads one section of `site_content`, starting from the matching default and swapping in the fetched value once it resolves. */
export function useSiteContent<K extends keyof SiteContent>(key: K): SiteContent[K] {
  const [value, setValue] = useState<SiteContent[K]>(SITE_CONTENT_DEFAULTS[key]);
  useEffect(() => {
    let active = true;
    getSiteContent()
      .then((content) => {
        if (active) setValue(content[key]);
      })
      .catch(() => {
        /* stay on defaults */
      });
    return () => {
      active = false;
    };
  }, [key]);
  return value;
}
