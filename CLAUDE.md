# CLAUDE.md

## What Nashemann actually is (read this before touching vendor/storefront code)

Nashemann is the **platform layer** — vendor applications, approval,
platform-account signup/login, the marketing/directory homepage, and
(from `nashemann-admin`) super-admin oversight across every vendor. Its own
Supabase project is `mztayodmvdpzzwzznsvu`.

**Nashemann does NOT host any vendor's real storefront or checkout.** That
role belongs to `vendor-storefronts`/`vendor-admins` (`E:\Claude\vendor-storefronts`,
`E:\Claude\vendor-admins`, Supabase project `eznxsosvsgkhexbjoolh`), which
is a real, mature, already-multi-tenant storefront+admin engine (host-based
vendor resolution via `resolve_vendor_by_host`, per-vendor `site_content`
branding, real cart/checkout/orders) that every Nashemann-onboarded vendor
actually runs on. TheAamGhar was vendor #1 there from the start; Mina Cafe
(`minacafe.nashemann.store`) was onboarded as vendor #2 on 2026-08-16 —
see `vendor-admins/CLAUDE.md`'s "This is now the real multi-vendor
engine" section for the full story, including a real cross-vendor RLS leak
found and fixed on the `orders` table while onboarding her.

### A real architecture correction happened mid-build (2026-08-16)

Earlier the same night, a `vendor storefront deployment` route was built directly inside
`src/app/store/` — a full storefront-with-checkout implementation backed by
new tables (`vendor-side product tables`, `vendor-side order tables`,
`vendor_payment_methods`) in *this* app's own database. **That was a
mistake, corrected the same session.** It duplicated what `vendor-storefronts`
already does properly, and would have meant every future vendor needing a
second, parallel, less-mature storefront system. Mina Cafe was briefly
provisioned through it before being properly re-onboarded on
`vendor-storefronts` instead.

**Those `vendor storefront deployment` files and tables are not yet deleted** — check
`src/app/store/`, `vendor-side product tables`/`vendor-side order tables`/
`vendor_payment_methods` in `mztayodmvdpzzwzznsvu`, and the vendor
dashboard subpages built against them
(`src/app/vendor/dashboard/{products,orders,payment}`) before assuming
they're either (a) safe to delete outright, since something might still
link to them, or (b) the real system, since they aren't. Treat this as
known cleanup debt: confirm nothing user-facing still points at
`vendor storefront deployment` (the homepage vendor directory was already repointed to
`{vendor.subdomain}.nashemann.store` — verify that's still true before
assuming the old route is fully orphaned), then remove the dead code and
tables in one pass rather than leaving both systems half-alive
indefinitely.

### What legitimately belongs in this app (built correctly, keep)

- Vendor applications (`/apply` → `vendor_applications` → admin approval →
  real `vendors`/`vendor_admins` rows) — this is the real Nashemann
  onboarding funnel feeding vendors *into* `vendor-storefronts`'s engine, not a
  storefront itself.
- Platform accounts (signup/login, `platform_accounts`) — Nashemann's own
  customer-facing identity system, separate from any vendor's own storefront
  login on `vendor-storefronts`.
- `/vendor/dashboard` — vendor self-service for things that genuinely are
  Nashemann's concern (profile/theme editing that feeds the vendor's
  Nashemann-side listing, referrals, loyalty) — but NOT product/order
  management, which now belongs on `vendor-admins` instead (the
  `products`/`orders` dashboard subpages built against the deprecated
  `vendor storefront deployment` schema should eventually point vendors at
  `vendor-admins` instead, or be removed as part of the cleanup above).
- RBAC, audit trail, API keys, webhooks, GDPR export/delete, real Resend
  email wiring (application confirmations, approval/rejection notices,
  settlement-paid notices, staff invites) — all real, all platform-layer,
  all still correct regardless of the storefront correction above.
- The public homepage's "Real stores, already selling" directory —
  correctly links out to each vendor's real `vendor-storefronts`-powered
  subdomain, not an in-app route.

### Domain plan

`nashemann.store` (root + `www`) → this app. `superadmin.nashemann.store` →
`nashemann-admin`. Every vendor's real storefront/admin subdomains
(`{slug}.nashemann.store`, `admin.{slug}.nashemann.store`) → the
`vendor-storefronts`/`vendor-admins` Vercel projects, NOT this one — assigned
per-vendor in the Vercel dashboard (no domain-management API tool is
available in this environment; it's a manual one-time step per vendor).

@AGENTS.md
