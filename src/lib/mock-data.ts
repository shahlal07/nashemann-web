import { createClient } from "@/lib/supabase/client";

/**
 * Placeholder data for the parts of nashemann-web that are still admin-side
 * demo views (not covered by this pass). The category schemas, influencer
 * program, and pricing sections below now read from Supabase instead --
 * see `getCategorySchemas`, `getInfluencerDashboard`, `getPlatformPricing`.
 */

export type VendorStatus = "provisioning" | "active" | "suspended" | "failed";
export type ApplicationStatus = "pending" | "approved" | "rejected";
export type SettlementStatus = "unsettled" | "settled";
export type PricingPlan = "per_order" | "monthly";
export type StaffRole = "super_admin" | "platform_staff";

// ── Category-aware product settings ─────────────────────────────────────────
// Mirrors theaamghar-admin's real product_type distinction: perishables
// (fruit/veg/dairy/meat/bakery) sell by weight/box-size and need
// origin/variety/shelf-life fields, while goods like clothing sell by
// fixed-attribute variants (size/color) instead. Choosing a category at
// signup determines which product form and variant structure that vendor's
// admin panel is seeded with. Backed by the `category_product_schemas`
// table (public read, staff write).

export type ProductModel = "weight_based" | "variant_based" | "simple";

export type CategoryProductSchema = {
  category: string;
  model: ProductModel;
  fields: string[];
  variantExample?: string;
  note: string;
};

type CategoryProductSchemaRow = {
  category: string;
  model: ProductModel;
  fields: string[];
  variant_example: string | null;
  note: string;
};

let cachedCategorySchemas: Promise<CategoryProductSchema[]> | null = null;

export function getCategorySchemas(): Promise<CategoryProductSchema[]> {
  if (!cachedCategorySchemas) {
    cachedCategorySchemas = (async () => {
      const supabase = createClient();
      const { data, error } = await supabase
        .from("category_product_schemas")
        .select("category, model, fields, variant_example, note")
        .order("display_order", { ascending: true });
      if (error || !data) return [];
      return (data as CategoryProductSchemaRow[]).map((row) => ({
        category: row.category,
        model: row.model,
        fields: row.fields,
        variantExample: row.variant_example ?? undefined,
        note: row.note,
      }));
    })();
  }
  return cachedCategorySchemas;
}

export type VendorTheme = {
  accentFrom: string;
  accentTo: string;
  logoEmoji: string;
  font: "Inter" | "Space Grotesk" | "Playfair Display" | "Poppins";
};

export type VendorAdmin = {
  id: string;
  name: string;
  email: string;
  role: "owner" | "staff";
  addedAt: string;
};

export type Vendor = {
  id: string;
  name: string;
  subdomain: string;
  customDomain: string | null;
  category: string;
  city: string;
  status: VendorStatus;
  plan: PricingPlan;
  ordersLast30d: number;
  revenueLast30d: number;
  joinedAt: string;
  theme: VendorTheme;
  admins: VendorAdmin[];
};

export type Application = {
  id: string;
  businessName: string;
  businessType: string;
  ownerName: string;
  ownerEmail: string;
  ownerPhone: string;
  city: string;
  subdomainPreference: string;
  requestedPlan: PricingPlan;
  status: ApplicationStatus;
  submittedAt: string;
  message: string;
};

export type Settlement = {
  vendorId: string;
  vendorName: string;
  month: string;
  ordersCount: number;
  grossRevenue: number;
  platformFee: number;
  status: SettlementStatus;
};

export type TenantHealthRow = {
  vendorId: string;
  vendorName: string;
  status: VendorStatus;
  totalOrders: number;
  failedOrders: number;
  failureRate: number;
  stockWarnings: number;
  authFailedAttempts: number;
  lastOrderAt: string | null;
};

export type PlatformStaffMember = {
  id: string;
  name: string;
  email: string;
  role: StaffRole;
  addedAt: string;
  lastActiveAt: string;
};

export type AuditLogEntry = {
  id: string;
  action: string;
  actor: string;
  entity: string;
  detail: string;
  at: string;
};

