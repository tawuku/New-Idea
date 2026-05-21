import { eq, workspaceMembers, workspaces } from "@nexus/db";
import { CreateWorkspaceSchema } from "@nexus/schemas/workspace";
import type { FastifyInstance } from "fastify";

export async function workspaceRoutes(app: FastifyInstance): Promise<void> {
  app.addHook("onRequest", async (req, reply) => {
    if (!req.user) {
      return reply.status(401).send({ type: "UNAUTHORIZED", title: "Authentication required" });
    }
  });

  app.get("/", async (req, reply) => {
    if (!req.user) return reply.status(401).send({ type: "UNAUTHORIZED" });
    const db = app.db;
    const result = await db
      .select({ workspace: workspaces })
      .from(workspaceMembers)
      .innerJoin(workspaces, eq(workspaceMembers.workspaceId, workspaces.id))
      .where(eq(workspaceMembers.userId, req.user.id));

    return result.map((r) => r.workspace);
  });

  app.post("/", async (req, reply) => {
    if (!req.user) return reply.status(401).send({ type: "UNAUTHORIZED" });
    const body = CreateWorkspaceSchema.safeParse(req.body);
    if (!body.success) {
      return reply.status(400).send({
        type: "VALIDATION_ERROR",
        title: "Invalid request body",
        errors: body.error.flatten(),
      });
    }

    const db = app.db;
    const [workspace] = await db.insert(workspaces).values(body.data).returning();

    if (!workspace) {
      return reply
        .status(500)
        .send({ type: "INTERNAL_ERROR", title: "Failed to create workspace" });
    }

    await db.insert(workspaceMembers).values({
      workspaceId: workspace.id,
      userId: req.user.id,
      role: "owner",
    });

    return reply.status(201).send(workspace);
  });

  app.get("/:workspaceId", async (req, reply) => {
    const { workspaceId } = req.params as { workspaceId: string };
    const db = app.db;

    const [workspace] = await db
      .select()
      .from(workspaces)
      .where(eq(workspaces.id, workspaceId))
      .limit(1);

    if (!workspace) {
      return reply.status(404).send({ type: "NOT_FOUND", title: "Workspace not found" });
    }

    const [member] = await db
      .select()
      .from(workspaceMembers)
      .where(eq(workspaceMembers.workspaceId, workspaceId))
      .limit(1);

    if (!member) {
      return reply.status(403).send({ type: "FORBIDDEN", title: "Access denied" });
    }

    return workspace;
  });
}
