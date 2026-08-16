import { NextRequest, NextResponse } from "next/server";
import { sendBugReportAckEmail } from "@/lib/email";

type Body = { title?: string; reporterName?: string; reporterEmail?: string };

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

/**
 * Fired right after /report-bug successfully inserts a bug_reports row.
 * Anonymous reports have no reporter_account_id, so (like the storefront
 * order route) there's no session to re-read the row through -- the fields
 * are taken from the request body, same trust level as the public insert.
 * Skips silently when no usable email was given (bug reports don't require one).
 */
export async function POST(req: NextRequest) {
  const { title, reporterName, reporterEmail } = (await req.json().catch(() => ({}))) as Body;

  if (!reporterEmail || !EMAIL_PATTERN.test(reporterEmail.trim())) {
    return NextResponse.json({ skipped: true });
  }

  await sendBugReportAckEmail({
    to: reporterEmail.trim(),
    name: reporterName?.trim() || "there",
    title: title?.trim() || "your bug report",
  });

  return NextResponse.json({ success: true });
}
