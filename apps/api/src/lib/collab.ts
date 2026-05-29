import { Database } from "@hocuspocus/extension-database";
import { Server as HocuspocusServer } from "@hocuspocus/server";
import { and, eq, getDb, gt, pageCollabDocuments, sessions, users } from "@nexus/db";
import { createChildLogger } from "./logger.js";

const log = createChildLogger({ service: "collab" });

export function createCollabServer(port: number) {
  const db = getDb();

  const server = HocuspocusServer.configure({
    port,
    extensions: [
      new Database({
        async fetch({ documentName }) {
          const pageId = documentName.replace(/^page:/, "");
          const rows = await db
            .select()
            .from(pageCollabDocuments)
            .where(eq(pageCollabDocuments.pageId, pageId))
            .limit(1);

          const row = rows[0];
          if (!row?.ydoc) return null;

          return Buffer.from(row.ydoc, "base64");
        },

        async store({ documentName, state }) {
          const pageId = documentName.replace(/^page:/, "");
          const ydocBase64 = Buffer.from(state).toString("base64");

          await db
            .insert(pageCollabDocuments)
            .values({ pageId, ydoc: ydocBase64, updatedAt: new Date() })
            .onConflictDoUpdate({
              target: pageCollabDocuments.pageId,
              set: { ydoc: ydocBase64, updatedAt: new Date() },
            });
        },
      }),
    ],

    async onAuthenticate({ token, documentName }) {
      if (!token) throw new Error("Unauthorized");

      const sessionRows = await db
        .select({ userId: users.id, name: users.name })
        .from(sessions)
        .innerJoin(users, eq(sessions.userId, users.id))
        .where(and(eq(sessions.id, token), gt(sessions.expiresAt, new Date())))
        .limit(1);

      if (sessionRows.length === 0) {
        log.warn({ documentName }, "Collab auth rejected: invalid session");
        throw new Error("Unauthorized");
      }

      log.debug({ documentName, userId: sessionRows[0]?.userId }, "Collab auth OK");
      return { user: sessionRows[0] };
    },

    async onConnect({ documentName }) {
      log.debug({ documentName }, "Collab client connected");
    },

    async onDisconnect({ documentName }) {
      log.debug({ documentName }, "Collab client disconnected");
    },
  });

  return {
    async listen() {
      await server.listen();
      log.info({ port }, "Hocuspocus collab server listening");
    },
    async destroy() {
      await server.destroy();
    },
  };
}
