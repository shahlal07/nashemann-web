import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";

export const dynamic = "force-dynamic";

type PlatformRole = "vendor" | "influencer";

function rolesFromMetadata(metadata: Record<string, unknown>): PlatformRole[] {
  if (Array.isArray(metadata.platform_roles)) {
    return (metadata.platform_roles as unknown[]).filter((r): r is PlatformRole => r === "vendor" || r === "influencer");
  }
  if (metadata.platform_role === "vendor" || metadata.platform_role === "influencer") {
    return [metadata.platform_role];
  }
  return [];
}

export async function GET() {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return NextResponse.json({ roles: [], error: "Not signed in." }, { status: 401 });

    const admin = createAdminClient();
    const email = (user.email ?? "").toLowerCase();
    const metadata = (user.user_metadata ?? {}) as Record<string, unknown>;

    // A real storefront login (vendor_admins) is a separate account mechanism entirely and takes
    // precedence, same as before this route supported multiple platform_accounts-based roles.
    const { data: vendorAdmin } = await admin.from("vendor_admins").select("vendor_id,name,email,role").ilike("email", email).limit(1).maybeSingle();
    if (vendorAdmin) {
      const { data: vendor } = await admin.from("vendors").select("id,name,subdomain,status").eq("id", vendorAdmin.vendor_id).maybeSingle();
      return NextResponse.json({
        roles: ["storefront"],
        userId: user.id,
        vendorId: vendorAdmin.vendor_id,
        vendorName: vendor?.name ?? "Store",
        subdomain: vendor?.subdomain ?? null,
        vendorStatus: vendor?.status ?? null,
        adminName: vendorAdmin.name,
        adminRole: vendorAdmin.role,
      });
    }

    let roles = rolesFromMetadata(metadata);

    if (roles.length === 0) {
      const { data: platformAccount } = await admin.from("platform_accounts").select("id,name,email").eq("id", user.id).maybeSingle();
      if (platformAccount) return NextResponse.json({ roles: ["vendor"], userId: user.id, name: platformAccount.name });
      return NextResponse.json({ roles: [], error: "This account is not a Nashemann platform account." }, { status: 403 });
    }

    const result: Record<string, unknown> = { userId: user.id, name: metadata.name ?? user.email };

    if (roles.includes("influencer")) {
      const { data: influencer } = await admin.from("influencers").select("id,name,email,referral_code,status").eq("account_id", user.id).maybeSingle();
      if (influencer) {
        result.influencerId = influencer.id;
        result.influencerStatus = influencer.status;
        result.referralCode = influencer.referral_code;
      } else {
        // Metadata claims the influencer role but the profile row is missing -- don't advertise a role we can't actually serve.
        roles = roles.filter((r) => r !== "influencer");
      }
    }

    if (roles.length === 0) {
      return NextResponse.json({ roles: [], error: "This influencer account is not linked to an influencer profile." }, { status: 403 });
    }

    result.roles = roles;
    return NextResponse.json(result);
  } catch (error) {
    return NextResponse.json({ roles: [], error: error instanceof Error ? error.message : "Couldn't resolve account role." }, { status: 500 });
  }
}
