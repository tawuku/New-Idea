# Nexus Workspace — Tech Stack

> **Selection criteria:** (1) Free tier exists. (2) Open-source or open standards. (3) Battle-tested at scale. (4) Cloud-portable.

## 1. Frontend

| Layer | Choice | Why |
|---|---|---|
| **Framework** | Next.js 15 (App Router, React 19) | SSR + edge runtime, huge talent pool, Vercel free tier |
| **Language** | TypeScript (strict) | Type safety across full stack |
| **Styling** | Tailwind CSS 4 + CSS variables | Fast, design-token-friendly, no runtime cost |
| **Components** | shadcn/ui + Radix primitives | Accessible, ownable, no vendor lock-in |
| **Icons** | Lucide React | Clean, consistent, free |
| **Animation** | Framer Motion — *used sparingly* | Per your spec: minimal motion |
| **State (client)** | Zustand + TanStack Query | Lightweight, no Redux ceremony |
| **Forms** | React Hook Form + Zod | Type-safe validation end-to-end |
| **Editor** | Tiptap (built on ProseMirror) + Yjs | Block-based, real-time, extensible |
| **Tables/Grids** | TanStack Table | Headless, fast, virtualized |
| **Charts** | Recharts (simple) / Visx (advanced) | Composable, performant |
| **Realtime client** | Native WebSocket + reconnection wrapper | No vendor SDK lock-in |

### Desktop & Mobile
- **Desktop:** Tauri 2 (Rust shell + web frontend). 10× lighter than Electron.
- **Mobile:** React Native + Expo. Share ~80% of business logic with web.

---

## 2. Backend

| Layer | Choice | Why |
|---|---|---|
| **Runtime** | Node.js 22 LTS (some Workers on Bun for cold-start perf) | Mature, vast ecosystem |
| **Framework** | Hono (edge-compatible) + Fastify (origin) | Fast, small, runs on Workers AND Node |
| **Language** | TypeScript (strict, shared types with frontend) | One language, one type system |
| **ORM** | Drizzle ORM | SQL-first, type-safe, no runtime overhead. Beats Prisma at scale. |
| **Validation** | Zod (shared schemas with frontend) | Single source of truth for types |
| **Auth** | Better Auth (or Lucia) + custom session layer | Self-hostable, no Auth0 bill |
| **Realtime server** | Socket.IO or native ws + Redis adapter | Horizontal scaling out of the box |
| **CRDT server** | y-websocket + Hocuspocus | Production-grade Yjs sync |
| **Background jobs** | BullMQ on Redis | Reliable, observable, simple |
| **Event bus** | NATS JetStream (start) → Kafka (scale) | Free, lightweight, replaces Kafka until you need it |
| **API spec** | OpenAPI 3.1 generated from Zod | Auto-generated docs and SDKs |

---

## 3. Data

| Layer | Choice | Why |
|---|---|---|
| **Primary DB** | PostgreSQL 16 (Supabase free → Neon → RDS) | The boring, correct choice. RLS, pgvector, JSONB. |
| **Cache** | Redis (Upstash free → ElastiCache) | Sessions, pub/sub, rate limiting, BullMQ |
| **Search** | Typesense (free, self-hostable) | Faster than Elasticsearch, 1/10th the ops |
| **Vector search** | pgvector inside Postgres | One database, not two |
| **Object storage** | Cloudflare R2 (free egress) → S3-compatible anywhere | No egress fees vs S3 |
| **Time-series** | TimescaleDB extension on Postgres (later) | Analytics without a second DB |
| **Migrations** | Drizzle Kit | Version-controlled, reviewable |

---

## 4. Infrastructure & Deployment

### Stage 1 — Free (today)
| Concern | Service |
|---|---|
| Frontend hosting | Vercel or Cloudflare Pages |
| API hosting | Vercel Functions / Cloudflare Workers |
| Database | Supabase free tier |
| Redis | Upstash free tier |
| Storage | Cloudflare R2 free tier |
| Email | Resend (3k/month free) |
| Domain & DNS | Cloudflare |
| CI/CD | GitHub Actions (2,000 min/month free) |
| Monitoring | Sentry + Better Stack free tiers |
| Secrets | Doppler free tier or GitHub Encrypted Secrets |

### Stage 2 — Growth
- Containerize everything with Docker.
- Move stateful services (Postgres, Redis, NATS) to managed providers; stateless services to Fly.io or Railway.
- Add a small Hetzner VPS (€5–€20/month) for the SFU and self-hosted Typesense.

