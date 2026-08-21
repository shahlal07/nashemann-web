import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";

export const dynamic = "force-dynamic";

type ActualRole = "vendor" | "influencer" | "storefront" | "unknown";

export async function GET() {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return NextResponse.json({ role: "unknown" as ActualRole, error: "Not signed in." }, { status: 401 });

    const admin = createAdminClient();
    const email = (user.email ?? "").toLowerCase();
    const metadata = (user.user_metadata ?? {}) as Record<string, unknown>;
    const platformRole = typeof metadata.platform_role === "string" ? metadata.platform_role : null;

    if (platformRole === "vendor") return NextResponse.json({ role: "vendor", userId: user.id, name: metadata.name ?? user.email });

    if (platformRole === "influencer") {
      const { data: influencer } = await admin.from("influencers").select("id,name,email,referral_code,status").eq("account_id", user.id).maybeSingle();
      if (influencer) return NextResponse.json({ role: "influencer", userId: user.id, influencerId: influencer.id, name: influencer.name, status: influencer.status });
      return NextResponse.json({ role: "unknown", error: "This influencer account is not linked to an influencer profile." }, { status: 403 });
    }

    const { data: vendorAdmin } = await admin.from("vendor_admins").select("vendor_id,name,email,role").ilike("email", email).limit(1).maybeSingle();
    if (vendorAdmin) {
      const { data: vendor } = await admin.from("vendors").select("id,name,subdomain,status").eq("id", vendorAdmin.vendor_id).maybeSingle();
      return NextResponse.json({ role: "storefront", userId: user.id, vendorId: vendorAdmin.vendor_id, vendorName: vendor?.name ?? "Store", subdomain: vendor?.subdomain ?? null, vendorStatus: vendor?.status ?? null, adminName: vendorAdmin.name, adminRole: vendorAdmin.role });
    }

    const { data: platformAccount } = await admin.from("platform_accounts").select("id,name,email").eq("id", user.id).maybeSingle();
    if (platformAccount) return NextResponse.json({ role: "vendor", userId: user.id, name: platformAccount.name });

    return NextResponse.json({ role: "unknown", error: "This account is not a Nashemann platform account." }, { status: 403 });
  } catch (error) {
    return NextResponse.json({ role: "unknown" as ActualRole, error: error instanceof Error ? error.message : "Couldn't resolve account role." }, { status: 500 });
  }
}
