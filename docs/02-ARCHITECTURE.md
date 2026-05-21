# Nexus Workspace — Architecture

## 1. Architectural Principles

1. **Cloud-agnostic by default.** Every service runs in a container. No proprietary cloud primitives in the critical path.
2. **API-first.** The web app is just another client of the public API. Mobile, desktop, and third-party developers use the same endpoints.
3. **Event-driven core.** All state changes emit events. Connectors, automations, audit logs, and search indexing are downstream consumers.
4. **Multi-tenant from day one.** Every row carries a `workspace_id`. Row-level security enforced at the database.
5. **Edge where possible, origin where necessary.** Static assets and read paths at the edge (Cloudflare). Writes and realtime through regional origins.
6. **Boring tech in the core, novel tech at the edges.** Postgres in the middle; CRDTs and AI inference at the edges.

---

## 2. High-Level System Diagram

```
┌─────────────────────────────────────────────────────────────────────────┐
│                              CLIENTS                                     │
│  Web (Next.js)  •  Desktop (Tauri)  •  Mobile (React Native)  •  CLI    │
└──────────────────────────┬──────────────────────────────────────────────┘
                           │ HTTPS / WSS
┌──────────────────────────▼──────────────────────────────────────────────┐
│                    EDGE LAYER  (Cloudflare)                              │
│  CDN  •  WAF  •  Rate limiting  •  Auth token validation                │
└──────────────────────────┬──────────────────────────────────────────────┘
                           │
┌──────────────────────────▼──────────────────────────────────────────────┐
│                    API GATEWAY  (Hono on Cloudflare Workers / Node)     │
│  Routing  •  Auth  •  Tenant resolution  •  Request shaping             │
└─────┬──────────┬──────────┬──────────┬──────────┬──────────┬────────────┘
      │          │          │          │          │          │
┌─────▼────┐ ┌──▼─────┐ ┌──▼─────┐ ┌──▼─────┐ ┌──▼─────┐ ┌──▼─────────┐
│ Identity │ │ Convo  │ │ Docs   │ │ Tasks  │ │ Meet   │ │ Connector  │
│ Service  │ │Service │ │Service │ │Service │ │Service │ │  Fabric    │
│ (SCIM,   │ │(chat,  │ │(blocks,│ │(work   │ │(WebRTC │ │ (OAuth +   │
│  SSO)    │ │ threads)│ │ CRDT)  │ │  items)│ │  SFU)  │ │  webhooks) │
└─────┬────┘ └──┬─────┘ └──┬─────┘ └──┬─────┘ └──┬─────┘ └──┬─────────┘
      │          │          │          │          │          │
      └──────────┴──────────┴──────────┴──────────┴──────────┘
                           │
        ┌──────────────────┼──────────────────┐
        │                  │                  │
┌───────▼────────┐ ┌───────▼────────┐ ┌──────▼─────────┐
│   Postgres     │ │   Redis        │ │   Object       │
│  (Supabase /   │ │  (Upstash /    │ │   Storage      │
│   RDS / Neon)  │ │   ElastiCache) │ │  (R2 / S3)     │
│                │ │                │ │                │
│ • Tenant data  │ │ • Sessions     │ │ • Files        │
│ • RLS          │ │ • Pub/Sub      │ │ • Recordings   │
│ • pgvector     │ │ • Rate limit   │ │ • Backups      │
└────────────────┘ └────────────────┘ └────────────────┘
                           │
┌──────────────────────────▼──────────────────────────────────────────────┐
│                    EVENT BUS  (NATS JetStream / Kafka at scale)         │
│  Every state change → event → fan-out to consumers                      │
└─────┬──────────┬──────────┬──────────┬──────────────────────────────────┘
      │          │          │          │
┌─────▼────┐ ┌──▼─────┐ ┌──▼─────┐ ┌──▼──────────┐
│ Search   │ │ Audit  │ │ AI     │ │ Connector   │
│ Indexer  │ │ Logger │ │ Worker │ │ Sync Worker │
│(Typesense│ │        │ │(summary│ │ (M365, GWS, │
│ /Meili)  │ │        │ │ embed) │ │  Jira, ...) │
└──────────┘ └────────┘ └────────┘ └─────────────┘
```

---

## 3. Service Breakdown

