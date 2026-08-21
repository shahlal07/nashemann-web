import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";

function money(value: number) {
  return new Intl.NumberFormat("en-PK", { style: "currency", currency: "PKR", maximumFractionDigits: 0 }).format(value);
}

export default async function RevenueViewPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user?.email) redirect("/login?error=not_storefront");

  const admin = createAdminClient();
  const { data: vendorAdmin } = await admin
    .from("vendor_admins")
    .select("vendor_id,name,email,role")
    .ilike("email", user.email)
    .limit(1)
    .maybeSingle();

  if (!vendorAdmin) redirect("/login?error=not_storefront");

  const { data: vendor } = await admin
    .from("vendors")
    .select("id,name,subdomain,status,orders_last_30d,revenue_last_30d,currency")
    .eq("id", vendorAdmin.vendor_id)
    .maybeSingle();

  if (!vendor) redirect("/login?error=store_not_found");

  const { data: orders } = await admin
    .from("orders")
    .select("id,order_number,status,total,customer_name,created_at")
    .eq("vendor_id", vendor.id)
    .order("created_at", { ascending: false })
    .limit(8);

  const totalRecentRevenue = (orders ?? []).reduce((sum, order) => sum + Number(order.total ?? 0), 0);
  const activeRecentOrders = (orders ?? []).filter((order) => !["delivered", "cancelled", "canceled", "refunded"].includes(String(order.status ?? "").toLowerCase())).length;

  return (
    <main className="min-h-screen bg-[var(--surface-sunken)] px-5 py-12 text-[var(--text)]">
      <div className="mx-auto max-w-5xl">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[var(--accent-violet)]">Nashemann</p>
            <h1 className="mt-2 text-3xl font-semibold">Revenue View</h1>
            <p className="mt-1 text-sm text-[var(--text-muted)]">{vendor.name} · {vendorAdmin.name} · vendor-scoped only</p>
          </div>
          <div className="rounded-full border border-[var(--border)] bg-[var(--surface)] px-3 py-1.5 text-xs font-semibold text-[var(--text-muted)]">{vendor.status}</div>
        </div>

        <div className="mt-8 grid gap-4 sm:grid-cols-3">
          <section className="rounded-2xl border border-[var(--border)] bg-[var(--surface)] p-5">
            <p className="text-xs text-[var(--text-faint)]">Orders (30d)</p>
            <p className="mt-2 text-3xl font-semibold">{vendor.orders_last_30d}</p>
          </section>
          <section className="rounded-2xl border border-[var(--border)] bg-[var(--surface)] p-5">
            <p className="text-xs text-[var(--text-faint)]">Revenue (30d)</p>
            <p className="mt-2 text-3xl font-semibold">{money(Number(vendor.revenue_last_30d ?? 0))}</p>
          </section>
          <section className="rounded-2xl border border-[var(--border)] bg-[var(--surface)] p-5">
            <p className="text-xs text-[var(--text-faint)]">Recent orders shown</p>
            <p className="mt-2 text-3xl font-semibold">{orders?.length ?? 0}</p>
            <p className="mt-1 text-xs text-[var(--text-faint)]">{activeRecentOrders} still active · {money(totalRecentRevenue)} recent total</p>
          </section>
        </div>

        <section className="mt-6 overflow-hidden rounded-2xl border border-[var(--border)] bg-[var(--surface)]">
          <div className="border-b border-[var(--border)] px-5 py-4">
            <h2 className="text-sm font-semibold">Recent orders</h2>
            <p className="mt-1 text-xs text-[var(--text-faint)]">Only orders belonging to {vendor.name} are shown.</p>
          </div>
          {(orders?.length ?? 0) === 0 ? (
            <div className="px-5 py-12 text-center text-sm text-[var(--text-muted)]">No orders yet.</div>
          ) : (
            <div className="divide-y divide-[var(--border)]">
              {orders!.map((order) => (
                <div key={order.id} className="grid gap-2 px-5 py-4 sm:grid-cols-[1fr_auto_auto] sm:items-center">
                  <div>
                    <p className="text-sm font-semibold">{order.order_number}</p>
                    <p className="text-xs text-[var(--text-faint)]">{order.customer_name || "Customer"} · {order.created_at ? new Date(order.created_at).toLocaleString("en-PK") : ""}</p>
                  </div>
                  <span className="rounded-full border border-[var(--border)] px-2.5 py-1 text-xs text-[var(--text-muted)]">{order.status || "pending"}</span>
                  <span className="text-sm font-semibold">{money(Number(order.total ?? 0))}</span>
                </div>
              ))}
            </div>
          )}
        </section>

        <p className="mt-5 text-center text-xs text-[var(--text-faint)]">Live vendor-scoped revenue review. No cross-vendor data is exposed.</p>
      </div>
    </main>
  );
}