### Stage 3 — Enterprise
- **Orchestration:** Kubernetes (EKS, AKS, GKE, or vanilla on Hetzner Cloud)
- **IaC:** Terraform or Pulumi
- **Service mesh:** Linkerd (simpler than Istio)
- **Ingress:** Cloudflare → NGINX Ingress
- **Database:** Aurora PostgreSQL or Azure Database for PostgreSQL with PgBouncer
- **Event bus:** Confluent Kafka or Redpanda (Kafka-compatible)

**Why Kubernetes from Stage 3 only:** running K8s on day one is a tax most early-stage projects can't afford. The architecture is K8s-*ready* from day one (everything containerized, 12-factor); you adopt it when scale demands it.

---

## 5. AI & ML

| Use case | Choice |
|---|---|
| Chat summaries, action item extraction | Claude (Anthropic API) by default; pluggable via abstraction layer |
| Embeddings for semantic search | OpenAI `text-embedding-3-small` or `bge-large` (self-hosted) |
| Transcription | OpenAI Whisper API → self-hosted Whisper later |
| Local fallback | Ollama (Llama 3.3, Qwen 2.5) for air-gapped enterprise |

All AI calls go through a single **AI gateway service** so model providers are swappable without changing application code.

---

## 6. Connector SDK (the moat — worth a separate package)

Published as `@nexus/connector-sdk`. A new integration is one file:

```ts
// connectors/microsoft-365/index.ts
import { defineConnector } from '@nexus/connector-sdk'

export default defineConnector({
  id: 'microsoft-365',
  name: 'Microsoft 365',
  auth: { type: 'oauth2', scopes: ['Mail.Read', 'Files.Read.All'] },
  triggers: [
    { id: 'mail.received', webhook: '/graph/mail' },
  ],
  actions: [
    { id: 'send-mail', schema: SendMailSchema, run: sendMail },
  ],
  blocks: [
    { id: 'sharepoint-file', render: renderSharePointFile },
  ],
})
```

The SDK handles OAuth, token refresh, webhook verification, rate limiting, and retries. **You write the business logic, the SDK handles the plumbing.**

---

## 7. Developer Experience

| Tool | Purpose |
|---|---|
| **pnpm + Turborepo** | Monorepo, fast installs, cached builds |
| **Biome** | Linter + formatter (replaces ESLint + Prettier, 10× faster) |
| **Vitest** | Unit tests |
| **Playwright** | E2E tests |
| **Storybook** | Component dev sandbox |
| **Mintlify or Nextra** | Docs site |
| **Linear or Plane (self-hosted)** | Dogfood your own product once Tasks ships |

---

## 8. The Repo Shape

```
nexus-workspace/
├── apps/
│   ├── web/              # Next.js
│   ├── desktop/          # Tauri shell
│   ├── mobile/           # React Native
│   ├── api/              # Main API (Node + Fastify)
│   ├── realtime/         # WebSocket gateway
│   ├── connector-worker/ # Background sync workers
│   └── ai-gateway/       # LLM proxy
├── packages/
│   ├── ui/               # shadcn components, design tokens
│   ├── db/               # Drizzle schema + migrations
│   ├── schemas/          # Zod schemas shared across stack
│   ├── connector-sdk/    # The integration framework
│   └── connectors/       # Individual connector packages
│       ├── microsoft-365/
│       ├── google-workspace/
│       ├── jira/
│       ├── slack/
│       ├── github/
│       ├── salesforce/
│       └── sap/
├── infra/
│   ├── terraform/        # Cloud resources
│   ├── helm/             # K8s charts
│   └── docker/           # Dockerfiles
├── docs/                 # Mintlify docs site
└── .github/workflows/    # CI/CD
```

---

## 9. What I'd *Not* Use (and why)

| Tempting choice | Why I skip it |
|---|---|
| Firebase | Vendor lock-in, expensive at scale, poor SQL story |
| MongoDB | You need relations; Postgres JSONB covers your doc-store needs |
| Electron | 3× the RAM of Tauri for identical UX |
| Prisma | Slower than Drizzle, generates heavy client at scale |
| AWS Amplify | Beautiful demo, painful migration |
| GraphQL (at the start) | REST + OpenAPI gets you to v1 faster; revisit if clients demand it |
| Microservices on day 1 | Modular monolith first. Split out only when ownership boundaries demand it. |