### 3.1 Identity Service
Owns users, workspaces, teams, roles, permissions.
- **Auth:** Email/password + magic links + OAuth (Google, Microsoft, GitHub, SAML/OIDC for enterprise)
- **SSO:** SAML 2.0 and OIDC for Business+ tiers
- **SCIM 2.0:** Auto-provisioning from Okta/Azure AD/Workday
- **MFA:** TOTP, WebAuthn (passkeys), backup codes
- **RBAC:** Workspace → Team → Channel/Project → Resource. Permissions are additive and cached in Redis.

### 3.2 Conversations Service
- Channels (public, private, DM, group DM)
- Messages stored in Postgres, hot messages cached in Redis
- Realtime via WebSockets, fallback to Server-Sent Events
- Threads as nested message lists with their own read state
- Reactions, pinned messages, scheduled messages

### 3.3 Docs Service
- Block-based document model (Notion-like)
- CRDT (Yjs) for real-time co-editing; Y-server runs as a sidecar
- Snapshots persisted to Postgres every 30s; full Yjs doc state in object storage
- Embeds resolved server-side: a "Jira block" calls the Connector Fabric to fetch live data

### 3.4 Tasks Service
- Tasks, projects, sprints, OKRs
- Views: list, kanban, timeline (Gantt), calendar, dashboard
- Automation engine: trigger → condition → action (no-code rules)
- Dependencies stored as DAG; circular detection at write time

### 3.5 Meet Service
- WebRTC for 1:1 and small groups (P2P)
- SFU (mediasoup) for 5+ participants
- Recording to object storage; transcription via Whisper (self-hosted or OpenAI API)
- Action items extracted by LLM, posted as tasks via Tasks Service

### 3.6 Connector Fabric (the differentiator)
- **OAuth broker:** stores tokens encrypted (AES-256, KMS-managed key)
- **Connector SDK:** TypeScript interface every connector implements
  ```ts
  interface Connector {
    id: string                    // 'microsoft-365'
    auth: 'oauth2' | 'apikey' | 'webhook'
    triggers: TriggerDef[]        // events we listen for
    actions: ActionDef[]          // operations we can perform
    blocks: BlockDef[]            // UI blocks we can render
    sync: (ctx: SyncContext) => Promise<void>
  }
  ```
- **Webhook gateway:** verified signatures, replay protection, dead-letter queue
- **Polling fallback** for tools without webhooks
- **Per-tenant rate limit pools** so one noisy customer can't exhaust shared connector quotas

### 3.7 Search & AI
- **Search:** Typesense (free, self-hostable) for full-text + faceted; Meilisearch as alternative
- **Vector search:** pgvector in Postgres for semantic search and RAG
- **AI worker:** background jobs for summaries, action item extraction, smart replies. Model-agnostic (Claude, GPT, local Llama via Ollama)

---

## 4. Data Model (essential entities)

```
workspace ─┬─ user (via membership)
           ├─ team
           ├─ channel ── message ── reaction
           │                    └── attachment
           ├─ page  ── block (recursive)
           ├─ project ── task ── subtask
           │                 └── comment
           ├─ meeting ── recording
           │          └── transcript_segment
           └─ connector_instance ── oauth_token (encrypted)
                                 └── sync_state
```

**Multi-tenancy:** every table has `workspace_id` with a Postgres Row-Level Security policy:
```sql
CREATE POLICY tenant_isolation ON messages
  USING (workspace_id = current_setting('app.workspace_id')::uuid);
```

---

## 5. Realtime Architecture

| Concern | Mechanism |
|---|---|
| Chat messages | WebSocket, sticky session per user |
| Document co-edit | Yjs over WebSocket via y-websocket server |
| Presence (online dots) | Redis pub/sub, 30s heartbeat |
| Notifications | WebSocket + push (FCM for mobile, Web Push for browser) |
| Voice/video | WebRTC, mediasoup SFU |

---

## 6. Deployment Architecture — Three Stages

### Stage 1: Free Tier (0–500 users) — €0/month
| Component | Service | Free limit |
|---|---|---|
| Frontend | Vercel (or Cloudflare Pages) | 100GB bandwidth |
| API | Vercel Functions / Cloudflare Workers | 100k requests/day |
| Database | Supabase (Postgres + Auth + Realtime + Storage) | 500MB DB, 1GB storage |
| Cache | Upstash Redis | 10k requests/day |
| Object storage | Cloudflare R2 | 10GB free |
| Search | Typesense Cloud free, or self-hosted on Fly.io | — |
| Email | Resend | 3,000 emails/month |
| Monitoring | Sentry, Better Stack | Free tiers |

