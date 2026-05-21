# Nexus Workspace

> One workspace. Every tool. Zero noise.

A unified work operating system that consumes other SaaS tools rather than
competing with them.

---

## Quick start

### Prerequisites

- Node 22+ (`nvm use`)
- pnpm 10+ (`npm i -g pnpm@latest`)
- Docker (for local Postgres + Redis)

### 1. Clone and install

```bash
git clone https://github.com/tawuku/new-idea.git nexus-workspace
cd nexus-workspace
pnpm install
```

### 2. Configure environment

```bash
cp .env.example .env.local
# Fill in DATABASE_URL, REDIS_URL, BETTER_AUTH_SECRET (min 32 chars),
# and optionally GOOGLE_CLIENT_ID / MICROSOFT_CLIENT_ID for OAuth.
```

### 3. Start local services

```bash
# Postgres + Redis via Docker
docker run -d --name nexus-pg -e POSTGRES_PASSWORD=postgres -p 5432:5432 postgres:16-alpine
docker run -d --name nexus-redis -p 6379:6379 redis:7-alpine
```

### 4. Run migrations + seed

```bash
pnpm db:migrate
pnpm db:seed
```

### 5. Start dev servers

```bash
pnpm dev
# Web → http://localhost:3000
# API → http://localhost:3001
```

---

## Repo structure

```
nexus-workspace/
├── apps/
│   ├── web/              Next.js 15 — main web app
│   └── api/              Fastify — REST API
├── packages/
│   ├── config/           Shared tsconfig + env validator
│   ├── db/               Drizzle schema + migrations
│   ├── schemas/          Zod schemas (shared between apps)
│   └── ui/               Design system components
├── docs/
│   ├── adr/              Architecture Decision Records
│   ├── PROGRESS.md       Session log — read first every session
│   ├── 01-CONCEPT.md
│   ├── 02-ARCHITECTURE.md
│   ├── 03-TECH-STACK.md
│   └── 04-ROADMAP.md
└── .github/workflows/    CI/CD pipelines
```

---

## Tech stack

| Layer | Choice |
|---|---|
| Frontend | Next.js 15 (App Router, React 19), Tailwind CSS v4 |
| Backend | Fastify, Hono-compatible handlers |
| Database | PostgreSQL 16 via Drizzle ORM |
| Cache | Redis (Upstash free tier) |
| Auth | Better Auth (magic links, Google, Microsoft OAuth) |
| Monorepo | pnpm + Turborepo |
| Lint/Format | Biome |
| Tests | Vitest (unit), Playwright (E2E) |

Full stack documented in [`docs/03-TECH-STACK.md`](docs/03-TECH-STACK.md).

---

## Development rules

All engineering rules live in [`RULES.md`](RULES.md). Every PR must comply.
Key rules:

- TypeScript strict. No `any`. Zod is the type source of truth.
- Every table has `workspace_id`. Multi-tenant from line one.
- Drizzle migrations only — never manual SQL on prod.
- Biome only — no ESLint, no Prettier.
- Conventional Commits enforced in CI.

---

## Phase 0 exit criteria

- [x] `pnpm install && pnpm dev` brings up web + API locally
- [ ] A new user can sign up, verify email, create a workspace, log out, log in *(needs DATABASE_URL configured)*
- [x] `pnpm lint` passes with zero warnings
- [x] `pnpm typecheck` passes
- [x] CI green on a fresh branch
- [ ] Lighthouse mobile ≥ 90 on /sign-in *(verify after first deploy)*
- [ ] Initial JS bundle on /sign-in < 200 KB gzipped *(verify after build)*
- [x] Zero secrets in code (gitleaks clean)

---

## Contributing

See [`RULES.md`](RULES.md). PRs welcome — please link an issue and include
tests. Two approvals required for anything touching `packages/db/` or auth.