export const MOCK_VENDORS: Vendor[] = [
  {
    id: "v1",
    name: "TheAamGhar",
    subdomain: "theaamghar",
    customDomain: "theaamghar.pk",
    category: "Fruits",
    city: "Multan",
    status: "active",
    plan: "per_order",
    ordersLast30d: 21,
    revenueLast30d: 184500,
    joinedAt: "2026-06-02",
    theme: { accentFrom: "#f97316", accentTo: "#16a34a", logoEmoji: "🥭", font: "Inter" },
    admins: [
      { id: "u1", name: "Shahzaib Lal", email: "admin@theaamghar.pk", role: "owner", addedAt: "2026-06-02" },
    ],
  },
  {
    id: "v2",
    name: "Bloom & Batter",
    subdomain: "bloom-batter",
    customDomain: null,
    category: "Bakery",
    city: "Lahore",
    status: "active",
    plan: "monthly",
    ordersLast30d: 63,
    revenueLast30d: 297200,
    joinedAt: "2026-07-11",
    theme: { accentFrom: "#ec4899", accentTo: "#f59e0b", logoEmoji: "🥐", font: "Playfair Display" },
    admins: [
      { id: "u2", name: "Sana Tariq", email: "sana@bloombatter.pk", role: "owner", addedAt: "2026-07-11" },
      { id: "u3", name: "Usman Ali", email: "usman@bloombatter.pk", role: "staff", addedAt: "2026-07-20" },
    ],
  },
  {
    id: "v3",
    name: "Sabz Basket",
    subdomain: "sabz-basket",
    customDomain: null,
    category: "Vegetables",
    city: "Karachi",
    status: "active",
    plan: "per_order",
    ordersLast30d: 38,
    revenueLast30d: 112800,
    joinedAt: "2026-07-20",
    theme: { accentFrom: "#16a34a", accentTo: "#65a30d", logoEmoji: "🥬", font: "Poppins" },
    admins: [{ id: "u4", name: "Fatima Noor", email: "fatima@sabzbasket.pk", role: "owner", addedAt: "2026-07-20" }],
  },
  {
    id: "v4",
    name: "Desi Dairy Co.",
    subdomain: "desi-dairy",
    customDomain: null,
    category: "Dairy",
    city: "Faisalabad",
    status: "provisioning",
    plan: "per_order",
    ordersLast30d: 0,
    revenueLast30d: 0,
    joinedAt: "2026-08-14",
    theme: { accentFrom: "#60a5fa", accentTo: "#38bdf8", logoEmoji: "🥛", font: "Inter" },
    admins: [{ id: "u5", name: "Imran Khalid", email: "imran@desidairy.pk", role: "owner", addedAt: "2026-08-14" }],
  },
  {
    id: "v5",
    name: "Haveli Handicrafts",
    subdomain: "haveli-crafts",
    customDomain: null,
    category: "Artisan",
    city: "Multan",
    status: "suspended",
    plan: "monthly",
    ordersLast30d: 2,
    revenueLast30d: 4100,
    joinedAt: "2026-06-28",
    theme: { accentFrom: "#a855f7", accentTo: "#f59e0b", logoEmoji: "🏺", font: "Playfair Display" },
    admins: [{ id: "u6", name: "Rukhsana Bibi", email: "rukhsana@haveli.pk", role: "owner", addedAt: "2026-06-28" }],
  },
];

export const MOCK_APPLICATIONS: Application[] = [
  {
    id: "a1",
    businessName: "Kohsar Organics",
    businessType: "Organic / Natural",
    ownerName: "Ayesha Malik",
    ownerEmail: "ayesha@kohsarorganics.pk",
    ownerPhone: "0300-1234567",
    city: "Islamabad",
    subdomainPreference: "kohsar-organics",
    requestedPlan: "per_order",
    status: "pending",
    submittedAt: "2026-08-14T09:12:00Z",
    message: "We sell organic honey and dried fruits, currently only via Instagram DMs.",
  },
  {
    id: "a2",
    businessName: "Ravi Meats",
    businessType: "Meat / Poultry",
    ownerName: "Bilal Ahmed",
    ownerEmail: "bilal@ravimeats.pk",
    ownerPhone: "0301-2345678",
    city: "Lahore",
    subdomainPreference: "ravi-meats",
    requestedPlan: "monthly",
    status: "pending",
    submittedAt: "2026-08-13T16:40:00Z",
    message: "Halal-certified, same-day delivery within Lahore.",
  },
  {
    id: "a3",
    businessName: "Northern Nuts",
    businessType: "General Store",
    ownerName: "Zainab Raza",
    ownerEmail: "zainab@northernnuts.pk",
    ownerPhone: "0333-3456789",
    city: "Gilgit",
    subdomainPreference: "northern-nuts",
    requestedPlan: "per_order",
    status: "pending",
    submittedAt: "2026-08-12T11:05:00Z",
    message: "Dry fruits sourced directly from Hunza and Gilgit valley farmers.",
  },
  {
    id: "a4",
    businessName: "Karachi Kicks",
    businessType: "Other",
    ownerName: "Hamza Sheikh",
    ownerEmail: "hamza@karachikicks.pk",
    ownerPhone: "0321-4567890",
    city: "Karachi",
    subdomainPreference: "karachi-kicks",
    requestedPlan: "monthly",
    status: "approved",
    submittedAt: "2026-08-09T08:20:00Z",
    message: "Sneaker resale and customization studio.",
  },
];

