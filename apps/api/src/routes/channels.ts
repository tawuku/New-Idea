import {
  and,
  channelMembers,
  channels,
  eq,
  isNull,
  messages,
  notifications,
  users,
} from "@nexus/db";
import { CreateChannelSchema } from "@nexus/schemas/channel";
import { SendMessageSchema } from "@nexus/schemas/message";
import type { FastifyInstance } from "fastify";
import { buildNotificationEmail, sendEmail } from "../lib/email.js";

export async function channelRoutes(app: FastifyInstance): Promise<void> {
  app.addHook("onRequest", async (req, reply) => {
    if (!req.user) {
      return reply.status(401).send({ type: "UNAUTHORIZED", title: "Authentication required" });
    }
  });

  app.get("/:workspaceId/channels", async (req, reply) => {
    if (!req.user) return reply.status(401).send({ type: "UNAUTHORIZED" });
    const { workspaceId } = req.params as { workspaceId: string };

    const rows = await app.db
      .select({ channel: channels })
      .from(channelMembers)
      .innerJoin(channels, eq(channelMembers.channelId, channels.id))
      .where(and(eq(channelMembers.userId, req.user.id), eq(channels.workspaceId, workspaceId)));

    return rows.map((r) => r.channel);
  });

  app.post("/:workspaceId/channels", async (req, reply) => {
    if (!req.user) return reply.status(401).send({ type: "UNAUTHORIZED" });
    const { workspaceId } = req.params as { workspaceId: string };

    const body = CreateChannelSchema.safeParse(req.body);
    if (!body.success) {
      return reply.status(400).send({
        type: "VALIDATION_ERROR",
        title: "Invalid channel data",
        errors: body.error.flatten(),
      });
    }

    const db = app.db;
    const [channel] = await db
      .insert(channels)
      .values({ ...body.data, workspaceId, createdById: req.user.id })
      .returning();

    if (!channel) {
      return reply.status(500).send({ type: "INTERNAL_ERROR", title: "Failed to create channel" });
    }

    await db.insert(channelMembers).values({ channelId: channel.id, userId: req.user.id });

    app.io?.to(`workspace:${workspaceId}`).emit("channel:created", {
      id: channel.id,
      name: channel.name,
      type: channel.type,
    });

    return reply.status(201).send(channel);
  });

  // List messages — supports ?parentId=xxx for thread replies
  app.get("/:workspaceId/channels/:channelId/messages", async (req, reply) => {
    if (!req.user) return reply.status(401).send({ type: "UNAUTHORIZED" });
    const { channelId, workspaceId } = req.params as {
      channelId: string;
      workspaceId: string;
    };
    const { parentId } = req.query as { parentId?: string };

    const db = app.db;

    const whereClause = parentId
      ? and(
          eq(messages.channelId, channelId),
          eq(messages.workspaceId, workspaceId),
          eq(messages.parentId, parentId),
          isNull(messages.deletedAt),
        )
      : and(
          eq(messages.channelId, channelId),
          eq(messages.workspaceId, workspaceId),
          isNull(messages.parentId),
          isNull(messages.deletedAt),
        );

    const rows = await db
      .select({
        id: messages.id,
        channelId: messages.channelId,
        workspaceId: messages.workspaceId,
        userId: messages.userId,
        parentId: messages.parentId,
        body: messages.body,
        edited: messages.edited,
        createdAt: messages.createdAt,
        updatedAt: messages.updatedAt,
        author: {
          id: users.id,
          name: users.name,
          avatarUrl: users.avatarUrl,
        },
      })
      .from(messages)
      .innerJoin(users, eq(messages.userId, users.id))
      .where(whereClause)
      .orderBy(messages.createdAt)
      .limit(100);

    return rows;
  });

  app.post("/:workspaceId/channels/:channelId/messages", async (req, reply) => {
    if (!req.user) return reply.status(401).send({ type: "UNAUTHORIZED" });
    const { channelId, workspaceId } = req.params as {
      channelId: string;
      workspaceId: string;
    };

    const body = SendMessageSchema.safeParse(req.body);
    if (!body.success) {
      return reply.status(400).send({
        type: "VALIDATION_ERROR",
        title: "Invalid message",
        errors: body.error.flatten(),
      });
    }

    const db = app.db;
    const [message] = await db
      .insert(messages)
      .values({
        channelId,
        workspaceId,
        userId: req.user.id,
        body: body.data.body,
        parentId: body.data.parentId,
      })
      .returning();

    if (!message) {
      return reply.status(500).send({ type: "INTERNAL_ERROR", title: "Failed to send message" });
    }

    app.io?.to(`channel:${channelId}`).emit("message:created", {
      id: message.id,
      channelId: message.channelId,
      workspaceId: message.workspaceId,
      body: message.body,
      userId: message.userId,
      parentId: message.parentId ?? null,
      createdAt: message.createdAt.toISOString(),
      author: { id: req.user.id, name: req.user.name },
    });

    // If this is a thread reply, notify the parent message author
    if (body.data.parentId) {
      const [parent] = await db
        .select({ userId: messages.userId })
        .from(messages)
        .where(eq(messages.id, body.data.parentId))
        .limit(1);

      if (parent && parent.userId !== req.user.id) {
        const [notif] = await db
          .insert(notifications)
          .values({
            userId: parent.userId,
            type: "reply",
            title: `${req.user.name} replied to your message`,
            body: body.data.body.slice(0, 120),
            data: JSON.stringify({ channelId, workspaceId, messageId: message.id }),
          })
          .returning();

        if (notif) {
          app.io?.to(`user:${parent.userId}`).emit("notification:new", {
            id: notif.id,
            type: notif.type,
            title: notif.title,
            body: notif.body ?? null,
            createdAt: notif.createdAt.toISOString(),
          });

          // Fire-and-forget email — don't let it block the response
          const [parentUser] = await db
            .select({ email: users.email })
            .from(users)
            .where(eq(users.id, parent.userId))
            .limit(1);

          if (parentUser) {
            const appUrl = process.env["NEXT_PUBLIC_APP_URL"] ?? "http://localhost:3000";
            const emailContent = buildNotificationEmail(notif.title, notif.body ?? "", appUrl);
            sendEmail({ to: parentUser.email, ...emailContent }).catch(() => {});
          }
        }
      }
    }

    return reply.status(201).send(message);
  });

  // Edit message
  app.patch("/:workspaceId/channels/:channelId/messages/:messageId", async (req, reply) => {
    if (!req.user) return reply.status(401).send({ type: "UNAUTHORIZED" });
    const { channelId, messageId } = req.params as {
      channelId: string;
      workspaceId: string;
      messageId: string;
    };
    const { body: newBody } = req.body as { body?: string };

    if (!newBody || newBody.trim().length === 0) {
      return reply.status(400).send({ type: "BAD_REQUEST", title: "Body is required" });
    }

    const [updated] = await app.db
      .update(messages)
      .set({ body: newBody.trim(), edited: true, updatedAt: new Date() })
      .where(and(eq(messages.id, messageId), eq(messages.userId, req.user.id)))
      .returning();

    if (!updated) {
      return reply.status(404).send({ type: "NOT_FOUND", title: "Message not found" });
    }

    app.io?.to(`channel:${channelId}`).emit("message:edited", {
      id: updated.id,
      body: updated.body,
      updatedAt: updated.updatedAt.toISOString(),
    });

    return updated;
  });

  // Delete message (soft delete)
  app.delete("/:workspaceId/channels/:channelId/messages/:messageId", async (req, reply) => {
    if (!req.user) return reply.status(401).send({ type: "UNAUTHORIZED" });
    const { channelId, messageId } = req.params as {
      channelId: string;
      workspaceId: string;
      messageId: string;
    };

    const [deleted] = await app.db
      .update(messages)
      .set({ deletedAt: new Date() })
      .where(and(eq(messages.id, messageId), eq(messages.userId, req.user.id)))
      .returning();

    if (!deleted) {
      return reply.status(404).send({ type: "NOT_FOUND", title: "Message not found" });
    }

    app.io?.to(`channel:${channelId}`).emit("message:deleted", {
      id: messageId,
      channelId,
    });

    return reply.status(204).send();
  });
}
