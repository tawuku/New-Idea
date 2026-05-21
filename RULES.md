# Nexus Workspace — Engineering Rules

> This file is the project's constitution. Every PR, every AI-generated change, every contractor's first task is governed by these rules. Place at the repo root as `RULES.md` and reference from `.cursorrules`, `CLAUDE.md`, and `CONTRIBUTING.md`.

---

## §1 — The North Star

1. **Calm software.** Default to less motion, less color, less noise. If you're tempted to add a notification badge, ask whether it earns its weight.
2. **Speed is a feature.** p99 interactive latency under 200ms for any action a user takes 10+ times a day.
3. **Boring tech in the core.** Reach for novelty only at the edges (AI, CRDTs, edge runtime). Postgres, Redis, Node, TypeScript do the heavy lifting.
4. **Multi-tenant from line one.** There is no "single-tenant mode." Every query has `workspace_id`.
5. **Vendor-portable always.** If you can't run it on three clouds with a config flip, don't ship it.

---

## §2 — Code Style

### 2.1 Language
- **TypeScript strict mode** is mandatory. No `any`, no `@ts-ignore` without a linked issue.
- **Zod schemas are the source of truth.** Types are derived: `type User = z.infer<typeof UserSchema>`.
- **Functions over classes** unless state genuinely belongs together.
- **Async/await over `.then()`.** No callback chains.
- **No default exports** except for Next.js page/layout files that require them.

### 2.2 Formatting & Linting
- **Biome** is the linter and formatter. Config lives in `biome.json`.
- **No ESLint, no Prettier.** Don't add them back.
- **Pre-commit hook** runs `biome check --apply`.

### 2.3 Naming
- Files: `kebab-case.ts`
- Variables and functions: `camelCase`
- Types and components: `PascalCase`
- Constants: `SCREAMING_SNAKE_CASE`
- DB tables: `snake_case`, plural (`messages`, not `Message`)
- API routes: `kebab-case` (`/api/workspace-members`)

### 2.4 File Size
- Soft cap: 300 lines per file. Hard cap: 500. Split before you hit it.

---

## §3 — Architecture Rules

### 3.1 Layering
```
┌─────────────────────────────────────────────┐
│ Presentation (React components, API routes) │
├─────────────────────────────────────────────┤
│ Application (use cases, orchestration)      │
├─────────────────────────────────────────────┤
│ Domain (business logic, pure functions)     │
├─────────────────────────────────────────────┤
│ Infrastructure (DB, cache, external APIs)   │
└─────────────────────────────────────────────┘
```
- Lower layers **never** import from upper layers.
- Domain logic is pure: no DB, no HTTP, no `process.env`.
- Infrastructure is hidden behind interfaces. Tests swap in fakes.

### 3.2 No God Modules
- A package or service that touches more than 3 domains is split.
- Cross-domain communication happens via events on the bus, not direct imports.

### 3.3 Event-Driven First
- Every write operation emits a domain event (`message.created`, `task.completed`, etc.).
- Consumers (audit, search, AI, connectors) subscribe; they do not call producer code directly.
- Event schemas are versioned and live in `packages/schemas/events`.

### 3.4 Database
- All schema changes go through Drizzle migrations. No manual SQL on prod.
- Every table has: `id` (uuid), `workspace_id` (uuid, except global tables), `created_at`, `updated_at`.
- Soft delete via `deleted_at`. Hard delete only via scheduled GDPR jobs.
- Every multi-tenant table has an RLS policy. Tests verify it.
- Indexes are added in the same PR as the query that needs them.

### 3.5 API Design
- REST + OpenAPI 3.1. No GraphQL until a paying customer demands it.
- Versioning: `/api/v1/...`. Breaking changes get a new version.
- Pagination: cursor-based, never offset.
- Errors: RFC 7807 (problem+json). One shape, everywhere.
- All endpoints validated with Zod on input *and* output.

---

## §4 — Security Rules (non-negotiable)

1. **Secrets never in code.** Use Doppler / GitHub secrets / KMS. CI fails the build if a secret pattern is detected (gitleaks in pre-commit).
2. **All input validated with Zod** at the boundary. Trust nothing from the network.
3. **Parameterized queries only.** Drizzle handles this; raw SQL goes through `sql` template tag.
4. **RLS or bust.** New tenant tables ship with an RLS policy in the same migration.
5. **AuthN ≠ AuthZ.** Logged-in is not authorized. Every endpoint checks permissions explicitly via the policy module.
6. **OAuth tokens encrypted at rest** with a KMS-managed key. Never log them, never return them to clients.
7. **Webhook signatures verified** before any processing. Unsigned webhooks are rejected.
8. **Dependency scanning** (Snyk / `npm audit`) runs on every PR. High/critical vulns block merge.
9. **No PII in logs.** Use the structured logger's PII redactor. Log `user_id`, not `email`.
10. **Audit everything that matters.** Sign-ins, permission changes, admin actions, data exports.

