import { and, eq, gt, sessions, users } from "@nexus/db";
import type { FastifyInstance } from "fastify";

function parseCookie(header: string, name: string): string | undefined {
  for (const pair of header.split(";")) {
    const eqIdx = pair.indexOf("=");
    if (eqIdx < 0) continue;
    const key = pair.slice(0, eqIdx).trim();
    if (key !== name) continue;
    return decodeURIComponent(pair.slice(eqIdx + 1).trim());
  }
  return undefined;
}

export async function registerAuthMiddleware(app: FastifyInstance): Promise<void> {
  app.addHook("onRequest", async (req) => {
    const cookieHeader = req.headers["cookie"] ?? "";
    const sessionToken =
      parseCookie(cookieHeader, "better-auth.session_token") ??
      req.headers["authorization"]?.replace("Bearer ", "");

    if (!sessionToken) return;

    const [row] = await app.db
      .select({
        id: users.id,
        email: users.email,
        name: users.name,
        avatarUrl: users.avatarUrl,
        expiresAt: sessions.expiresAt,
      })
      .from(sessions)
      .innerJoin(users, eq(sessions.userId, users.id))
      .where(and(eq(sessions.id, sessionToken), gt(sessions.expiresAt, new Date())))
      .limit(1);

    if (row) {
      req.user = { id: row.id, email: row.email, name: row.name };
    }
  });
}
