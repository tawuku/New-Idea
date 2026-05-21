import { createServer } from "node:http";
import cors from "@fastify/cors";
import helmet from "@fastify/helmet";
import rateLimit from "@fastify/rate-limit";
import { getDb } from "@nexus/db/client";
import { config } from "dotenv";
import Fastify from "fastify";
import { logger } from "./lib/logger.js";
import { type SocketIOInstance, createSocketServer } from "./lib/realtime.js";
import { channelRoutes } from "./routes/channels.js";
import { healthRoutes } from "./routes/health.js";
import { workspaceRoutes } from "./routes/workspaces.js";

config({ path: "../../.env.local" });
config({ path: "../../.env" });

const PORT = Number(process.env["PORT"] ?? 3001);
const HOST = process.env["HOST"] ?? "0.0.0.0";

declare module "fastify" {
  interface FastifyInstance {
    db: ReturnType<typeof getDb>;
    io: SocketIOInstance | null;
  }
  interface FastifyRequest {
    user?: { id: string; email: string; name: string };
  }
}

async function build() {
  const app = Fastify({
    logger: logger as Parameters<typeof Fastify>[0]["logger"],
    trustProxy: true,
    requestIdHeader: "x-trace-id",
  });

  await app.register(helmet, { contentSecurityPolicy: false });
  await app.register(cors, {
    origin: process.env["NEXT_PUBLIC_APP_URL"] ?? "http://localhost:3000",
    credentials: true,
  });
  await app.register(rateLimit, { max: 100, timeWindow: "1 minute" });

  app.decorate("db", getDb());
  app.decorate("io", null);

  app.addHook("onRequest", async (req) => {
    const sessionToken = req.headers["authorization"]?.replace("Bearer ", "");
    if (sessionToken) {
      req.user = { id: "placeholder", email: "placeholder@nexus.dev", name: "Dev User" };
    }
  });

  await app.register(healthRoutes);
  await app.register(workspaceRoutes, { prefix: "/api/v1/workspaces" });
  await app.register(channelRoutes, { prefix: "/api/v1" });

  app.setErrorHandler((error, req, reply) => {
    app.log.error({ err: error, traceId: req.id }, "Unhandled error");
    return reply.status(500).send({
      type: "INTERNAL_ERROR",
      title: "An unexpected error occurred",
      status: 500,
    });
  });

  return app;
}

build()
  .then((app) => {
    const httpServer = createServer(app.server);
    const io = createSocketServer(httpServer);
    app.decorate("io", io);

    app.listen({ port: PORT, host: HOST }, (err) => {
      if (err) {
        logger.error(err);
        process.exit(1);
      }
      logger.info(`API + WebSocket listening on ${HOST}:${PORT}`);
    });
  })
  .catch((err) => {
    logger.error(err);
    process.exit(1);
  });
