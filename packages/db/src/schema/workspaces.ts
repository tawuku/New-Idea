import { index, pgEnum, pgTable, text, timestamp, uuid } from "drizzle-orm/pg-core";
import { users } from "./users.js";

export const workspacePlanEnum = pgEnum("workspace_plan", [
  "solo",
  "team",
  "business",
  "enterprise",
]);

export const workspaces = pgTable(
  "workspaces",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    name: text("name").notNull(),
    slug: text("slug").notNull().unique(),
    logoUrl: text("logo_url"),
    plan: workspacePlanEnum("plan").notNull().default("solo"),
    deletedAt: timestamp("deleted_at", { withTimezone: true }),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
    updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (t) => [index("workspaces_slug_idx").on(t.slug)],
);

export const memberRoleEnum = pgEnum("member_role", ["owner", "admin", "member", "guest"]);

export const workspaceMembers = pgTable(
  "workspace_members",
  {
    workspaceId: uuid("workspace_id")
      .notNull()
      .references(() => workspaces.id, { onDelete: "cascade" }),
    userId: uuid("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    role: memberRoleEnum("role").notNull().default("member"),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (t) => [
    index("workspace_members_workspace_idx").on(t.workspaceId),
    index("workspace_members_user_idx").on(t.userId),
  ],
);

export type DbWorkspace = typeof workspaces.$inferSelect;
export type DbNewWorkspace = typeof workspaces.$inferInsert;
export type DbWorkspaceMember = typeof workspaceMembers.$inferSelect;
