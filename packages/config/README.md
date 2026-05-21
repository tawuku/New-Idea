# @nexus/config

Shared configuration for the Nexus Workspace monorepo.

## Exports

- `./tsconfig` — Base TypeScript config extended by all packages
- `./tsconfig-next` — TypeScript config for Next.js apps
- `./env` — Type-safe environment variable parsing with Zod

## Usage

```ts
import { parseServerEnv } from "@nexus/config/env";
const env = parseServerEnv();
```

## Key design decisions

- All env vars are validated at startup. Invalid config throws immediately, not at runtime.
- Client-side vars are prefixed `NEXT_PUBLIC_` and validated separately.
- No default exports — re-exported from package.json `exports` map.