export const MOCK_SETTLEMENTS: Settlement[] = [
  { vendorId: "v1", vendorName: "TheAamGhar", month: "2026-08-01", ordersCount: 21, grossRevenue: 184500, platformFee: 315, status: "unsettled" },
  { vendorId: "v3", vendorName: "Sabz Basket", month: "2026-08-01", ordersCount: 38, grossRevenue: 112800, platformFee: 570, status: "unsettled" },
  { vendorId: "v2", vendorName: "Bloom & Batter", month: "2026-08-01", ordersCount: 63, grossRevenue: 297200, platformFee: 7000, status: "unsettled" },
  { vendorId: "v1", vendorName: "TheAamGhar", month: "2026-07-01", ordersCount: 45, grossRevenue: 398000, platformFee: 675, status: "settled" },
  { vendorId: "v2", vendorName: "Bloom & Batter", month: "2026-07-01", ordersCount: 51, grossRevenue: 241500, platformFee: 7000, status: "settled" },
];

export const MOCK_TENANT_HEALTH: TenantHealthRow[] = [
  { vendorId: "v1", vendorName: "TheAamGhar", status: "active", totalOrders: 21, failedOrders: 21, failureRate: 100, stockWarnings: 0, authFailedAttempts: 0, lastOrderAt: "2026-08-11T21:53:00Z" },
  { vendorId: "v2", vendorName: "Bloom & Batter", status: "active", totalOrders: 63, failedOrders: 4, failureRate: 6.3, stockWarnings: 1, authFailedAttempts: 0, lastOrderAt: "2026-08-14T14:02:00Z" },
  { vendorId: "v3", vendorName: "Sabz Basket", status: "active", totalOrders: 38, failedOrders: 9, failureRate: 23.7, stockWarnings: 3, authFailedAttempts: 2, lastOrderAt: "2026-08-14T18:47:00Z" },
  { vendorId: "v4", vendorName: "Desi Dairy Co.", status: "provisioning", totalOrders: 0, failedOrders: 0, failureRate: 0, stockWarnings: 0, authFailedAttempts: 0, lastOrderAt: null },
  { vendorId: "v5", vendorName: "Haveli Handicrafts", status: "suspended", totalOrders: 2, failedOrders: 1, failureRate: 50, stockWarnings: 0, authFailedAttempts: 6, lastOrderAt: "2026-07-30T10:15:00Z" },
];

export const MOCK_STAFF: PlatformStaffMember[] = [
  { id: "s1", name: "Shahzaib Lal", email: "shahlalfinance@gmail.com", role: "super_admin", addedAt: "2026-06-01", lastActiveAt: "2026-08-14T22:10:00Z" },
  { id: "s2", name: "Amna Siddiqui", email: "amna@nashemann.com", role: "platform_staff", addedAt: "2026-07-15", lastActiveAt: "2026-08-14T17:30:00Z" },
];

export const MOCK_AUDIT_LOG: AuditLogEntry[] = [
  { id: "l1", action: "vendor_provisioned", actor: "Shahzaib Lal", entity: "Bloom & Batter", detail: "Created store on the Monthly plan", at: "2026-07-11T10:00:00Z" },
  { id: "l2", action: "application_approved", actor: "Shahzaib Lal", entity: "Karachi Kicks", detail: "Approved from applications queue", at: "2026-08-09T09:15:00Z" },
  { id: "l3", action: "vendor_suspended", actor: "Amna Siddiqui", entity: "Haveli Handicrafts", detail: "Suspended for repeated login failures", at: "2026-08-01T13:22:00Z" },
  { id: "l4", action: "settlement_marked_settled", actor: "Shahzaib Lal", entity: "TheAamGhar · Jul 2026", detail: "Rs 675 marked settled via bank transfer", at: "2026-08-03T11:40:00Z" },
  { id: "l5", action: "platform_fee_updated", actor: "Shahzaib Lal", entity: "Platform Settings", detail: "Per-order fee changed from Rs 12 to Rs 15", at: "2026-07-28T08:05:00Z" },
  { id: "l6", action: "theme_updated", actor: "Amna Siddiqui", entity: "Sabz Basket", detail: "Accent gradient updated to green/lime", at: "2026-07-25T15:12:00Z" },
];

