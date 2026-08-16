import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

/**
 * GDPR-style "delete my account". Forwards the caller's own session access
 * token to the `delete-account` Edge Function, which re-verifies it and only
 * ever acts on the id embedded in that JWT -- this route never sends a
 * client-supplied account id anywhere.
 */
export async function POST() {
  const supabase = await createClient();

  const {
    data: { session },
  } = await supabase.auth.getSession();

  if (!session) {
    return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
  }

  const functionsUrl = `${process.env.NEXT_PUBLIC_SUPABASE_URL}/functions/v1/delete-account`;
  const res = await fetch(functionsUrl, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${session.access_token}`,
      "Content-Type": "application/json",
      apikey: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    },
  });

  const body = await res.json().catch(() => ({ error: "Unexpected response from delete-account" }));

  if (!res.ok) {
    return NextResponse.json({ error: body?.error ?? "Failed to delete account" }, { status: res.status });
  }

  // Sign out locally too so no stale session cookie lingers for the now-deleted user.
  await supabase.auth.signOut();

  return NextResponse.json({ success: true }, { status: 200 });
}
