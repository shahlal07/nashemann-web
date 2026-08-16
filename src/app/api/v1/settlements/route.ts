import { NextRequest, NextResponse } from "next/server";
import { createHash } from "crypto";
import { createClient as createSupabaseJsClient } from "@supabase/supabase-js";

export const dynamic = "force-dynamic";

/**
 * GET /api/v1/settlements
 *
 * Read-only, vendor-scoped API. Authenticate with:
 *   Authorization: Bearer <api key>
 * (or the `X-API-Key` header)
 *
 * The raw key never reaches the database — it's sha-256 hashed here and
 * matched against `api_keys.key_hash` via the `api_v1_settlements` RPC,
 * which is SECURITY DEFINER and resolves the key to its owning vendor.
 * See docs/API.md.
 */
export async function GET(req: NextRequest) {
  const authHeader = req.headers.get("authorization");
  const bearerKey = authHeader?.toLowerCase().startsWith("bearer ") ? authHeader.slice(7).trim() : null;
  const apiKey = bearerKey ?? req.headers.get("x-api-key");

  if (!apiKey) {
    return NextResponse.json(
      { error: "missing_api_key", message: "Provide your API key via 'Authorization: Bearer <key>' or 'X-API-Key'." },
      { status: 401 }
    );
  }

  const keyHash = createHash("sha256").update(apiKey.trim()).digest("hex");

  const supabase = createSupabaseJsClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );

  const { data, error } = await supabase.rpc("api_v1_settlements", { p_api_key_hash: keyHash });

  if (error) {
    if (error.code === "28000" || error.message?.includes("invalid_or_revoked_api_key")) {
      return NextResponse.json({ error: "invalid_or_revoked_api_key" }, { status: 401 });
    }
    return NextResponse.json({ error: "internal_error", message: error.message }, { status: 500 });
  }

  return NextResponse.json({
    data: (data ?? []).map((s: Record<string, unknown>) => ({
      id: s.id,
      month: s.month,
      orders_count: s.orders_count,
      gross_revenue: s.gross_revenue,
      platform_fee: s.platform_fee,
      status: s.status,
      amount_paid: s.amount_paid,
      due_date: s.due_date,
    })),
  });
}
