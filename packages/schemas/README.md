# @nexus/schemas

Shared Zod schemas for the Nexus Workspace monorepo.

## Principle

Types are **derived** from schemas, never the other way around:

```ts
import { WorkspaceSchema } from "@nexus/schemas/workspace";
type Workspace = z.infer<typeof WorkspaceSchema>;
```

## Modules

- `./auth` — Sign-up, sign-in, session schemas
- `./user` — User CRUD schemas
- `./workspace` — Workspace + member schemas
- `./events` — Versioned domain event schemas (used by the event bus)

## Adding a schema

1. Add the Zod schema in the appropriate module.
2. Export the inferred type alongside it.
3. If it represents a domain event, add it to `DomainEventSchema` discriminated union.
