import { NextResponse } from "next/server";
import { createClient as createSupabaseClient, type User } from "@supabase/supabase-js";
import { createAdminClient } from "@/lib/supabase/admin";

export const dynamic = "force-dynamic";

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const PHONE_RE = /^03\d{9}$/;

type SignupRole = "vendor" | "influencer";
const VALID_ROLES: SignupRole[] = ["vendor", "influencer"];

function normalizePhone(value: string) {
  return value.replace(/[\s-]/g, "");
}

function makeReferralCode(name: string) {
  const base = name.toUpperCase().replace(/[^A-Z0-9]+/g, "").slice(0, 8) || "INFLUENCER";
  return `${base}${crypto.randomUUID().replace(/-/g, "").slice(0, 6).toUpperCase()}`;
}

/** Roles already attached to an account, reading either the current array field or the legacy single-role field. */
function rolesFromMetadata(metadata: Record<string, unknown>): SignupRole[] {
  if (Array.isArray(metadata.platform_roles)) {
    return (metadata.platform_roles as unknown[]).filter((r): r is SignupRole => r === "vendor" || r === "influencer");
  }
  if (metadata.platform_role === "vendor" || metadata.platform_role === "influencer") {
    return [metadata.platform_role];
  }
  return [];
}

/** Anonymous, non-persisting client used purely to verify a password against an existing account before granting it an additional role. */
function createVerificationClient() {
  return createSupabaseClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!, {
    auth: { autoRefreshToken: false, persistSession: false, detectSessionInUrl: false },
  });
}

async function ensureInfluencerProfile(
  admin: ReturnType<typeof createAdminClient>,
  accountId: string,
  name: string,
  email: string,
) {
  const { data: existing } = await admin.from("influencers").select("id").eq("account_id", accountId).maybeSingle();
  if (existing) return;
  const { error } = await admin.from("influencers").insert({
    account_id: accountId,
    name,
    email,
    social_handle: `@pending_${accountId.slice(0, 8)}`,
    platform: "Instagram",
    follower_count: 0,
    referral_code: makeReferralCode(name),
    cut_percent: 10,
    status: "pending",
  });
  if (error) {
    console.error("[platform/signup] influencer profile insert failed:", error.message);
    throw new Error("Couldn't set up your influencer profile right now. Please try again.");
  }
}

