import "server-only";
import { createClient as createSupabaseClient } from "@supabase/supabase-js";

const CANONICAL_SUPABASE_URL = "https://eznxsosvsgkhexbjoolh.supabase.co";

export function createAdminClient() {
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY ?? process.env.SUPABASE_SECRET_KEY;
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL ?? CANONICAL_SUPABASE_URL;
  if (!serviceRoleKey) throw new Error("Canonical Supabase service-role credentials are not configured on this deployment.");

  return createSupabaseClient(url, serviceRoleKey, {
    auth: { autoRefreshToken: false, persistSession: false, detectSessionInUrl: false },
  });
}
