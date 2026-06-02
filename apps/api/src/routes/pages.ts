import { and, asc, eq, isNull, pageCollabDocuments, pages } from "@nexus/db";
import { CreatePageSchema, UpdatePageSchema } from "@nexus/schemas";
import type { FastifyInstance } from "fastify";
import { nanoid } from "../lib/nanoid.js";

function buildSlug(title: string): string {
  const base = title
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, "")
    .trim()
    .replace(/\s+/g, "-")
    .slice(0, 80);
  return (base || "untitled") + "-" + nanoid(6);
}

export async function pageRoutes(app: FastifyInstance): Promise<void> {
  app.addHook("onRequest", async (req, reply) => {
    if (!req.user) {
      return reply.status(401).send({ type: "UNAUTHORIZED", title: "Authentication required" });
    }
  });

  // List all pages in a workspace (flat list, client builds tree)
  app.get("/:workspaceId/pages", async (req, reply) => {
    if (!req.user) return reply.status(401).send({ type: "UNAUTHORIZED" });
    const { workspaceId } = req.params as { workspaceId: string };

    const rows = await app.db
      .select()
      .from(pages)
      .where(and(eq(pages.workspaceId, workspaceId), isNull(pages.deletedAt)))
      .orderBy(asc(pages.sortOrder), asc(pages.createdAt));

    return rows;
  });

  // Get a single page by id
  app.get("/:workspaceId/pages/:pageId", async (req, reply) => {
    if (!req.user) return reply.status(401).send({ type: "UNAUTHORIZED" });
    const { workspaceId, pageId } = req.params as { workspaceId: string; pageId: string };

    const [page] = await app.db
      .select()
      .from(pages)
      .where(and(eq(pages.id, pageId), eq(pages.workspaceId, workspaceId), isNull(pages.deletedAt)))
      .limit(1);

    if (!page) return reply.status(404).send({ type: "NOT_FOUND", title: "Page not found" });

    return page;
  });

  // Create a page
  app.post("/:workspaceId/pages", async (req, reply) => {
    if (!req.user) return reply.status(401).send({ type: "UNAUTHORIZED" });
    const { workspaceId } = req.params as { workspaceId: string };

    const body = CreatePageSchema.safeParse(req.body);
    if (!body.success) {
      return reply.status(400).send({
        type: "VALIDATION_ERROR",
        title: "Invalid page data",
        errors: body.error.flatten(),
      });
    }

    const slug = buildSlug(body.data.title ?? "Untitled");
    const [page] = await app.db
      .insert(pages)
      .values({
        ...body.data,
        workspaceId,
        slug,
        createdById: req.user.id,
      })
      .returning();

    if (!page) return reply.status(500).send({ type: "INTERNAL_ERROR", title: "Failed to create page" });

    // Emit via Socket.IO so sidebar refreshes live
    app.io?.to(`workspace:${workspaceId}`).emit("page:created", {
      id: page.id,
      workspaceId: page.workspaceId,
      parentId: page.parentId,
      title: page.title,
      icon: page.icon ?? null,
      slug: page.slug,
      sortOrder: page.sortOrder,
    });

    return reply.status(201).send(page);
  });

  // Update a page (title, icon, parentId, sortOrder, archivedAt)
  app.patch("/:workspaceId/pages/:pageId", async (req, reply) => {
    if (!req.user) return reply.status(401).send({ type: "UNAUTHORIZED" });
    const { workspaceId, pageId } = req.params as { workspaceId: string; pageId: string };

    const body = UpdatePageSchema.safeParse(req.body);
    if (!body.success) {
      return reply.status(400).send({
        type: "VALIDATION_ERROR",
        title: "Invalid page data",
        errors: body.error.flatten(),
      });
    }

    const [page] = await app.db
      .update(pages)
      .set({ ...body.data, updatedAt: new Date() })
      .where(and(eq(pages.id, pageId), eq(pages.workspaceId, workspaceId), isNull(pages.deletedAt)))
      .returning();

    if (!page) return reply.status(404).send({ type: "NOT_FOUND", title: "Page not found" });

    app.io?.to(`workspace:${workspaceId}`).emit("page:updated", {
      id: page.id,
      workspaceId: page.workspaceId,
      parentId: page.parentId,
      title: page.title,
      icon: page.icon ?? null,
      slug: page.slug,
      sortOrder: page.sortOrder,
    });

    return page;
  });

  // Soft delete
  app.delete("/:workspaceId/pages/:pageId", async (req, reply) => {
    if (!req.user) return reply.status(401).send({ type: "UNAUTHORIZED" });
    const { workspaceId, pageId } = req.params as { workspaceId: string; pageId: string };

    await app.db
      .update(pages)
      .set({ deletedAt: new Date(), updatedAt: new Date() })
      .where(and(eq(pages.id, pageId), eq(pages.workspaceId, workspaceId)));

    app.io?.to(`workspace:${workspaceId}`).emit("page:deleted", { id: pageId, workspaceId });

    return reply.status(204).send();
  });

  // Get the Y.js document (base64) for a page — used by Tiptap HocuspocusProvider as a REST fallback
  app.get("/:workspaceId/pages/:pageId/ydoc", async (req, reply) => {
    if (!req.user) return reply.status(401).send({ type: "UNAUTHORIZED" });
    const { workspaceId, pageId } = req.params as { workspaceId: string; pageId: string };

    // Verify page belongs to workspace
    const [page] = await app.db
      .select({ id: pages.id })
      .from(pages)
      .where(and(eq(pages.id, pageId), eq(pages.workspaceId, workspaceId), isNull(pages.deletedAt)))
      .limit(1);

    if (!page) return reply.status(404).send({ type: "NOT_FOUND", title: "Page not found" });

    const [doc] = await app.db
      .select()
      .from(pageCollabDocuments)
      .where(eq(pageCollabDocuments.pageId, pageId))
      .limit(1);

    return { ydoc: doc?.ydoc ?? null };
  });
}