export const REVENUE_TREND = [
  { month: "Mar", revenue: 210000, orders: 58 },
  { month: "Apr", revenue: 265000, orders: 71 },
  { month: "May", revenue: 298000, orders: 84 },
  { month: "Jun", revenue: 356000, orders: 97 },
  { month: "Jul", revenue: 639500, orders: 96 },
  { month: "Aug", revenue: 494500, orders: 122 },
];

export const PLAN_DISTRIBUTION = [
  { name: "Pay Per Order", value: MOCK_VENDORS.filter((v) => v.plan === "per_order").length },
  { name: "Monthly", value: MOCK_VENDORS.filter((v) => v.plan === "monthly").length },
];

export function getPlatformStats() {
  const activeVendors = MOCK_VENDORS.filter((v) => v.status === "active").length;
  const pendingApplications = MOCK_APPLICATIONS.filter((a) => a.status === "pending").length;
  const totalOrders30d = MOCK_VENDORS.reduce((sum, v) => sum + v.ordersLast30d, 0);
  const platformFeeThisMonth = MOCK_SETTLEMENTS.filter((s) => s.month === "2026-08-01").reduce(
    (sum, s) => sum + s.platformFee,
    0
  );
  return { activeVendors, pendingApplications, totalOrders30d, platformFeeThisMonth };
}

export function getVendorById(id: string) {
  return MOCK_VENDORS.find((v) => v.id === id) ?? null;
}

export type PlatformPricing = {
  perOrderFee: number;
  monthlyFee: number;
  monthlyBreakEvenOrders: number;
  customDomainFee: number;
};

const DEFAULT_PRICING: PlatformPricing = {
  perOrderFee: 15,
  monthlyFee: 7000,
  monthlyBreakEvenOrders: 467,
  customDomainFee: 4600,
};

// ── Real homepage proof points (vendors table + application counts) ────────
// Unlike the MOCK_* arrays above, these read the live `vendors` /
// `vendor_applications` tables so the homepage never shows fabricated scale.

export type ShowcaseVendor = {
  id: string;
  name: string;
  subdomain: string;
  customDomain: string | null;
  category: string | null;
  city: string;
  ordersLast30d: number;
  logoEmoji: string;
  logoUrl: string | null;
  accentFrom: string;
  accentTo: string;
  joinedAt: string;
  whiteLabelEnabled: boolean;
};

type VendorRow = {
  id: string;
  name: string;
  subdomain: string;
  custom_domain: string | null;
  category: string | null;
  city: string;
  orders_last_30d: number;
  theme_logo_emoji: string;
  theme_logo_url: string | null;
  theme_accent_from: string;
  theme_accent_to: string;
  joined_at: string;
  white_label_enabled: boolean;
};

/** Active vendor rows for the homepage showcase -- real rows only, no fallback to MOCK_VENDORS. */
export async function getShowcaseVendors(limit = 3): Promise<ShowcaseVendor[]> {
  const supabase = createClient();
  const { data, error } = await supabase
    .from("vendors")
    .select(
      "id, name, subdomain, custom_domain, category, city, orders_last_30d, theme_logo_emoji, theme_logo_url, theme_accent_from, theme_accent_to, joined_at, white_label_enabled"
    )
    .eq("status", "active")
    .order("joined_at", { ascending: false })
    .limit(limit);
  if (error || !data) return [];
  return (data as VendorRow[]).map((v) => ({
    id: v.id,
    name: v.name,
    subdomain: v.subdomain,
    customDomain: v.custom_domain,
    category: v.category,
    city: v.city,
    ordersLast30d: v.orders_last_30d,
    logoEmoji: v.theme_logo_emoji,
    logoUrl: v.theme_logo_url,
    accentFrom: v.theme_accent_from,
    accentTo: v.theme_accent_to,
    joinedAt: v.joined_at,
    whiteLabelEnabled: v.white_label_enabled,
  }));
}

export type PlatformLiveStats = {
  activeVendors: number;
  ordersLast30d: number;
  pendingApplications: number;
};