**Goal:** validate product with early users, zero infra cost.

### Stage 2: Growth (500–5,000 users) — €200–€2,000/month
- Move API to dedicated Node containers on Fly.io or Railway (~€50/region)
- Postgres → Supabase Pro or Neon scaled, with read replicas
- Add SFU server for video on dedicated VM
- CDN + WAF on Cloudflare paid plan
- Dedicated search cluster (Typesense self-hosted on 2–3 nodes)

### Stage 3: Enterprise (5,000+ users) — cloud of choice
- **Kubernetes (EKS / AKS / GKE)** for all services
- **Managed Postgres** (Aurora, Azure DB, Cloud SQL) with PgBouncer
- **Kafka** replaces NATS as the event bus
- **Multi-region** active-passive with async replication
- **Self-hosted option:** the same Helm charts deploy on customer's own cluster (air-gapped option for regulated industries — relevant to aviation/Lufthansa Group)

**The lift-and-shift contract:** because every component is containerized and uses standard protocols (Postgres, S3-compatible storage, OAuth, WebSocket), migrating from Stage 1 → Stage 3 is configuration change, not rewriting.

---

## 7. Security Architecture

| Layer | Controls |
|---|---|
| Network | Cloudflare WAF, DDoS protection, TLS 1.3 everywhere, mTLS service-to-service |
| Identity | MFA required for admins, passkeys preferred, session binding to device fingerprint |
| Data at rest | AES-256 (Postgres TDE + object storage SSE), customer-managed keys for Enterprise |
| Data in transit | TLS 1.3, HSTS, certificate pinning on mobile |
| Application | OWASP ASVS Level 2 baseline, dependency scanning (Snyk), SAST (Semgrep) in CI |
| Tenancy | RLS at DB, tenant ID in every log line, no cross-tenant queries possible |
| Audit | Every write emits an immutable audit event; retained 7 years for Enterprise |
| Compliance roadmap | SOC 2 Type II (Year 1), ISO 27001 (Year 2), GDPR (day 1), HIPAA-ready, EU data residency |

---

## 8. Observability

- **Logs:** structured JSON, shipped to Better Stack (free) or Datadog/Grafana Loki at scale
- **Metrics:** Prometheus + Grafana; SLOs per service (e.g., chat send p99 < 200ms)
- **Traces:** OpenTelemetry, sent to Tempo or Honeycomb
- **Errors:** Sentry
- **Synthetic monitoring:** Checkly probes critical user journeys every 5 min

---

## 9. The Connector Fabric — How Integrations Actually Work

This is worth its own deep-dive because it's the moat.

**Example: Microsoft 365 connector**

1. Admin clicks "Connect M365" in workspace settings.
2. OAuth flow → tokens encrypted and stored in `oauth_token` table.
3. Connector registers webhooks with Microsoft Graph for mail, calendar, files.
4. Initial sync job pulls last 30 days of relevant data, normalizes to Nexus schema.
5. Subsequent webhooks update incrementally; failures retried with exponential backoff.
6. Inside Nexus:
   - User's Outlook inbox appears as a section in the unified inbox.
   - SharePoint files browsable in the file picker.
   - Slash command `/teams` joins a Teams meeting from any Nexus surface.
   - A "SharePoint file" block in a Nexus doc renders the file with live preview.

The same pattern repeats for every connector. **One contract, N implementations.** The cost of adding a new SaaS integration is roughly one engineer-week.

---

## 10. Why This Architecture Beats Building "Yet Another Teams"

| Decision | Why it matters |
|---|---|
| Connector Fabric as a first-class subsystem | Enterprises don't replace their stack; they wrap it. Nexus wraps. |
| CRDT-based docs | True real-time, offline-first, no merge conflicts. Same tech Linear and Figma use. |
| Event-driven core | Audit, search, AI, and connectors all consume the same events. No bolt-on integrations. |
| Multi-tenant with RLS from day 1 | Selling to a second customer is a config change, not a re-architecture. |
| Self-host option | Regulated industries (aviation, finance, defense) cannot use pure-SaaS. This unlocks the LHIND/Lufthansa-style buyer. |
| Cloud-agnostic | No "we're stuck on AWS" conversation in year three. |
