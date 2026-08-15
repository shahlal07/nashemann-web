"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";

export type VendorRecord = {
  id: string;
  name: string;
  description: string;
  subdomain: string;
  custom_domain: string | null;
  category: string | null;
  city: string;
  status: "provisioning" | "active" | "suspended" | "failed";
  plan: "per_order" | "monthly";
  orders_last_30d: number;
  revenue_last_30d: number;
  joined_at: string;
  theme_accent_from: string;
  theme_accent_to: string;
  theme_logo_emoji: string;
  theme_logo_url: string | null;
  theme_font: string;
  contact_email: string | null;
  contact_phone: string | null;
};

export type VendorSessionState =
  | { status: "loading" }
  | { status: "no-access" }
  | { status: "ready"; vendor: VendorRecord };

const VENDOR_COLUMNS =
  "id, name, description, subdomain, custom_domain, category, city, status, plan, orders_last_30d, revenue_last_30d, joined_at, theme_accent_from, theme_accent_to, theme_logo_emoji, theme_logo_url, theme_font, contact_email, contact_phone";

/**
 * Resolves the signed-in vendor admin's own vendor row.
 * Mirrors the account -> vendor_admins -> vendors chain used across
 * /vendor/dashboard; centralised here so every self-service tab shares
 * one auth/ownership resolution path instead of re-implementing it.
 */
export function useVendorSession() {
  const [state, setState] = useState<VendorSessionState>({ status: "loading" });
  const [refreshKey, setRefreshKey] = useState(0);

  useEffect(() => {
    let active = true;
    (async () => {
      const supabase = createClient();
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) {
        if (active) setState({ status: "no-access" });
        return;
      }

      const { data: account } = await supabase.from("platform_accounts").select("email").eq("id", user.id).single();
      if (!account) {
        if (active) setState({ status: "no-access" });
        return;
      }

      const { data: admin } = await supabase
        .from("vendor_admins")
        .select("vendor_id")
        .eq("email", account.email)
        .limit(1)
        .maybeSingle();
      if (!admin) {
        if (active) setState({ status: "no-access" });
        return;
      }

      const { data: vendorRow } = await supabase.from("vendors").select(VENDOR_COLUMNS).eq("id", admin.vendor_id).single();
      if (!active) return;

      if (!vendorRow) {
        setState({ status: "no-access" });
        return;
      }

      setState({ status: "ready", vendor: vendorRow as VendorRecord });
    })();
    return () => {
      active = false;
    };
  }, [refreshKey]);

  return { state, refresh: () => setRefreshKey((k) => k + 1) };
}