/** Live counts for the hero stat row -- replaces the seeded `site_content.hero.stats` numbers so the homepage never overstates real scale. */
export async function getPlatformLiveStats(): Promise<PlatformLiveStats | null> {
  const supabase = createClient();
  const [vendorsRes, applicationsRes] = await Promise.all([
    supabase.from("vendors").select("orders_last_30d").eq("status", "active"),
    supabase.from("vendor_applications").select("id", { count: "exact", head: true }).eq("status", "pending"),
  ]);
  if (vendorsRes.error) return null;
  const rows = (vendorsRes.data ?? []) as { orders_last_30d: number }[];
  return {
    activeVendors: rows.length,
    ordersLast30d: rows.reduce((sum, r) => sum + (r.orders_last_30d ?? 0), 0),
    pendingApplications: applicationsRes.count ?? 0,
  };
}

let cachedPricing: Promise<PlatformPricing> | null = null;

/** Reads the single `platform_pricing` row (public read policy), falling back to the seeded defaults if the fetch fails. */
export function getPlatformPricing(): Promise<PlatformPricing> {
  if (!cachedPricing) {
    cachedPricing = (async () => {
      const supabase = createClient();
      const { data, error } = await supabase
        .from("platform_pricing")
        .select("per_order_fee, monthly_fee, monthly_break_even_orders, custom_domain_fee")
        .single();
      if (error || !data) return DEFAULT_PRICING;
      return {
        perOrderFee: Number(data.per_order_fee),
        monthlyFee: Number(data.monthly_fee),
        monthlyBreakEvenOrders: data.monthly_break_even_orders,
        customDomainFee: Number(data.custom_domain_fee),
      };
    })();
  }
  return cachedPricing;
}

// ── Influencer referral program ─────────────────────────────────────────────
// An influencer who brings in a business earns a cut of the *platform's own*
// revenue from that business's orders (not the vendor's revenue) -- i.e. a
// share of the Rs 15/order or Rs 7,000/month platform fee, for as long as the
// referred business stays active. cutPercent is per-influencer so a super
// admin can negotiate different deals; programDefaultCutPercent is what new
// approvals start at.

export type InfluencerStatus = "pending" | "active" | "suspended";
export type InfluencerPlatform = "Instagram" | "TikTok" | "YouTube" | "Facebook" | "Other";

export type Influencer = {
  id: string;
  name: string;
  email: string;
  socialHandle: string;
  platform: InfluencerPlatform;
  followerCount: number;
  referralCode: string;
  cutPercent: number;
  status: InfluencerStatus;
  joinedAt: string;
};

export type InfluencerReferredVendor = {
  id: string;
  name: string;
  status: VendorStatus;
  joinedAt: string;
  logoEmoji: string;
};

export type InfluencerDashboard = {
  influencer: Influencer;
  referredVendors: InfluencerReferredVendor[];
  platformRevenueGenerated: number;
  influencerEarnings: number;
};

type InfluencerDashboardRow = {
  influencer_id: string;
  name: string;
  email: string;
  social_handle: string;
  platform: InfluencerPlatform;
  follower_count: number;
  referral_code: string;
  cut_percent: string | number;
  status: InfluencerStatus;
  joined_at: string;
  referred_vendor_id: string | null;
  referred_vendor_name: string | null;
  referred_vendor_status: VendorStatus | null;
  referred_vendor_joined_at: string | null;
  referred_vendor_logo_emoji: string | null;
  referred_vendor_orders_last_30d: number | null;
  referred_vendor_revenue_last_30d: string | number | null;
  referred_vendor_plan: PricingPlan | null;
};

/** Looks up an influencer (and their referred vendors) by referral code via a security-definer RPC -- the dashboard is reached by code, not by a real influencer login yet. */
export async function getInfluencerDashboard(referralCode: string): Promise<InfluencerDashboard | null> {
  const supabase = createClient();
  const { data, error } = await supabase.rpc("get_influencer_dashboard", { p_referral_code: referralCode });
  if (error || !data || data.length === 0) return null;

  const rows = data as InfluencerDashboardRow[];
  const first = rows[0];
  const pricing = await getPlatformPricing();

  const referredVendors: InfluencerReferredVendor[] = rows
    .filter((r) => r.referred_vendor_id)
    .map((r) => ({
      id: r.referred_vendor_id as string,
      name: r.referred_vendor_name as string,
      status: r.referred_vendor_status as VendorStatus,
      joinedAt: r.referred_vendor_joined_at as string,
      logoEmoji: r.referred_vendor_logo_emoji ?? "🛍️",
    }));

  const platformRevenueGenerated = rows
    .filter((r) => r.referred_vendor_id)
    .reduce((sum, r) => {
      if (r.referred_vendor_plan === "monthly") return sum + pricing.monthlyFee;
      return sum + (r.referred_vendor_orders_last_30d ?? 0) * pricing.perOrderFee;
    }, 0);

  const cutPercent = Number(first.cut_percent);
  const influencerEarnings = Math.round(platformRevenueGenerated * (cutPercent / 100));

  return {
    influencer: {
      id: first.influencer_id,
      name: first.name,
      email: first.email,
      socialHandle: first.social_handle,
      platform: first.platform,
      followerCount: first.follower_count,
      referralCode: first.referral_code,
      cutPercent,
      status: first.status,
      joinedAt: first.joined_at,
    },
    referredVendors,
    platformRevenueGenerated,
    influencerEarnings,
  };
}

