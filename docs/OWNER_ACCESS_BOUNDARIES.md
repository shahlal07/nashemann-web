# Owner Workspace Boundary

The owner/co-founder workspace lives in `nashemann-admin`, under the dedicated `/owners` route group and Supabase owner-membership authorization. This public/customer-facing app must not host the owner dashboard or infer owner privileges from a customer, vendor, influencer, or storefront role.

Rules:
- Do not add owner financial, governance, decision, or approval data to public pages or customer-facing APIs.
- Do not treat `owner_memberships` as a substitute for this app's existing account-role checks.
- Any future owner-facing link must point to the separately authenticated owner portal and must not include credentials or session tokens in URLs.
- If an owner needs to use customer-facing features, they must separately hold the corresponding customer/vendor role; ownership alone grants nothing here.

This document records the cross-repository security boundary. It does not add owner routes or alter existing public login behavior.
