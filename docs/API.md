# Nashemann Vendor API (v1)

A minimal, read-only API proving the API-key concept end to end. One endpoint today; more can follow the same pattern.

## Authentication

Generate a key from your vendor dashboard: **Dashboard → API keys → New key**. The raw key is shown exactly once — copy it immediately. Nashemann only ever stores a SHA-256 hash of it (`api_keys.key_hash`), so it cannot be recovered later; if you lose it, revoke it and generate a new one.

Send the key on every request as a bearer token:

```
Authorization: Bearer nshm_xxxxxxxxxxxxxxxxxxxxxxxx
```

(`X-API-Key: nshm_...` also works.)

## `GET /api/v1/settlements`

Returns the authenticated vendor's own settlement records — nothing else. There is no way to pass a different vendor's ID; the key itself determines whose data comes back.

```bash
curl https://nashemann.vercel.app/api/v1/settlements \
  -H "Authorization: Bearer nshm_xxxxxxxxxxxxxxxxxxxxxxxx"
```

Response:

```json
{
  "data": [
    {
      "id": "…",
      "month": "2026-08-01",
      "orders_count": 42,
      "gross_revenue": 120000,
      "platform_fee": 1800,
      "status": "pending",
      "amount_paid": 0,
      "due_date": "2026-09-05"
    }
  ]
}
```

Errors: `401 missing_api_key` (no header sent), `401 invalid_or_revoked_api_key` (bad or revoked key), `500 internal_error`.

## How it works under the hood

The route hashes the presented key with SHA-256 and calls a `SECURITY DEFINER` Postgres RPC, `api_v1_settlements(p_api_key_hash)`, which looks the hash up in `api_keys`, confirms it isn't revoked, stamps `last_used_at`, and returns only that key's `vendor_id`'s settlement rows. Row Level Security on `settlements` is bypassed deliberately inside that one function (the way `is_finance_staff()`-gated policies are elsewhere in this codebase) — the function itself is the trust boundary, not a Supabase auth session, since API-key callers have no session.

## Scope of this proof-of-concept

This is deliberately one endpoint, not a full API surface. It exists to prove the key-issuance → hash → scoped-RPC → per-vendor-response pipeline actually works, not to be a complete vendor API. Extending it to more resources (orders, coupons, reviews) means adding more `api_v1_*` RPCs following the same shape and more routes under `src/app/api/v1/`.

## Webhooks

Vendors can also register a webhook (Dashboard → Webhooks) for `settlement.paid`. When a settlement's status flips to `paid`, a Postgres trigger (`fire_settlement_paid_webhooks`, using the `pg_net` extension) POSTs a JSON payload to every active, matching webhook URL, signed with an HMAC-SHA256 signature in the `X-Nashemann-Signature` header (verify it against your registered secret to confirm the payload came from Nashemann).
