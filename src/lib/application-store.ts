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
  const { data, error } = await supabase
    .from("vendor_applications")
    .insert({
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
    })
    .select(APPLICATION_COLUMNS)
    .single();
  if (error || !data) throw error ?? new Error("Failed to submit application");
  return mapRow(data as ApplicationRow);
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

export function savePendingApplication(draft: PendingApplication) {
  if (typeof window !== "undefined") window.localStorage.setItem(PENDING_KEY, JSON.stringify(draft));
}

export function getPendingApplication(): PendingApplication | null {
  if (typeof window === "undefined") return null;
  const raw = window.localStorage.getItem(PENDING_KEY);
  if (!raw) return null;
  try {
    return JSON.parse(raw) as PendingApplication;
  } catch {
    return null;
  }
}

export function clearPendingApplication() {
  if (typeof window !== "undefined") window.localStorage.removeItem(PENDING_KEY);
}
