import { index, jsonb, pgTable, text, timestamp, uuid } from "drizzle-orm/pg-core";
import { users } from "./users.js";
import { workspaces } from "./workspaces.js";

export const auditEvents = pgTable(
  "audit_events",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    workspaceId: uuid("workspace_id").references(() => workspaces.id, {
      onDelete: "set null",
    }),
    actorId: uuid("actor_id").references(() => users.id, { onDelete: "set null" }),
    type: text("type").notNull(),
    payload: jsonb("payload").notNull().default({}),
    ipAddress: text("ip_address"),
    userAgent: text("user_agent"),
    traceId: text("trace_id"),
    occurredAt: timestamp("occurred_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (t) => [
    index("audit_events_workspace_idx").on(t.workspaceId),
    index("audit_events_actor_idx").on(t.actorId),
    index("audit_events_type_idx").on(t.type),
    index("audit_events_occurred_idx").on(t.occurredAt),
  ],
);

export type DbAuditEvent = typeof auditEvents.$inferSelect;
export type DbNewAuditEvent = typeof auditEvents.$inferInsert;
