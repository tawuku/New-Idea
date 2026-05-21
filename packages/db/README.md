# @nexus/db

Drizzle ORM schema and migrations for Nexus Workspace.

## Tables

| Table | Purpose |
|---|---|
| `users` | User accounts (global — no `workspace_id`) |
| `workspaces` | Tenant workspaces |
| `workspace_members` | User → workspace membership with role |
| `sessions` | Auth sessions (managed by Better Auth) |
| `accounts` | OAuth provider accounts (managed by Better Auth) |
| `verifications` | Magic link / OTP tokens |
| `audit_events` | Immutable audit log |

## Commands

```bash
pnpm db:generate   # generate migrations from schema changes
pnpm db:migrate    # apply migrations to DATABASE_URL
pnpm db:seed       # seed local dev database
pnpm db:studio     # open Drizzle Studio
```

## Key rules (from RULES.md §3.4)

- All schema changes go through Drizzle migrations — no manual SQL on prod.
- Every table has `id` (uuid), `created_at`, `updated_at`.
- Soft delete via `deleted_at` on `users` and `workspaces`.
- RLS policies live in the initial migration alongside the tables.
