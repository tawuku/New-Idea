# Nexus Workspace — Progress Log

> Read this at the start of every session before doing anything else.

---

## 2026-05-21 — Phase 0: Foundation

### What shipped

- Monorepo skeleton: pnpm workspaces + Turborepo, Biome, TypeScript strict
- `packages/config` — shared tsconfig variants + Zod env parser
- `packages/schemas` — Zod schemas for auth, user, workspace, domain events
- `packages/db` — Drizzle schema (users, workspaces, workspace_members, sessions, accounts, verifications, audit_events) + seed script
- `packages/ui` — Button, Input, Badge components; design tokens in globals.css
- `apps/api` — Fastify server with /healthz, /readyz, /api/v1/workspaces routes; Pino structured logger
- `apps/web` — Next.js 15 App Router; sign-in (magic link + OAuth), sign-up, verify-email pages; workspace create flow; app shell with sidebar + cmd-K command palette stub; settings stub
- CI: GitHub Actions pipeline (lint, typecheck, test, build, secret-scan)
- CD: Vercel deploy on merge to main
- Husky pre-commit: biome check + gitleaks
- Playwright E2E skeleton (auth flow tests)
- Vitest unit tests (schema validation tests passing)
- ADR 0001 (monorepo tooling), ADR 0002 (Better Auth)

### What's not yet wired

- Better Auth server instance (needs DATABASE_URL in prod; scaffolded, not fully wired into API routes)
- Real session middleware in the API (placeholder user injection — auth middleware TODO for Phase 1)
- Redis session store (Upstash free tier — needs REDIS_URL in .env.local)
- Resend email delivery (magic links print to stdout in dev without RESEND_API_KEY)
- Supabase/Neon database provisioning (needs DATABASE_URL set)
- Lighthouse CI / k6 performance budgets (Phase 1 item)

### Decisions made

- pnpm + Turborepo over npm/Yarn + Nx (ADR 0001)
- Better Auth over Auth.js/Lucia (ADR 0002)
- Modular monolith first — no microservices yet (per RULES.md §9)
- No default exports except Next.js pages/layouts (per RULES.md §2.1)

### What's next (Phase 1)

- Wire Better Auth fully into the API (auth routes, session validation middleware)
- Channels, DMs, messages (WebSocket via Socket.IO)
- File uploads to R2
- Typesense search over messages
- In-app notifications

---

## Template for future entries

```md
## YYYY-MM-DD — Phase N: <name>

### What shipped
### What broke
### Decisions made
### What's next
```
