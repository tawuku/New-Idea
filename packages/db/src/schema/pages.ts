import { index, integer, pgTable, text, timestamp, uuid } from "drizzle-orm/pg-core";
import { users } from "./users.js";
import { workspaces } from "./workspaces.js";

export const pages = pgTable(
  "pages",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    workspaceId: uuid("workspace_id")
      .notNull()
      .references(() => workspaces.id, { onDelete: "cascade" }),
    parentId: uuid("parent_id"),
    title: text("title").notNull().default("Untitled"),
    icon: text("icon"),
    slug: text("slug").notNull(),
    sortOrder: integer("sort_order").notNull().default(0),
    createdById: uuid("created_by_id").references(() => users.id, { onDelete: "set null" }),
    archivedAt: timestamp("archived_at", { withTimezone: true }),
    deletedAt: timestamp("deleted_at", { withTimezone: true }),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
    updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (t) => [
    index("pages_workspace_idx").on(t.workspaceId),
    index("pages_parent_idx").on(t.parentId),
    index("pages_workspace_slug_idx").on(t.workspaceId, t.slug),
  ],
);

// Stores the Y.js document state as base64-encoded binary
export const pageCollabDocuments = pgTable("page_collab_documents", {
  pageId: uuid("page_id")
    .primaryKey()
    .references(() => pages.id, { onDelete: "cascade" }),
  ydoc: text("ydoc"),
  updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
});

export type DbPage = typeof pages.$inferSelect;
export type DbNewPage = typeof pages.$inferInsert;
export type DbPageCollabDocument = typeof pageCollabDocuments.$inferSelect;