export type InfluencerProgramSettings = {
  enabled: boolean;
  defaultCutPercent: number;
  minFollowerCount: number;
  cutDurationMonths: number;
};

const DEFAULT_INFLUENCER_PROGRAM_SETTINGS: InfluencerProgramSettings = {
  enabled: true,
  defaultCutPercent: 30,
  minFollowerCount: 5000,
  cutDurationMonths: 12,
};

let cachedInfluencerSettings: Promise<InfluencerProgramSettings> | null = null;

export function getInfluencerProgramSettings(): Promise<InfluencerProgramSettings> {
  if (!cachedInfluencerSettings) {
    cachedInfluencerSettings = (async () => {
      const supabase = createClient();
      const { data, error } = await supabase
        .from("influencer_program_settings")
        .select("enabled, default_cut_percent, min_follower_count, cut_duration_months")
        .single();
      if (error || !data) return DEFAULT_INFLUENCER_PROGRAM_SETTINGS;
      return {
        enabled: data.enabled,
        defaultCutPercent: Number(data.default_cut_percent),
        minFollowerCount: data.min_follower_count,
        cutDurationMonths: data.cut_duration_months,
      };
    })();
  }
  return cachedInfluencerSettings;
}

export type InfluencerApplication = {
  id: string;
  name: string;
  email: string;
  socialHandle: string;
  platform: InfluencerPlatform;
  followerCount: number;
  pitch: string;
  status: ApplicationStatus;
  submittedAt: string;
};

export const MOCK_INFLUENCER_APPLICATIONS: InfluencerApplication[] = [
  {
    id: "ia1",
    name: "Desi Deals Daily",
    email: "hello@desideals.pk",
    socialHandle: "@desidealsdaily",
    platform: "YouTube",
    followerCount: 41000,
    pitch: "I review local food/grocery businesses weekly to a Lahore-focused audience.",
    status: "pending",
    submittedAt: "2026-08-13T12:00:00Z",
  },
  {
    id: "ia2",
    name: "Karachi Eats Guide",
    email: "team@karachieats.pk",
    socialHandle: "@karachieatsguide",
    platform: "Instagram",
    followerCount: 23000,
    pitch: "Daily stories featuring small Karachi businesses, high local engagement.",
    status: "pending",
    submittedAt: "2026-08-14T08:30:00Z",
  },
];

// ── Coupons ──────────────────────────────────────────────────────────────────
// theaamghar-admin's real coupons are always vendor_id-scoped. Nashemann adds
// one genuinely new capability on top: a super admin can create a coupon with
// vendorId = null, meaning "universal" -- valid at checkout on every vendor
// storefront, not just one. Vendor-scoped coupons still exist for parity
// (shown read-only here, since editing a specific vendor's own coupon belongs
// in that vendor's own admin panel, not the platform console).

export type DiscountType = "percent" | "fixed" | "free_shipping";
export type CouponScope = "universal" | "vendor";

export type Coupon = {
  id: string;
  code: string;
  scope: CouponScope;
  vendorId: string | null; // null when scope === "universal"
  discountType: DiscountType;
  discountValue: number;
  minOrderAmount: number;
  maxUses: number | null;
  usedCount: number;
  active: boolean;
  startsAt: string | null;
  expiresAt: string | null;
  createdAt: string;
};

