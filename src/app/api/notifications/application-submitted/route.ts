import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { sendApplicationSubmittedEmail } from "@/lib/email";

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

  return NextResponse.json({ success: true });
}
