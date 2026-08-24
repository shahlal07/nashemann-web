import { NextRequest, NextResponse } from "next/server";
import { sendBugReportAckEmail } from "@/lib/email";
import { createAdminClient } from "@/lib/supabase/admin";

type Body = { id?: string; title?: string; reporterName?: string; reporterEmail?: string };

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

/**
 * Fired right after /report-bug successfully inserts a bug_reports row.
 * Anonymous reports have no reporter_account_id, so (like the storefront
 * order route) there's no session to re-read the row through -- but unlike
 * that route, this previously trusted the request body outright with no
 * check that a matching row was ever actually inserted, letting anyone POST
 * arbitrary JSON here directly and trigger unlimited emails to any address.
 * Now requires the row's own id (returned from the insert, not guessable)
 * and verifies it via the service-role client before sending anything.
 */
export async function POST(req: NextRequest) {
  const { id, title, reporterName, reporterEmail } = (await req.json().catch(() => ({}))) as Body;

  if (!id || !reporterEmail || !EMAIL_PATTERN.test(reporterEmail.trim())) {
    return NextResponse.json({ skipped: true });
  }

  const admin = createAdminClient();
  const { data: row } = await admin
    .from("bug_reports")
    .select("id")
    .eq("id", id)
    .eq("reporter_email", reporterEmail.trim())
    .maybeSingle();
  if (!row) return NextResponse.json({ skipped: true });

  await sendBugReportAckEmail({
    to: reporterEmail.trim(),
    name: reporterName?.trim() || "there",
    title: title?.trim() || "your bug report",
  });

  return NextResponse.json({ success: true });
}
