import { and, desc, eq, notifications } from "@nexus/db";
import type { FastifyInstance } from "fastify";

export async function notificationRoutes(app: FastifyInstance): Promise<void> {
  app.addHook("onRequest", async (req, reply) => {
    if (!req.user) {
      return reply.status(401).send({ type: "UNAUTHORIZED", title: "Authentication required" });
    }
  });

  app.get("/", async (req, reply) => {
    if (!req.user) return reply.status(401).send({ type: "UNAUTHORIZED" });

    const rows = await app.db
      .select()
      .from(notifications)
      .where(eq(notifications.userId, req.user.id))
      .orderBy(desc(notifications.createdAt))
      .limit(50);

    return rows;
  });

  app.get("/unread-count", async (req, reply) => {
    if (!req.user) return reply.status(401).send({ type: "UNAUTHORIZED" });

    const rows = await app.db
      .select({ id: notifications.id })
      .from(notifications)
      .where(and(eq(notifications.userId, req.user.id), eq(notifications.read, false)));

    return { count: rows.length };
  });

  app.patch("/:id/read", async (req, reply) => {
    if (!req.user) return reply.status(401).send({ type: "UNAUTHORIZED" });
    const { id } = req.params as { id: string };

    await app.db
      .update(notifications)
      .set({ read: true })
      .where(and(eq(notifications.id, id), eq(notifications.userId, req.user.id)));

    return reply.status(204).send();
  });

  app.patch("/read-all", async (req, reply) => {
    if (!req.user) return reply.status(401).send({ type: "UNAUTHORIZED" });

    await app.db
      .update(notifications)
      .set({ read: true })
      .where(and(eq(notifications.userId, req.user.id), eq(notifications.read, false)));

    return reply.status(204).send();
  });
}