---

## §5 — Performance Budgets

| Surface | Budget |
|---|---|
| Initial JS bundle (web) | < 200 KB gzipped |
| Time to Interactive (P75, mid-tier mobile) | < 3.5s |
| API p99 latency (read) | < 150ms |
| API p99 latency (write) | < 300ms |
| Chat message send → broadcast | < 200ms |
| Doc keystroke → remote render | < 100ms |
| Search query result | < 250ms |

Budget regressions are PR-blocking. Lighthouse and k6 run in CI.

---

## §6 — Testing Rules

- **Unit tests** for domain logic. Aim for high coverage where it pays (validation, calculations, permission logic).
- **Integration tests** for API endpoints — hit a real Postgres in CI.
- **E2E tests** for the 10 critical user journeys (sign up, create workspace, send message, create task, etc.).
- **Contract tests** for every connector — replay recorded API responses.
- **No mocks of code you own.** If you're mocking internal modules, the boundaries are wrong.

Coverage is not a target; usefulness is. A 30%-covered codebase with the right tests beats 95% of trivia.

---

## §7 — Git & Workflow

- **Trunk-based development.** Feature branches < 3 days old. No long-lived branches.
- **Conventional Commits.** `feat(chat): add scheduled messages`. CI enforces.
- **PRs are small.** Hard cap: 400 lines changed. If bigger, split.
- **Every PR:** description, linked issue, screenshots/recording for UI, tests, migration notes.
- **One approver minimum**, two for `infra/`, `db/migrations/`, or anything touching auth.
- **Squash merge** to `main`. `main` is always deployable.
- **Feature flags** (via `packages/feature-flags`) for anything risky. No long-lived flags — clean up after rollout.

---

## §8 — AI-Assisted Development Rules

Because Claude and Copilot will write a lot of code here, explicit rules:

1. **AI-generated code is reviewed exactly like human code.** No "Claude wrote it" exception.
2. **Never paste secrets into AI tools.** Use placeholders.
3. **AI must follow this file.** Cursor reads `.cursorrules` (a symlink to this file). Claude Code reads `CLAUDE.md` (also a symlink).
4. **Prefer small, well-scoped prompts.** "Add this one endpoint" beats "build the whole feature."
5. **Verify, don't trust.** Every AI-suggested DB query is run against test data. Every AI-suggested type is checked by `tsc`.

---

## §9 — Connector Rules

Because connectors are the moat, they get their own discipline.

1. **One connector, one package.** No shared state between connectors.
2. **All connectors implement the SDK contract.** No bespoke shapes.
3. **Rate limits respected.** Every connector declares its provider's limits and the SDK enforces them.
4. **Graceful degradation.** If a connector is down, the rest of Nexus works. No connector can take down the app.
5. **Tokens refreshed proactively** (5 min before expiry), not lazily on 401.
6. **Webhook idempotency.** Every webhook handler is idempotent — the same event delivered twice changes nothing.
7. **Documented contract per integration.** What data is read, what's written, what scopes are needed, what happens on disconnect.

---

## §10 — Observability Rules

1. **Structured logs only.** JSON, with `trace_id`, `workspace_id`, `user_id`.
2. **Every request gets a trace.** OpenTelemetry, propagated through async boundaries.
3. **SLOs are defined per service** in `infra/slos.yaml`. Burn rate alerts page the on-call.
4. **Dashboards are code.** Grafana JSON committed to repo.
5. **Errors have owners.** Sentry projects have a `CODEOWNERS`-style routing.

---

## §11 — Documentation Rules

1. **Every package has a README** with: purpose, install, usage, key types, gotchas.
2. **Every public function has a JSDoc** when its name doesn't fully explain it.
3. **ADRs** (Architecture Decision Records) for any choice with reversal cost > 1 week. Stored in `/docs/adr/NNNN-title.md`.
4. **Runbooks** for every alert. If a page can fire, there's a doc telling the responder what to do.

---

## §12 — Definition of Done

A task is done when:
- [ ] Code merged to `main`
- [ ] Tests added and passing
- [ ] Types check, lint passes, build succeeds
- [ ] Docs updated (README, API spec, ADR if applicable)
- [ ] Telemetry added (logs, metrics, traces)
- [ ] Feature flag set up if user-facing
- [ ] Deployed to staging, verified by author
- [ ] Linked PR closes the ticket

---

## §13 — Cultural Rules

1. **Disagree, then commit.** Argue in PRs and design docs. Once merged, the call is final until evidence changes it.
2. **No heroics.** Sustainable pace. On-call rotations honored.
3. **Customer pain > internal taste.** When in doubt, ship the thing the customer needs.
4. **Write it down.** If a decision lives in someone's head, it doesn't exist.
5. **Be kind in reviews.** Critique the code, never the person.

---

*This file is versioned. Propose changes via PR. Don't violate it; change it.*
