# ADR 0002 — Authentication: Better Auth

**Date:** 2026-05-21
**Status:** Accepted
**Deciders:** Lead engineer

---

## Context

We need an auth library that:
- Runs fully self-hosted (no Auth0/Clerk bill that scales with users)
- Supports email magic links, Google OAuth, Microsoft OAuth, and SAML at Phase 6
- Works with our Postgres + Redis stack (no Firebase/DynamoDB dependency)
- Has a TypeScript-native API

---

## Decision

Use **Better Auth** (v1.x) as the primary auth framework.

Sessions are stored in Postgres via the `sessions` table (managed by Better Auth)
and optionally mirrored to Redis for fast lookups.

---

## Rationale

| Option | Why rejected |
|---|---|
| Auth0 / Clerk | SaaS bill scales with users; vendor lock-in |
| NextAuth v4 | Unmaintained; v5 (Auth.js) API is unstable |
| Auth.js v5 | Still beta; breaking changes expected |
| Lucia | Lower-level; more boilerplate; good fallback if Better Auth stalls |
| Passport.js | Express-centric; poor TypeScript support |

Better Auth provides out-of-the-box:
- Magic link (email OTP)
- Social OAuth (Google, Microsoft, GitHub)
- SAML/OIDC plugin (Phase 6 — enterprise SSO)
- SCIM plugin (Phase 6 — Okta/Azure AD provisioning)
- MFA (TOTP + WebAuthn) — scaffolded but disabled at Phase 0

---

## Consequences

- **Positive:** Zero per-user cost. Self-hostable. TypeScript-first.
- **Positive:** SAML and SCIM plugins mean Phase 6 enterprise requirements
  are already on the dependency, not a rewrite.
- **Negative:** Better Auth is newer (< 2 years old). Monitor for breaking
  changes; pin to minor versions in `package.json`.
- **Negative:** Magic link email requires Resend API key in production.
  Local dev works with a log-based delivery (email printed to stdout).

---

## Reversal cost

**Medium** — migrating sessions would require a one-time token migration script.
Schema tables (`sessions`, `accounts`, `verifications`) map closely to Lucia's
schema, so a migration is possible in < 1 week.
