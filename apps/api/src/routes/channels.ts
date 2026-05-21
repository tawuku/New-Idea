import { and, channelMembers, channels, eq, messages } from "@nexus/db";
import { CreateChannelSchema } from "@nexus/schemas/channel";
import { SendMessageSchema } from "@nexus/schemas/message";
import type { FastifyInstance } from "fastify";

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

  app.get("/:workspaceId/channels/:channelId/messages", async (req, reply) => {
    if (!req.user) return reply.status(401).send({ type: "UNAUTHORIZED" });
    const { channelId, workspaceId } = req.params as {
      channelId: string;
      workspaceId: string;
    };

    const db = app.db;
    const rows = await db
      .select()
      .from(messages)
      .where(and(eq(messages.channelId, channelId), eq(messages.workspaceId, workspaceId)))
      .orderBy(messages.createdAt)
      .limit(50);

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
      createdAt: message.createdAt.toISOString(),
      author: { id: req.user.id, name: req.user.name },
    });

    return reply.status(201).send(message);
  });
}
