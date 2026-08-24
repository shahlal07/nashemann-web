"use client";

import { createClient } from "@/lib/supabase/client";

export type BugReportStatus = "pending" | "confirmed" | "rejected";

export type BugReport = {
  id: string;
  title: string;
  description: string;
  status: BugReportStatus;
  adminNote: string | null;
  rewardGranted: boolean;
  reporterName: string;
  reporterEmail: string;
  createdAt: string;
  reviewedAt: string | null;
  screenshotUrl?: string | null;
};

// bug_reports is shared with vendor-storefronts/vendor-admins (same
// Supabase project) -- its real schema is profile_id/screenshot_path/
// source/vendor_id, not the reporter_account_id/screenshot_url shape this
// file used to assume. reporter_name/reporter_email were added here
// specifically for this app's anonymous reporters (no profile_id to key
// off of).
type BugReportRow = {
  id: string;
  title: string;
  description: string;
  status: BugReportStatus;
  admin_note: string | null;
  reward_granted: boolean;
  reporter_name: string | null;
  reporter_email: string | null;
  created_at: string;
  reviewed_at: string | null;
  screenshot_path: string | null;
};

const BUG_REPORT_COLUMNS =
  "id, title, description, status, admin_note, reward_granted, reporter_name, reporter_email, created_at, reviewed_at, screenshot_path";

function mapRow(row: BugReportRow): BugReport {
  return {
    id: row.id,
    title: row.title,
    description: row.description,
    status: row.status,
    adminNote: row.admin_note,
    rewardGranted: row.reward_granted,
    reporterName: row.reporter_name ?? "Anonymous",
    reporterEmail: row.reporter_email ?? "—",
    createdAt: row.created_at,
    reviewedAt: row.reviewed_at,
    screenshotUrl: row.screenshot_path,
  };
}

/** Bug reports visible to the signed-in reporter (RLS scopes this to their own rows, or all rows for staff). */
export async function getAllBugReports(): Promise<BugReport[]> {
  const supabase = createClient();
  const { data, error } = await supabase
    .from("bug_reports")
    .select(BUG_REPORT_COLUMNS)
    .eq("source", "nashemann")
    .order("created_at", { ascending: false });
  if (error || !data) return [];
  return (data as BugReportRow[]).map(mapRow);
}

/** Uploads a screenshot to the public `bug-report-screenshots` bucket and returns its path. */
export async function uploadBugScreenshot(file: File): Promise<string | null> {
  const supabase = createClient();
  const ext = file.name.split(".").pop() || "png";
  const path = `${Date.now()}-${Math.random().toString(36).slice(2, 8)}.${ext}`;
  const { error } = await supabase.storage.from("bug-report-screenshots").upload(path, file);
  if (error) return null;
  return path;
}

export async function submitBugReport(input: {
  title: string;
  description: string;
  reporterName: string;
  reporterEmail: string;
  screenshotFile: File | null;
}): Promise<BugReport> {
  const supabase = createClient();
  const userId = await supabase.auth
    .getUser()
    .then(({ data }) => data.user?.id ?? null)
    .catch(() => null);

  const screenshotPath = input.screenshotFile ? await uploadBugScreenshot(input.screenshotFile) : null;

  const id = crypto.randomUUID();
  const createdAt = new Date().toISOString();

  // Anonymous submitters have no profile_id, so they can't satisfy a
  // self-scoped SELECT RLS policy to read the row straight back -- Postgres
  // requires INSERT...RETURNING to pass a SELECT policy too. Insert with
  // return=minimal instead and build the confirmation from what we already know.
  const { error } = await supabase.from("bug_reports").insert({
    id,
    profile_id: userId,
    title: input.title,
    description: input.description,
    reporter_name: input.reporterName || "Anonymous",
    reporter_email: input.reporterEmail || "—",
    screenshot_path: screenshotPath,
    created_at: createdAt,
    source: "nashemann",
  });
  if (error) {
    console.error("[submitBugReport] insert failed:", error.message);
    // P0001 is our own raised exception (e.g. the rate-limit trigger) --
    // that message is intentionally user-facing. Anything else is a raw
    // Postgres/PostgREST error, which stays server-log-only.
    throw new Error(error.code === "P0001" ? error.message : "Failed to submit your bug report. Please try again.");
  }

  return {
    id,
    title: input.title,
    description: input.description,
    status: "pending",
    adminNote: null,
    rewardGranted: false,
    reporterName: input.reporterName || "Anonymous",
    reporterEmail: input.reporterEmail || "—",
    createdAt,
    reviewedAt: null,
    screenshotUrl: screenshotPath,
  };
}
