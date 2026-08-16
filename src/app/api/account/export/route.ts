import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

/**
 * GDPR-style "export my data": returns everything this signed-in account owns
 * as a downloadable JSON file. Every query below is scoped by RLS to the
 * caller's own auth.uid() (via the server client's session cookies) -- there
 * is no client-supplied id anywhere in this route.
 */
export async function GET() {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
  }

  const [{ data: account }, { data: applications }, { data: bugReports }, { data: conversations }] = await Promise.all([
    supabase.from("platform_accounts").select("id, name, email, phone, provider, created_at").eq("id", user.id).maybeSingle(),
    supabase
      .from("vendor_applications")
      .select(
        "id, reference_id, business_name, business_type, owner_name, owner_email, owner_phone, city, subdomain_preference, requested_plan, status, message, referral_code, submitted_at, reviewed_at"
      )
      .order("submitted_at", { ascending: false }),
    supabase
      .from("bug_reports")
      .select("id, title, description, status, admin_note, reward_granted, reporter_name, reporter_email, screenshot_url, created_at, reviewed_at")
      .order("created_at", { ascending: false }),
    supabase
      .from("support_conversations")
      .select("id, name, email, status, created_at, support_messages(id, sender_type, body, created_at)")
      .order("created_at", { ascending: false }),
  ]);

  const exportPayload = {
    exported_at: new Date().toISOString(),
    account: account ?? null,
    vendor_applications: applications ?? [],
    bug_reports: bugReports ?? [],
    support_conversations: conversations ?? [],
  };

  return new NextResponse(JSON.stringify(exportPayload, null, 2), {
    status: 200,
    headers: {
      "Content-Type": "application/json",
      "Content-Disposition": `attachment; filename="nashemann-account-export-${user.id}.json"`,
    },
  });
}