export const MOCK_COUPONS: Coupon[] = [
  {
    id: "c1",
    code: "NASHEMANN10",
    scope: "universal",
    vendorId: null,
    discountType: "percent",
    discountValue: 10,
    minOrderAmount: 1000,
    maxUses: 500,
    usedCount: 128,
    active: true,
    startsAt: "2026-08-01",
    expiresAt: "2026-09-30",
    createdAt: "2026-07-28",
  },
  {
    id: "c2",
    code: "WELCOME2026",
    scope: "universal",
    vendorId: null,
    discountType: "fixed",
    discountValue: 200,
    minOrderAmount: 500,
    maxUses: null,
    usedCount: 341,
    active: true,
    startsAt: null,
    expiresAt: null,
    createdAt: "2026-06-15",
  },
  {
    id: "c3",
    code: "FREESHIP",
    scope: "universal",
    vendorId: null,
    discountType: "free_shipping",
    discountValue: 0,
    minOrderAmount: 2000,
    maxUses: 200,
    usedCount: 47,
    active: false,
    startsAt: null,
    expiresAt: "2026-07-31",
    createdAt: "2026-06-01",
  },
  {
    id: "c4",
    code: "MANGO15",
    scope: "vendor",
    vendorId: "v1",
    discountType: "percent",
    discountValue: 15,
    minOrderAmount: 1500,
    maxUses: 100,
    usedCount: 21,
    active: true,
    startsAt: null,
    expiresAt: null,
    createdAt: "2026-07-10",
  },
];

// ── Reviews (platform-wide moderation view, across every vendor) ────────────

export type Review = {
  id: string;
  vendorId: string;
  vendorName: string;
  productName: string;
  rating: number;
  title: string | null;
  body: string;
  verifiedPurchase: boolean;
  customerName: string;
  createdAt: string;
  adminReplyBody: string | null;
  adminReplyAt: string | null;
};

export const MOCK_REVIEWS: Review[] = [
  {
    id: "r1",
    vendorId: "v1",
    vendorName: "TheAamGhar",
    productName: "Sindhri Mango — 5kg box",
    rating: 5,
    title: "Best mangoes I've had",
    body: "Ordered twice already, consistently sweet and ripe on arrival. Delivery was fast too.",
    verifiedPurchase: true,
    customerName: "Ahmed Raza",
    createdAt: "2026-08-10T14:20:00Z",
    adminReplyBody: null,
    adminReplyAt: null,
  },
  {
    id: "r2",
    vendorId: "v2",
    vendorName: "Bloom & Batter",
    productName: "Custom Birthday Cake",
    rating: 4,
    title: null,
    body: "Cake was delicious but arrived a bit later than the promised slot.",
    verifiedPurchase: true,
    customerName: "Mehak Iqbal",
    createdAt: "2026-08-12T09:05:00Z",
    adminReplyBody: "Thanks for the honest feedback, Mehak! We've flagged the delivery timing with our rider team.",
    adminReplyAt: "2026-08-12T15:40:00Z",
  },
  {
    id: "r3",
    vendorId: "v3",
    vendorName: "Sabz Basket",
    productName: "Mixed Vegetable Bundle",
    rating: 2,
    title: "Some items were wilted",
    body: "Half the spinach was already going bad by the time it arrived.",
    verifiedPurchase: true,
    customerName: "Bilal Sheikh",
    createdAt: "2026-08-14T11:15:00Z",
    adminReplyBody: null,
    adminReplyAt: null,
  },
];

// ── Bug reports (platform-level, about Nashemann itself) ────────────────────

export type BugReportStatus = "pending" | "confirmed" | "rejected";

export type BugReport = {
  id: string;
  title: string;
  description: string;
  status: BugReportStatus;
  adminNote: string | null;
  rewardGranted: boolean;
  reporterName: string;
  reporterEmail: string;
  createdAt: string;
  reviewedAt: string | null;
  screenshotUrl?: string | null;
};

export const MOCK_BUG_REPORTS: BugReport[] = [
  {
    id: "b1",
    title: "Apply form loses my input on validation error",
    description: "If I miss a required field, everything I'd already typed gets cleared instead of just highlighting the missing one.",
    status: "pending",
    adminNote: null,
    rewardGranted: false,
    reporterName: "Zainab Raza",
    reporterEmail: "zainab@northernnuts.pk",
    createdAt: "2026-08-13T10:00:00Z",
    reviewedAt: null,
  },
  {
    id: "b2",
    title: "Referral code doesn't copy on Safari",
    description: "The copy button on the rewards page silently does nothing in Safari on iPhone.",
    status: "confirmed",
    adminNote: "Confirmed — Safari's clipboard permissions need a user gesture we weren't providing correctly. Rs 500 credit applied.",
    rewardGranted: true,
    reporterName: "Hania Aamir Malik",
    reporterEmail: "hania@creatorhub.pk",
    createdAt: "2026-08-08T16:30:00Z",
    reviewedAt: "2026-08-09T09:12:00Z",
  },
  {
    id: "b3",
    title: "Pricing page shows wrong currency symbol",
    description: "Saw a $ instead of Rs for a second before the page finished loading.",
    status: "rejected",
    adminNote: "Couldn't reproduce this after multiple attempts across browsers — likely a transient rendering glitch, not a real bug in the code.",
    rewardGranted: false,
    reporterName: "Owais Foodie Reviews",
    reporterEmail: "owais@foodiereviews.pk",
    createdAt: "2026-08-05T12:00:00Z",
    reviewedAt: "2026-08-06T08:45:00Z",
  },
];

