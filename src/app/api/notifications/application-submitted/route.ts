import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { sendApplicationSubmittedEmail, sendNewApplicationAdminEmail } from "@/lib/email";
import { createAdminClient } from "@/lib/supabase/admin";

/**
 * Fired right after /apply successfully inserts a vendor_applications row.
 * Re-reads the row through the caller's own session (RLS scopes it to
 * applicant_account_id = auth.uid()) rather than trusting a client-supplied
 * email/business name for the "to" address.
 */
export async function POST(req: NextRequest) {
  const { referenceId } = (await req.json().catch(() => ({}))) as { referenceId?: string };
  if (!referenceId) return NextResponse.json({ error: "Missing referenceId" }, { status: 400 });

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Not authenticated" }, { status: 401 });

  const { data: application } = await supabase
    .from("vendor_applications")
    .select("reference_id, business_name, owner_name, owner_email")
    .eq("reference_id", referenceId)
    .maybeSingle();

  if (!application) return NextResponse.json({ error: "Application not found" }, { status: 404 });

  await sendApplicationSubmittedEmail({
    to: application.owner_email,
    ownerName: application.owner_name,
    businessName: application.business_name,
    referenceId: application.reference_id,
  });

  // Notify the configured platform inbox only after the application is verified in the database.
  try {
    const admin = createAdminClient();
    const { data: settings } = await admin
      .from("platform_settings")
      .select("support_email")
      .eq("id", true)
      .maybeSingle();
    if (settings?.support_email) {
      await sendNewApplicationAdminEmail({
        to: settings.support_email,
        ownerName: application.owner_name,
        ownerEmail: application.owner_email,
        businessName: application.business_name,
        referenceId: application.reference_id,
      });
    } else {
      console.warn("[email] Application submitted but platform_settings.support_email is not configured.");
    }
  } catch (error) {
    console.error("[email] Failed to notify platform about new application:", error);
  }

  return NextResponse.json({ success: true });
}