export async function POST(request: Request) {
  let createdUserId: string | null = null;
  try {
    const body = await request.json().catch(() => ({}));
    const requestedRoles = Array.isArray(body.roles)
      ? (body.roles as unknown[]).filter((r): r is SignupRole => VALID_ROLES.includes(r as SignupRole))
      : typeof body.role === "string" && VALID_ROLES.includes(body.role as SignupRole)
        ? [body.role as SignupRole]
        : [];
    const roles = Array.from(new Set(requestedRoles));
    const name = String(body.name ?? "").trim();
    const email = String(body.email ?? "").trim().toLowerCase();
    const phone = normalizePhone(String(body.phone ?? "").trim());
    const password = String(body.password ?? "");

    if (roles.length === 0) {
      return NextResponse.json({ error: "Choose Vendor, Influencer, or both." }, { status: 400 });
    }
    if (!name || name.length < 2) {
      return NextResponse.json({ error: "Enter your full name." }, { status: 400 });
    }
    if (!EMAIL_RE.test(email)) {
      return NextResponse.json({ error: "Enter a valid email address." }, { status: 400 });
    }
    if (!PHONE_RE.test(phone)) {
      return NextResponse.json({ error: "Enter a valid Pakistani mobile number." }, { status: 400 });
    }
    if (password.length < 8) {
      return NextResponse.json({ error: "Password must be at least 8 characters." }, { status: 400 });
    }

    const admin = createAdminClient();

    const { data: existingVendorAdmin } = await admin
      .from("vendor_admins")
      .select("id")
      .ilike("email", email)
      .limit(1)
      .maybeSingle();

    if (existingVendorAdmin) {
      return NextResponse.json(
        { error: "This email is already a storefront vendor-admin account. Use Revenue View login." },
        { status: 409 },
      );
    }

    // listUsers isn't a search -- it's manually paginated up to 20 pages
    // (20k users), matching the cap used in nashemann-admin's
    // vendor-provisioning.ts. Without a cap, an account past page 1 (the
    // 1000th signup) would become invisible to this duplicate-email check,
    // letting a second account silently get created for an email that
    // already exists.
    let existingUser: User | undefined;
    for (let page = 1; page <= 20; page += 1) {
      const { data: existingUsers, error: usersError } = await admin.auth.admin.listUsers({ page, perPage: 1000 });
      if (usersError) {
        console.error("[platform/signup] listUsers failed:", usersError.message);
        throw new Error("Couldn't verify this email right now. Please try again.");
      }
      existingUser = existingUsers.users.find((u) => u.email?.toLowerCase() === email);
      if (existingUser || existingUsers.users.length < 1000) break;
    }

    if (existingUser) {
      // Same email + a role picked at signup for an account that already exists: verify the password
      // (proving this is really the account owner) and, if it checks out, attach the new role(s) to
      // the SAME account rather than creating a second one -- this is how "same credentials, one for
      // vendor, one for influencer" stays one login instead of two.
      const verifier = createVerificationClient();
      const { error: signInError } = await verifier.auth.signInWithPassword({ email, password });
      if (signInError) {
        return NextResponse.json(
          { error: "An account with this email already exists and the password doesn't match. Log in instead." },
          { status: 409 },
        );
      }

      const existingRoles = rolesFromMetadata((existingUser.user_metadata ?? {}) as Record<string, unknown>);
      const mergedRoles = Array.from(new Set([...existingRoles, ...roles]));
      const newlyAdded = roles.filter((r) => !existingRoles.includes(r));

      if (newlyAdded.length === 0) {
        return NextResponse.json(
          { error: "This account already has that role. Log in instead." },
          { status: 409 },
        );
      }

      const { error: updateError } = await admin.auth.admin.updateUserById(existingUser.id, {
        user_metadata: { ...existingUser.user_metadata, platform_roles: mergedRoles },
      });
      if (updateError) {
        console.error("[platform/signup] updateUserById failed:", updateError.message);
        throw new Error("Couldn't add the new role right now. Please try again.");
      }

      if (newlyAdded.includes("influencer")) {
        await ensureInfluencerProfile(admin, existingUser.id, name || String(existingUser.user_metadata?.name ?? name), email);
      }

      return NextResponse.json({ ok: true, roles: mergedRoles, email, name: existingUser.user_metadata?.name ?? name });
    }

    const { data: created, error: createError } = await admin.auth.admin.createUser({
      email,
      password,
      email_confirm: true,
      user_metadata: { name, phone, platform_roles: roles },
    });

    if (createError || !created.user) {
      console.error("[platform/signup] createUser failed:", createError?.message);
      throw new Error("Couldn't create your account right now. Please try again.");
    }

    createdUserId = created.user.id;

    // Vendor role is fully represented by auth metadata and does not need
    // platform_accounts to be created before the user can log in.
    // Keep this row best-effort so a legacy/missing table cannot break signup.
    const { error: accountError } = await admin
      .from("platform_accounts")
      .upsert({ id: created.user.id, name, email, phone, provider: "email" });
    if (accountError) {
      console.error("[platform/signup] platform_accounts upsert skipped:", accountError.message);
    }

    if (roles.includes("influencer")) {
      await ensureInfluencerProfile(admin, created.user.id, name, email);
    }

    return NextResponse.json({ ok: true, roles, email, name });
  } catch (error) {
    if (createdUserId) {
      try {
        const admin = createAdminClient();
        await admin.auth.admin.deleteUser(createdUserId);
      } catch {
        // Do not mask the original signup error with cleanup failure.
      }
    }

    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Couldn't create your account." },
      { status: 500 },
    );
  }
}
