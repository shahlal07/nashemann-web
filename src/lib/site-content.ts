"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import type { IconName } from "@/components/public/Icon";

/**
 * Every string/number on the public marketing site is fetched from the
 * `site_content` table (key/value jsonb rows) instead of living inline in
 * JSX. The exported `*_DEFAULTS` below mirror the seeded rows exactly, so a
 * component's first paint (before the fetch resolves) looks identical to
 * the fetched result -- no flash of different content.
 */

export type HeroStat = { label: string; value: number; suffix?: string };
export type HeroContent = {
  eyebrow: string;
  headline: string;
  subheadline: string;
  primaryCta: string;
  secondaryCta: string;
  stats: HeroStat[];
};

export type HowItWorksItem = { title: string; description: string; icon: IconName };
export type FeatureItem = { title: string; description: string; icon: IconName };
export type TestimonialItem = { quote: string; name: string; business: string; emoji: string };

export type RewardsTier = { name: string; ordersRequired: number; perk: string; icon: IconName };
export type RewardsContent = {
  headline: string;
  subheadline: string;
  tiers: RewardsTier[];
  referral: { headline: string; description: string; yourCode: string; reward: number };
};

export type ContactContent = {
  whatsappNumber: string;
  whatsappDisplay: string;
  supportEmail: string;
  phoneDisplay: string;
  phoneHref: string;
  address: string;
  hours: string;
};

export type SocialLinks = {
  instagram: string;
  facebook: string;
  tiktok: string;
  linkedin: string;
  youtube: string;
};

export type PromoPopupContent = {
  enabled: boolean;
  eyebrow: string;
  headline: string;
  description: string;
  cta: string;
  delayMs: number;
};

export type AiSupportContent = { greeting: string; suggestedPrompts: string[] };

export type SiteContent = {
  hero: HeroContent;
  how_it_works: HowItWorksItem[];
  features: FeatureItem[];
  testimonials: TestimonialItem[];
  rewards: RewardsContent;
  contact: ContactContent;
  social_links: SocialLinks;
  promo_popup: PromoPopupContent;
  ai_support: AiSupportContent;
};

export const SITE_CONTENT_DEFAULTS: SiteContent = {
  hero: {
    eyebrow: "Now onboarding local businesses — free to start",
    headline: "Give your shop a home online.",
    subheadline:
      "Nashemann is the infrastructure behind independent stores — your own branded storefront, orders, and customers, live in days. You only pay when you sell.",
    primaryCta: "Apply for your store",
    secondaryCta: "See pricing",
    stats: [
      { label: "Vendors live", value: 5 },
      { label: "Orders processed", value: 1284 },
      { label: "Avg. setup time", value: 2, suffix: " days" },
    ],
  },
  how_it_works: [
    { title: "Apply in 3 minutes", description: "Tell us about your business — no paperwork, no upfront cost, decision within 24 hours.", icon: "FileEdit" },
    { title: "We build your store", description: "A branded storefront on your own subdomain, seeded and ready — you just add products.", icon: "Rocket" },
    { title: "Customers order", description: "Real checkout, real orders, delivered your way — you stay fully in control of fulfillment.", icon: "ShoppingBag" },
    { title: "You grow, we earn together", description: "Rs 15 per order, or a flat monthly plan once you outgrow it. Never a surprise bill.", icon: "TrendingUp" },
  ],
  features: [
    { title: "Your own branded storefront", description: "Custom colors, logo, and typeface — customers never know it runs on shared infrastructure.", icon: "Palette" },
    { title: "Real-time order management", description: "Every order lands in your own admin panel the moment it's placed. Nothing to refresh.", icon: "PackageCheck" },
    { title: "Built-in inventory tracking", description: "Stock levels update automatically — never oversell a product that's already gone.", icon: "Boxes" },
    { title: "Revenue you can actually see", description: "A live dashboard of every rupee — no waiting for a monthly statement.", icon: "LineChart" },
    { title: "WhatsApp & AI support", description: "Your customers get instant answers, day or night, escalated to a human when it matters.", icon: "MessageCircle" },
    { title: "Zero upfront cost", description: "Pay Rs 15 only when an order actually happens. No subscription required to start.", icon: "ShieldCheck" },
  ],
  testimonials: [
    {
      quote:
        "We were taking orders over WhatsApp DMs for two years. Nashemann gave us a real store in two days — customers trust us more now.",
      name: "Sana Tariq",
      business: "Bloom & Batter, Lahore",
      emoji: "🥐",
    },
    {
      quote: "The Rs 15/order model meant we could try it with zero risk. Three months later it's half our business.",
      name: "Fatima Noor",
      business: "Sabz Basket, Karachi",
      emoji: "🥬",
    },
    {
      quote: "Seeing revenue update live, instead of guessing at month-end, changed how we actually run the shop.",
      name: "Shahzaib Lal",
      business: "TheAamGhar, Multan",
      emoji: "🥭",
    },
  ],
  rewards: {
    headline: "Nashemann Rewards",
    subheadline: "Grow the platform, and we grow your store back.",
    tiers: [
      { name: "Seedling", ordersRequired: 0, perk: "Standard Rs 15/order rate", icon: "Sprout" },
      { name: "Rooted", ordersRequired: 200, perk: "2% off platform fees for a month", icon: "Trees" },
      { name: "Thriving", ordersRequired: 750, perk: "Free custom domain (worth Rs 4,600)", icon: "Flower2" },
      { name: "Flagship", ordersRequired: 2000, perk: "Featured on the Nashemann homepage", icon: "Star" },
    ],
    referral: {
      headline: "Refer a business, earn credit",
      description:
        "Every vendor gets a unique referral link. When a business you refer completes their first 50 orders, you both get Rs 2,000 in platform-fee credit.",
      yourCode: "SANA-BLOOM-2K26",
      reward: 2000,
    },
  },
  contact: {
    whatsappNumber: "923001234567",
    whatsappDisplay: "+92 300 1234567",
    supportEmail: "hello@nashemann.com",
    phoneDisplay: "+92 42 1234 5678",
    phoneHref: "tel:+924212345678",
    address: "Gulberg III, Lahore, Pakistan",
    hours: "Mon–Sat, 9am–8pm PKT",
  },
  social_links: {
    instagram: "https://instagram.com/nashemann",
    facebook: "https://facebook.com/nashemann",
    tiktok: "https://tiktok.com/@nashemann",
    linkedin: "https://linkedin.com/company/nashemann",
    youtube: "https://youtube.com/@nashemann",
  },
  promo_popup: {
    enabled: true,
    eyebrow: "Limited-time",
    headline: "First 10 vendors — Monthly plan free for 3 months",
    description: "Applying this week? Mention code EARLYBIRD and skip the Rs 7,000/mo fee for your first quarter.",
    cta: "Apply now",
    delayMs: 4000,
  },
  ai_support: {
    greeting: "Hi! I'm the Nashemann assistant. Ask me about pricing, applying, or anything else.",
    suggestedPrompts: ["How much does it cost to start?", "How long does approval take?", "Talk to a human"],
  },
};

let cached: Promise<SiteContent> | null = null;

async function fetchSiteContent(): Promise<SiteContent> {
  const supabase = createClient();
  const { data, error } = await supabase.from("site_content").select("key, value");
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
  };
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
    getSiteContent().then((content) => {
      if (active) setValue(content[key]);
    });
    return () => {
      active = false;
    };
  }, [key]);
  return value;
}
