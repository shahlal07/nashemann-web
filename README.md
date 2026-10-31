# nashemann-web

Platform layer for Nashemann: the public marketing site, the vendor application
funnel, and platform-level customer accounts.

- Production: <https://nashemann.store>
- Local: <http://localhost:3000>
- Related repos: [nashemann-admin](https://github.com/shahlal07/nashemann-admin) ·
  [vendor-admins](https://github.com/shahlal07/vendor-admins) ·
  [vendor-storefronts](https://github.com/shahlal07/vendor-storefronts)

## What this app owns

- Marketing/directory homepage and public content pages (pricing, blog,
  case studies, comparisons, updates, status, terms).
- Vendor applications: `/apply` → `vendor_applications` → admin approval →
  real `vendors` / `vendor_admins` rows.
- Platform accounts: signup/login and the `/account` surface backed by
  `platform_accounts` — Nashemann's own identity system, separate from any
  vendor's storefront login.
- `/vendor/dashboard` for vendor concerns that are genuinely platform-side
  (profile/theme that feeds the vendor's Nashemann listing, referrals, loyalty).

## What this app does NOT own

**This app does not host any vendor's real storefront or checkout.** Cart,
checkout, orders and per-vendor operations belong to
`vendor-storefronts` / `vendor-admins`, which run on the separate commerce
Supabase project (`eznxsosvsgkhexbjoolh`).

An earlier in-app `/store` implementation and its `product` / `order` /
`vendor_payment_methods` tables duplicated that engine. They are known cleanup
debt, not the real path. See `CLAUDE.md` before touching `src/app/store/` or
the vendor dashboard product/order/payment subpages.

## Stack

Next.js 16.3 (App Router) · React 19 · Tailwind CSS 4 · `@supabase/ssr` ·
Recharts · Framer Motion. Supabase migrations live in `supabase/`.

## Local development

```bash
npm install
cp .env.example .env.local   # then fill in real values
npm run dev                  # http://localhost:3000
```

Other scripts: `npm run build`, `npm start`, `npm run lint`.

## Environment variables

See [`.env.example`](./.env.example) for the full list with comments. Never
commit `.env.local`. Highlights:

| Variable | Notes |
|---|---|
| `NEXT_PUBLIC_APP_URL` | Base URL, no trailing slash |
| `NEXT_PUBLIC_PLATFORM_ROOT_DOMAIN` | Root domain for `{slug}.nashemann.store` links |
| `NEXT_PUBLIC_SUPABASE_URL` / `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Public browser credentials |
| `SUPABASE_SERVICE_ROLE_KEY` | Server-only — bypasses RLS, never expose |
| `NASHEMANN_MAILER_URL` | Points at the `nashemann-admin` mailer |
| `GROQ_API_KEY` | Powers the `/chat` assistant |

> **Open question:** `CLAUDE.md` states this app's Supabase project is the
> platform project `mztayodmvdpzzwzznsvu`, but the local `.env.local` currently
> points at the commerce project `eznxsosvsgkhexbjoolh`. Confirm which is
> intended before running migrations or schema changes.

## Working conventions

- Read `CLAUDE.md` before changing vendor or storefront behaviour.
- Cross-repo decisions, tasks and status live in `nashemann-admin/docs/` —
  treat that repo as the shared project brain.
- Never commit secrets, tokens, or customer/payment data.
