# ADR 0001 — Monorepo tooling: pnpm + Turborepo + Biome

**Date:** 2026-05-21
**Status:** Accepted
**Deciders:** Lead engineer

---

## Context

Nexus Workspace is a multi-app product (web, API, desktop, mobile) sharing
types, schemas, DB access, and UI components. We need:

1. A monorepo tool that can cache builds and parallelize tasks.
2. A package manager with first-class workspace support and disk efficiency.
3. A linter/formatter that doesn't require two separate tools (ESLint + Prettier).

---

## Decision

| Layer | Choice | Rejected alternatives |
|---|---|---|
| Package manager | **pnpm** | npm workspaces (no caching), Yarn Berry (complex) |
| Build orchestrator | **Turborepo** | Nx (heavier), Lerna (legacy), Bazel (overkill) |
| Linter + formatter | **Biome** | ESLint + Prettier (two tools, slower, config sprawl) |

---

## Rationale

### pnpm
- Symlink-based `node_modules` uses ~50% less disk than npm.
- Workspace protocol (`workspace:*`) is simpler than Yarn's `portal:`.
- `pnpm-lock.yaml` is deterministic and auditable.

### Turborepo
- Remote caching means CI never rebuilds unchanged packages.
- `turbo.json` task graph is one file, not spread across packages.
- Incremental builds make `pnpm dev` instant after first run.
- Maintained by Vercel, aligns with our Vercel hosting choice.

### Biome
- Single binary: lints and formats in one pass, ~10× faster than ESLint + Prettier.
- TypeScript-aware out of the box.
- Opinionated defaults mean zero config debate.
- Replaces both tools; `biome.json` is the single source of truth.

---

## Consequences

- **Positive:** Fast installs, fast CI, no ESLint/Prettier version conflicts.
- **Positive:** One pre-commit hook (`biome check --write`) instead of two.
- **Negative:** Biome rule coverage is ~85% of ESLint's plugin ecosystem. Some
  niche rules (e.g., react-hooks exhaustive-deps edge cases) require manual
  review. Acceptable at this scale; revisit at Phase 6.
- **Negative:** Turborepo remote cache requires a secret (`TURBO_TOKEN`). We
  skip remote caching in development; it's a net zero for local dev.

---

## Reversal cost

**High** — changing the package manager mid-project requires re-generating the
lock file and updating all CI pipelines. Biome is lower risk (swap back to
ESLint in a single PR). Decision is effectively permanent for pnpm; revisit
Biome at 6-month mark.
