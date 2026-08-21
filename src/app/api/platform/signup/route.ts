import { NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";

export const dynamic = "force-dynamic";

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const PHONE_RE = /^03\d{9}$/;

type SignupRole = "vendor" | "influencer";

function normalizePhone(value: string) { return value.replace(/[\s-]/g, ""); }
function makeReferralCode(name: string) {
  const base = name.toUpperCase().replace(/[^A-Z0-9]+/g, "").slice(0, 8) || "INFLUENCER";
  return `${base}${crypto.randomUUID().replace(/-/g, "").slice(0, 6).toUpperCase()}`;
}

export async function POST(request: Request) {
  try {
    const body = await request.json().catch(() => ({}));
    const role = body.role as SignupRole;
    const name = String(body.name ?? "").trim();
    const email = String(body.email ?? "").trim().toLowerCase();
    const phone = normalizePhone(String(body.phone ?? "").trim());
    const password = String(body.password ?? "");

    if (role !== "vendor" && role !== "influencer") return NextResponse.json({ error: "Choose Vendor or Influencer." }, { status: 400 });
    if (!name || name.length < 2) return NextResponse.json({ error: "Enter your full name." }, { status: 400 });
    if (!EMAIL_RE.test(email)) return NextResponse.json({ error: "Enter a valid email address." }, { status: 400 });
    if (!PHONE_RE.test(phone)) return NextResponse.json({ error: "Enter a valid Pakistani mobile number." }, { status: 400 });
    if (password.length < 8) return NextResponse.json({ error: "Password must be at least 8 characters." }, { status: 400 });

    const admin = createAdminClient();
    const { data: existingUsers, error: usersError } = await admin.auth.admin.listUsers({ page: 1, perPage: 1000 });
    if (usersError) throw new Error(usersError.message);
    if (existingUsers.users.some((u) => u.email?.toLowerCase() === email)) return NextResponse.json({ error: "An account with this email already exists. Use the matching login role." }, { status: 409 });

    const { data: existingVendorAdmin } = await admin.from("vendor_admins").select("id").ilike("email", email).limit(1).maybeSingle();
    if (existingVendorAdmin) return NextResponse.json({ error: "This email is already a storefront vendor-admin account. Use Revenue View login." }, { status: 409 });

    const { data: created, error: createError } = await admin.auth.admin.createUser({ email, password, email_confirm: true, user_metadata: { name, phone, platform_role: role } });
    if (createError || !created.user) throw new Error(createError?.message ?? "Couldn't create the account.");

    const { error: accountError } = await admin.from("platform_accounts").upsert({ id: created.user.id, name, email, phone, provider: "email" });
    if (accountError) { await admin.auth.admin.deleteUser(created.user.id).catch(() => undefined); throw new Error(accountError.message); }

    if (role === "influencer") {
      const { error: influencerError } = await admin.from("influencers").insert({ account_id: created.user.id, name, email, social_handle: `@pending_${created.user.id.slice(0, 8)}`, platform: "Instagram", follower_count: 0, referral_code: makeReferralCode(name), cut_percent: 10, status: "pending" });
      if (influencerError) { await admin.from("platform_accounts").delete().eq("id", created.user.id); await admin.auth.admin.deleteUser(created.user.id).catch(() => undefined); throw new Error(influencerError.message); }
    }

    return NextResponse.json({ ok: true, role, email, name });
  } catch (error) {
    return NextResponse.json({ error: error instanceof Error ? error.message : "Couldn't create your account." }, { status: 500 });
  }
}
