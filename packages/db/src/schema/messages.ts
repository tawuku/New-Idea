import { boolean, index, pgTable, text, timestamp, uuid } from "drizzle-orm/pg-core";
import { channels } from "./channels.js";
import { users } from "./users.js";

export const messages = pgTable(
  "messages",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    workspaceId: uuid("workspace_id").notNull(),
    channelId: uuid("channel_id")
      .notNull()
      .references(() => channels.id, { onDelete: "cascade" }),
    userId: uuid("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "set null" }),
    parentId: uuid("parent_id"),
    body: text("body").notNull(),
    edited: boolean("edited").notNull().default(false),
    deletedAt: timestamp("deleted_at", { withTimezone: true }),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
    updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (t) => [
    index("messages_channel_idx").on(t.channelId),
    index("messages_workspace_idx").on(t.workspaceId),
    index("messages_parent_idx").on(t.parentId),
    index("messages_created_idx").on(t.createdAt),
  ],
);

export const messageReactions = pgTable(
  "message_reactions",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    messageId: uuid("message_id")
      .notNull()
      .references(() => messages.id, { onDelete: "cascade" }),
    userId: uuid("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    emoji: text("emoji").notNull(),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (t) => [index("message_reactions_message_idx").on(t.messageId)],
);

export type DbMessage = typeof messages.$inferSelect;
export type DbNewMessage = typeof messages.$inferInsert;
export type DbMessageReaction = typeof messageReactions.$inferSelect;
