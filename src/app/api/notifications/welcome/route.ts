import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { sendWelcomeEmail } from "@/lib/email";

/**
 * Fired once, immediately after a platform_accounts row is first created
 * (see AuthForm.tsx's insert-vs-upsert existence checks) -- reads the
 * account back through the caller's own session rather than trusting a
 * client-supplied name/email.
 */
export async function POST() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Not authenticated" }, { status: 401 });

  const { data: account } = await supabase.from("platform_accounts").select("name, email").eq("id", user.id).maybeSingle();
  if (!account) return NextResponse.json({ error: "Account not found" }, { status: 404 });

  await sendWelcomeEmail({ to: account.email, name: account.name });

  return NextResponse.json({ success: true });
}
