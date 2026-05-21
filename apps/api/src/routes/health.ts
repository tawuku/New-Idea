import type { FastifyInstance } from "fastify";

export async function healthRoutes(app: FastifyInstance): Promise<void> {
  app.get("/healthz", async () => {
    return { status: "ok", timestamp: new Date().toISOString() };
  });

  app.get("/readyz", async (_req, reply) => {
    try {
      await app.db?.execute("SELECT 1");
      return { status: "ready", timestamp: new Date().toISOString() };
    } catch {
      return reply.status(503).send({
        status: "not_ready",
        timestamp: new Date().toISOString(),
      });
    }
  });
}
