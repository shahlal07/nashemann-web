import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { sendAccountDeletionConfirmationEmail } from "@/lib/email";

/**
 * GDPR-style "delete my account". Forwards the caller's own session access
 * token to the `delete-account` Edge Function, which re-verifies it and only
 * ever acts on the id embedded in that JWT -- this route never sends a
 * client-supplied account id anywhere.
 */
export async function POST() {
  const supabase = await createClient();

  // getClaims() verifies the JWT signature every time; getSession() below is
  // used solely to obtain the raw access token to forward to the edge
  // function, never as the authz decision itself (matching this project's
  // documented convention against relying on getSession()/getUser() alone).
  const { data: claims } = await supabase.auth.getClaims();
  if (!claims) {
    return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
  }

  const {
    data: { session },
  } = await supabase.auth.getSession();

  if (!session) {
    return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
  }

  // Captured before the account row is gone -- the edge function deletes it.
  const { data: account } = await supabase.from("platform_accounts").select("name, email").eq("id", session.user.id).maybeSingle();

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

  const email = account?.email ?? session.user.email;
  if (email) {
    await sendAccountDeletionConfirmationEmail({ to: email, name: account?.name ?? "there" });
  }

  return NextResponse.json({ success: true }, { status: 200 });
}
