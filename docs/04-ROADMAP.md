# Nexus Workspace — Phased Roadmap

> **Strategy:** Ship a usable v0 in 12 weeks at €0 infrastructure cost. Add depth, then scale.

---

## Phase 0 — Foundation (Weeks 1–2)
**Goal:** Repo set up, infra wired, first deploy live.

- [ ] Monorepo skeleton (pnpm + Turborepo)
- [ ] Next.js web app, basic shell
- [ ] Hono/Fastify API service
- [ ] Postgres on Supabase free tier with first migrations (users, workspaces)
- [ ] Auth (Better Auth) with email magic links + Google OAuth
- [ ] CI: lint, test, typecheck, build on every PR
- [ ] CD: auto-deploy to Vercel + Supabase on merge to `main`
- [ ] Sentry + Better Stack hooked up
- [ ] Design system: tokens, base components, typography, dark/light parity

**Exit criteria:** A user can sign up, create a workspace, and log in. Zero cost.

---

## Phase 1 — Conversations MVP (Weeks 3–6)
**Goal:** Slack-replacement-grade chat for one workspace.

- [ ] Channels (public/private), DMs, group DMs
- [ ] Message send/edit/delete, reactions, mentions
- [ ] Threads with separate read state
- [ ] Real-time via WebSockets (Socket.IO + Redis adapter)
- [ ] File uploads to R2
- [ ] Search (Typesense) over messages
- [ ] Notifications (in-app + email digest for offline users)
- [ ] Mobile-responsive web (mobile app deferred)

**Exit criteria:** A 50-person team could use it as their primary chat tool. Invite 10 friendly testers.

---

## Phase 2 — Workspaces (Docs) (Weeks 7–9)
**Goal:** Notion-grade collaborative docs.

- [ ] Block-based editor (Tiptap)
- [ ] Real-time co-editing (Yjs + Hocuspocus)
- [ ] Page hierarchy, breadcrumbs, sidebar tree
- [ ] Comments and mentions inside docs
- [ ] Embeds (YouTube, Figma, Loom) via Iframely
- [ ] Page-level permissions
- [ ] Search over doc content

**Exit criteria:** Docs feel as good as Notion for 80% of use cases.

---

## Phase 3 — Work (Tasks) (Weeks 10–12)
**Goal:** Linear-grade task management.

- [ ] Projects, tasks, subtasks, dependencies
- [ ] Views: list, kanban, calendar
- [ ] Custom fields, labels, priorities
- [ ] Assignments, due dates, status
- [ ] Slash command `/task` from anywhere in chat or docs
- [ ] Basic automations: when X → do Y

**Exit criteria:** Internal team uses it for their own roadmap.

---

## Phase 4 — Connector Fabric v1 (Weeks 13–18)
**Goal:** Three flagship connectors live, SDK published.

- [ ] Connector SDK package and docs
- [ ] OAuth broker with token encryption
- [ ] Webhook gateway with signature verification
- [ ] **Microsoft 365** connector (mail, files, calendar)
- [ ] **Google Workspace** connector (Gmail, Drive, Calendar)
- [ ] **GitHub** connector (PRs, issues, mentions)
- [ ] Unified inbox UI pulling from all connectors

**Exit criteria:** A user can connect M365, see mail in Nexus inbox, embed a SharePoint file in a doc.

---

## Phase 5 — Meet (Weeks 19–22)
**Goal:** Internal video calls + AI summaries.

- [ ] 1:1 WebRTC video and screen share
- [ ] Multi-party via mediasoup SFU
- [ ] Recording to R2
- [ ] Whisper transcription
- [ ] AI action item extraction → posts to Tasks

**Exit criteria:** Replace Zoom for internal meetings.

---

## Phase 6 — Enterprise Readiness (Weeks 23–30)
**Goal:** Sell to a 500-person org.

- [ ] SSO (SAML 2.0, OIDC)
- [ ] SCIM provisioning
- [ ] Audit logs UI + export
- [ ] Admin console (users, teams, billing, retention)
- [ ] Data residency selection (EU, US)
- [ ] SOC 2 Type I audit kickoff
- [ ] Connectors: Jira, Confluence, Slack, Salesforce
- [ ] Mobile apps (React Native + Expo)
- [ ] Desktop app (Tauri)

**Exit criteria:** Win a paid pilot with one mid-market customer.

---

## Phase 7 — Scale & Specialize (Months 8–12)
**Goal:** 5,000+ user deployments, self-hosted option.

- [ ] Helm charts for self-hosted deployments
- [ ] Kubernetes-native infra; multi-region active-passive
- [ ] Kafka replaces NATS for event bus
- [ ] Connectors: SAP, Workday, HubSpot, GitLab
- [ ] AI features: smart search, meeting summaries, doc Q&A (RAG)
- [ ] SOC 2 Type II audit complete
- [ ] ISO 27001 audit kickoff
- [ ] **LHIND-style enterprise pilot** with aviation-grade requirements (air-gapped option)

**Exit criteria:** One enterprise (>2,500 users) deployed and renewed.

---

## What Stays Out Of Scope (deliberately)

| Tempting | Why we say no (for now) |
|---|---|
| GraphQL API | REST + OpenAPI is enough until a partner demands it |
| Public app marketplace | Until 10+ connectors are excellent, opening to third parties dilutes quality |
| Mobile-first launch | Web is where work happens; mobile catches up after Phase 6 |
| LLM-generated UI | UI quality matters too much to delegate to an LLM at launch |
| Crypto / Web3 | Not your customer |

---

## Cost Curve

| Stage | Users | Monthly infra cost |
|---|---|---|
| Phase 0–4 | 0–500 | **€0** (all free tiers) |
| Phase 5–6 | 500–5,000 | **€200–€2,000** (managed services, dedicated SFU) |
| Phase 7 | 5,000+ | **€5,000–€20,000+** (depends on cloud, region count, self-host vs SaaS) |
