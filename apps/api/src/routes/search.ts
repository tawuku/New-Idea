import { eq, messages, sql, users, workspaces } from "@nexus/db";
import type { FastifyInstance } from "fastify";

export async function searchRoutes(app: FastifyInstance): Promise<void> {
  app.addHook("onRequest", async (req, reply) => {
    if (!req.user) {
      return reply.status(401).send({ type: "UNAUTHORIZED", title: "Authentication required" });
    }
  });

  // GET /api/v1/:workspaceId/search?q=hello&limit=20
  app.get("/:workspaceId/search", async (req, reply) => {
    if (!req.user) return reply.status(401).send({ type: "UNAUTHORIZED" });

    const { workspaceId: workspaceRef } = req.params as { workspaceId: string };
    const { q, limit: limitStr } = req.query as { q?: string; limit?: string };

    // Accept both UUID and slug
    const isUuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(workspaceRef);
    let workspaceId = workspaceRef;
    if (!isUuid) {
      const [ws] = await app.db.select({ id: workspaces.id }).from(workspaces).where(eq(workspaces.slug, workspaceRef)).limit(1);
      if (!ws) return reply.status(404).send({ type: "NOT_FOUND", title: "Workspace not found" });
      workspaceId = ws.id;
    }

    if (!q || q.trim().length < 2) {
      return reply.status(400).send({
        type: "BAD_REQUEST",
        title: "Query must be at least 2 characters",
      });
    }

    const limit = Math.min(Number(limitStr ?? 20), 50);
    const query = q.trim().split(/\s+/).join(" & ");

    const rows = await app.db
      .select({
        id: messages.id,
        channelId: messages.channelId,
        body: messages.body,
        createdAt: messages.createdAt,
        userId: messages.userId,
        authorName: users.name,
        rank: sql<number>`ts_rank(to_tsvector('english', ${messages.body}), to_tsquery('english', ${query}))`,
      })
      .from(messages)
      .innerJoin(users, sql`${users.id} = ${messages.userId}`)
      .where(
        sql`
          ${messages.workspaceId} = ${workspaceId}
          AND ${messages.deletedAt} IS NULL
          AND to_tsvector('english', ${messages.body}) @@ to_tsquery('english', ${query})
        `,
      )
      .orderBy(sql`rank DESC`)
      .limit(limit);

    return rows;
  });
}