// ── Announcements (platform → vendors, not platform → end customers) ────────

export type AnnouncementCategory = "product_update" | "policy_change" | "promotion";

export type SentAnnouncement = {
  id: string;
  category: AnnouncementCategory;
  title: string;
  message: string;
  recipientCount: number;
  sentAt: string;
};

export const ANNOUNCEMENT_CATEGORY_LABEL: Record<AnnouncementCategory, string> = {
  product_update: "Product Update",
  policy_change: "Policy Change",
  promotion: "Offer / Promotion",
};

export const MOCK_SENT_ANNOUNCEMENTS: SentAnnouncement[] = [
  {
    id: "an1",
    category: "product_update",
    title: "Tenant Health dashboard is live",
    message: "You can now see your order failure rate and stock warnings right from your admin panel.",
    recipientCount: 5,
    sentAt: "2026-08-10T09:00:00Z",
  },
  {
    id: "an2",
    category: "promotion",
    title: "Refer a business, earn Rs 2,000",
    message: "The influencer and vendor referral program is now open platform-wide.",
    recipientCount: 5,
    sentAt: "2026-08-05T09:00:00Z",
  },
];

// ── AI Assistant (super-admin queries platform-wide data) ────────────────────

export const AI_ASSISTANT_SUGGESTIONS = [
  "Which vendors need attention today?",
  "Summarize platform revenue this month",
  "Which vendors are close to their break-even order volume?",
  "How many applications are pending review?",
];

export function mockAssistantReply(question: string): string {
  const q = question.toLowerCase();
  const stats = getPlatformStats();
  if (/revenue|earn|fee/.test(q)) {
    return `Platform fees collected this month: ${formatPKRLike(stats.platformFeeThisMonth)}. TheAamGhar and Bloom & Batter are your top two contributors.`;
  }
  if (/attention|health|fail/.test(q)) {
    const worst = MOCK_TENANT_HEALTH.filter((h) => h.status === "active").sort((a, b) => b.failureRate - a.failureRate)[0];
    return worst
      ? `${worst.vendorName} has the highest order failure rate right now at ${worst.failureRate}% — worth checking in on.`
      : "All active vendors look healthy right now.";
  }
  if (/break-even|break even|monthly plan/.test(q)) {
    const close = MOCK_VENDORS.filter((v) => v.plan === "per_order" && v.ordersLast30d > 300);
    return close.length > 0
      ? `${close.map((v) => v.name).join(", ")} ${close.length === 1 ? "is" : "are"} getting close to where the Monthly plan would cost less than Pay Per Order.`
      : "No vendor is close to the Monthly break-even point yet.";
  }
  if (/pending|application/.test(q)) {
    return `${stats.pendingApplications} vendor application(s) are waiting for review right now.`;
  }
  return "I can only answer questions here, not change anything — try asking about revenue, vendor health, or pending applications.";
}

function formatPKRLike(n: number) {
  return "Rs " + Math.round(n).toLocaleString("en-PK");
}

// ── Rewards & Referrals admin dashboard (vendor-side program, platform view) ─

export type LeaderboardEntry = {
  id: string;
  name: string;
  email: string;
  lifetimePoints: number;
  credits: number;
};

export const MOCK_VENDOR_LEADERBOARD: LeaderboardEntry[] = [
  { id: "v2", name: "Bloom & Batter", email: "sana@bloombatter.pk", lifetimePoints: 890, credits: 2000 },
  { id: "v3", name: "Sabz Basket", email: "fatima@sabzbasket.pk", lifetimePoints: 540, credits: 0 },
  { id: "v1", name: "TheAamGhar", email: "admin@theaamghar.pk", lifetimePoints: 310, credits: 0 },
];

export type TopReferrer = { name: string; conversions: number };
export const MOCK_TOP_REFERRERS: TopReferrer[] = [
  { name: "Hania Aamir Malik", conversions: 2 },
  { name: "Owais Foodie Reviews", conversions: 1 },
];

export type RewardRedemption = { name: string; tier: string; couponCode: string; credits: number };
export const MOCK_REDEMPTIONS: RewardRedemption[] = [
  { name: "Bloom & Batter", tier: "Thriving", couponCode: "THRIVE-BB26", credits: 2000 },
];
