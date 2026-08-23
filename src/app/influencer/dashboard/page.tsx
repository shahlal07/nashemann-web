import { redirect } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";

function money(value: number) {
  return new Intl.NumberFormat("en-PK", { style: "currency", currency: "PKR", maximumFractionDigits: 0 }).format(value);
}

export default async function InfluencerDashboardPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login?error=not_influencer");

  const admin = createAdminClient();
  const { data: influencer } = await admin
    .from("influencers")
    .select("id,name,email,social_handle,platform,follower_count,referral_code,cut_percent,status,joined_at")
    .eq("account_id", user.id)
    .maybeSingle();

  if (!influencer) redirect("/login?error=influencer_profile_missing");

  const { data: applications } = await admin
    .from("vendor_applications")
    .select("reference_id,business_name,city,status,submitted_at,requested_plan,referral_code")
    .eq("referral_code", influencer.referral_code)
    .order("submitted_at", { ascending: false });

  const { data: referredVendors } = await admin
    .from("influencer_referred_vendors")
    .select("vendor_id,referred_at")
    .eq("influencer_id", influencer.id);

  const { data: programSettings } = await admin
    .from("influencer_program_settings")
    .select("cut_duration_months")
    .maybeSingle();
  const cutDurationMonths = Number(programSettings?.cut_duration_months ?? 12);

  let revenue = 0;
  if (referredVendors && referredVendors.length > 0) {
    const vendorIds = referredVendors.map((v) => v.vendor_id);
    const { data: vendorOrders } = await admin
      .from("orders")
      .select("total,vendor_id,created_at")
      .in("vendor_id", vendorIds);

    const referredAtByVendor = new Map(referredVendors.map((v) => [v.vendor_id, new Date(v.referred_at)]));
    for (const order of vendorOrders ?? []) {
      const referredAt = referredAtByVendor.get(order.vendor_id);
      if (!referredAt) continue;
      const windowEnd = new Date(referredAt);
      windowEnd.setMonth(windowEnd.getMonth() + cutDurationMonths);
      const orderDate = new Date(order.created_at);
      if (orderDate >= referredAt && orderDate <= windowEnd) {
        revenue += Number(order.total ?? 0);
      }
    }
  }
  const earnings = revenue * Number(influencer.cut_percent ?? 0) / 100;

  return (
    <main className="mx-auto max-w-5xl px-5 py-14 lg:py-20">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[var(--accent-violet)]">Nashemann Influencer</p>
          <h1 className="mt-2 text-3xl font-semibold text-[var(--text)]">Welcome, {influencer.name}</h1>
          <p className="mt-1 text-sm text-[var(--text-muted)]">{influencer.social_handle} · {influencer.platform} · {influencer.status}</p>
        </div>
        <Link href="/" className="rounded-full border border-[var(--border)] px-4 py-2 text-xs font-semibold text-[var(--text-muted)] hover:text-[var(--text)]">Back to Nashemann</Link>
      </div>

      <div className="mt-8 grid gap-4 sm:grid-cols-3">
        <section className="rounded-2xl border border-[var(--border)] bg-[var(--surface)] p-5"><p className="text-xs text-[var(--text-faint)]">Businesses referred</p><p className="mt-2 text-3xl font-semibold text-[var(--text)]">{applications?.length ?? 0}</p></section>
        <section className="rounded-2xl border border-[var(--border)] bg-[var(--surface)] p-5"><p className="text-xs text-[var(--text-faint)]">Platform revenue generated</p><p className="mt-2 text-3xl font-semibold text-[var(--text)]">{money(revenue)}</p></section>
        <section className="rounded-2xl border border-[var(--border)] bg-[var(--surface)] p-5"><p className="text-xs text-[var(--text-faint)]">Your earnings ({Number(influencer.cut_percent ?? 0)}%)</p><p className="mt-2 text-3xl font-semibold text-[var(--text)]">{money(earnings)}</p></section>
      </div>

      <section className="mt-6 rounded-2xl border border-[var(--border)] bg-[var(--surface)] p-5">
        <p className="text-xs text-[var(--text-faint)]">Your referral code</p>
        <div className="mt-2 flex flex-wrap items-center gap-3"><code className="rounded-xl bg-[var(--surface-hover)] px-4 py-2 text-lg font-bold tracking-[0.2em] text-[var(--text)]">{influencer.referral_code}</code><span className="text-xs text-[var(--text-muted)]">Share it from your dashboard to bring new vendor applications.</span></div>
      </section>

      <section className="mt-6 overflow-hidden rounded-2xl border border-[var(--border)] bg-[var(--surface)]">
        <div className="border-b border-[var(--border)] px-5 py-4"><h2 className="text-sm font-semibold text-[var(--text)]">Applications through your link</h2><p className="mt-1 text-xs text-[var(--text-faint)]">Live application records; no seeded demo rows are used here.</p></div>
        {(applications?.length ?? 0) === 0 ? <div className="px-5 py-12 text-center text-sm text-[var(--text-muted)]">No referrals yet.</div> : <div className="divide-y divide-[var(--border)]">{applications!.map((app) => <div key={app.reference_id} className="flex flex-wrap items-center justify-between gap-3 px-5 py-4"><div><p className="text-sm font-semibold text-[var(--text)]">{app.business_name}</p><p className="text-xs text-[var(--text-faint)]">{app.city} · {new Date(app.submitted_at).toLocaleDateString("en-PK")}</p></div><span className="rounded-full border border-[var(--border)] px-2.5 py-1 text-xs text-[var(--text-muted)]">{app.status}</span></div>)}</div>}
      </section>

      <p className="mt-5 text-center text-xs text-[var(--text-faint)]">Account-scoped to {influencer.email}. Your data is never taken from another influencer's dashboard.</p>
    </main>
  );
}
