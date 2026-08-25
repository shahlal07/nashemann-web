"use client";

import { createClient } from "@/lib/supabase/client";

export type ApplicationStatus = "pending" | "approved" | "rejected";
export type PricingPlan = "per_order" | "monthly";

export type StoredApplication = {
  referenceId: string;
  businessName: string;
  ownerEmail: string;
  city: string;
  plan: PricingPlan;
  status: ApplicationStatus;
  submittedAt: string;
  referralCode?: string;
};

type ApplicationRow = {
  reference_id: string;
  business_name: string;
  owner_email: string;
  city: string;
  requested_plan: PricingPlan;
  status: ApplicationStatus;
  submitted_at: string;
  referral_code: string | null;
};

const APPLICATION_COLUMNS = "reference_id, business_name, owner_email, city, requested_plan, status, submitted_at, referral_code";

function mapRow(row: ApplicationRow): StoredApplication {
  return {
    referenceId: row.reference_id,
    businessName: row.business_name,
    ownerEmail: row.owner_email,
    city: row.city,
    plan: row.requested_plan,
    status: row.status,
    submittedAt: row.submitted_at,
    referralCode: row.referral_code ?? undefined,
  };
}

/** Every application belonging to the signed-in account, for /account. */
export async function getApplications(): Promise<StoredApplication[]> {
  const supabase = createClient();
  const { data, error } = await supabase
    .from("vendor_applications")
    .select(APPLICATION_COLUMNS)
    .order("submitted_at", { ascending: false });
  if (error || !data) return [];
  return (data as ApplicationRow[]).map(mapRow);
}

export async function saveApplication(app: {
  businessName: string;
  category: string;
  city: string;
  ownerName: string;
  ownerEmail: string;
  ownerPhone: string;
  subdomain: string;
  plan: PricingPlan;
  message: string;
  referralCode?: string;
}): Promise<StoredApplication> {
  const supabase = createClient();
  const userId = await supabase.auth
    .getUser()
    .then(({ data }) => data.user?.id ?? null)
    .catch(() => null);

  const referenceId = "NSH-" + Math.random().toString(36).slice(2, 8).toUpperCase();
  const submittedAt = new Date().toISOString();
  // No `.select()` here: guests (no session) can't satisfy applications_select_own,
  // so a `Prefer: return=representation` round-trip SELECT after the insert gets
  // RLS-blocked even though the insert itself succeeds. Build the return value from
  // what we already know instead of reading the row back.
  const { error } = await supabase.from("vendor_applications").insert({
    reference_id: referenceId,
    applicant_account_id: userId,
    business_name: app.businessName,
    business_type: app.category,
    owner_name: app.ownerName,
    owner_email: app.ownerEmail,
    owner_phone: app.ownerPhone,
    city: app.city,
    subdomain_preference: app.subdomain,
    requested_plan: app.plan,
    message: app.message,
    referral_code: app.referralCode ?? null,
  });
  if (error) {
    console.error("[saveApplication] insert failed:", error.message);
    // P0001 is our own raised exception (e.g. the rate-limit trigger) --
    // that message is intentionally user-facing. Anything else is a raw
    // Postgres/PostgREST error, which stays server-log-only.
    throw new Error(error.code === "P0001" ? error.message : "Failed to submit application");
  }
  return {
    referenceId,
    businessName: app.businessName,
    ownerEmail: app.ownerEmail,
    city: app.city,
    plan: app.plan,
    status: "pending",
    submittedAt,
    referralCode: app.referralCode ?? undefined,
  };
}

/** Public tracking by reference ID or owner email, via a security-definer RPC (RLS otherwise scopes reads to the owner). */
export async function findApplication(query: string): Promise<StoredApplication | null> {
  const supabase = createClient();
  const { data, error } = await supabase.rpc("find_application_by_reference", { p_query: query.trim() });
  if (error || !data || data.length === 0) return null;
  return mapRow(data[0] as ApplicationRow);
}

/** Applications submitted with `?ref=<code>` on /apply, for an influencer's "who joined via my link" view. */
export async function getApplicationsByReferralCode(code: string): Promise<StoredApplication[]> {
  const supabase = createClient();
  const { data, error } = await supabase.rpc("applications_by_referral_code", { p_code: code });
  if (error || !data) return [];
  return (data as ApplicationRow[]).map(mapRow);
}

/**
 * A vendor filling out /apply without a Nashemann platform account gets sent
 * to sign up first -- their in-progress form is stashed here (client-side
 * only, this is ephemeral unsaved form state, not a submitted application)
 * so /apply can restore it and let them finish with a single click once
 * they're signed in.
 */
export type PendingApplication = {
  businessName: string;
  category: string;
  city: string;
  ownerName: string;
  ownerEmail: string;
  ownerPhone: string;
  subdomain: string;
  plan: PricingPlan;
  message: string;
  referralCode?: string;
};

const PENDING_KEY = "nashemann_pending_application";

// localStorage can throw (not just return null) in restricted contexts --
// in-app browsers (WhatsApp/Instagram/Facebook) most commonly, which are a
// major share of mobile entry points here. An uncaught throw crashes the
// whole /apply flow; these guards degrade to "draft doesn't persist" instead.
export function savePendingApplication(draft: PendingApplication) {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(PENDING_KEY, JSON.stringify(draft));
  } catch {
    // Draft just won't survive a reload; the rest of the flow still works.
  }
}

export function getPendingApplication(): PendingApplication | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = window.localStorage.getItem(PENDING_KEY);
    if (!raw) return null;
    return JSON.parse(raw) as PendingApplication;
  } catch {
    return null;
  }
}

export function clearPendingApplication() {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.removeItem(PENDING_KEY);
  } catch {
    // Nothing to clean up if storage isn't usable anyway.
  }
}

const SUBDOMAIN_PATTERN = /^[a-z0-9]+(-[a-z0-9]+)*$/;
const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const PK_PHONE_PATTERN = /^03\d{9}$/;

// Kept in sync with nashemann-admin's vendor-provisioning.ts -- checking
// format alone let an applicant pass this page's validation with a
// subdomain that provisioning would reject outright on approval.
export const RESERVED_SUBDOMAINS = ["www", "admin", "api", "app", "mail", "support", "status", "superadmin"];

export function isValidSubdomainFormat(value: string): boolean {
  return value.length >= 3 && value.length <= 40 && SUBDOMAIN_PATTERN.test(value) && !RESERVED_SUBDOMAINS.includes(value);
}

export function isValidEmailFormat(value: string): boolean {
  return EMAIL_PATTERN.test(value.trim());
}

/** Accepts 03XX-XXXXXXX or 03XXXXXXXXX -- Pakistani mobile format used throughout the rest of the app. */
export function isValidPakPhoneFormat(value: string): boolean {
  return PK_PHONE_PATTERN.test(value.replace(/[\s-]/g, ""));
}

/**
 * Checks the `subdomain` a vendor picked on /apply against live rows in
 * `vendors` (the real table a subdomain would collide with once
 * provisioned), via a security-definer RPC -- vendors_public_read's RLS
 * only exposes status='active' rows to anon, so a direct `.from("vendors")`
 * select here would silently miss a suspended/pending vendor's subdomain
 * and report it as available.
 */
export async function isSubdomainTaken(subdomain: string): Promise<boolean> {
  if (!isValidSubdomainFormat(subdomain)) return false;
  const supabase = createClient();
  const { data, error } = await supabase.rpc("is_subdomain_taken", { p_subdomain: subdomain });
  if (error) return false;
  return Boolean(data);
}
