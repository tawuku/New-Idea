import { createServer } from "node:http";
import { join } from "node:path";
import cors from "@fastify/cors";
import helmet from "@fastify/helmet";
import multipart from "@fastify/multipart";
import rateLimit from "@fastify/rate-limit";
import staticFiles from "@fastify/static";
import { getDb } from "@nexus/db/client";
import { config } from "dotenv";
import Fastify from "fastify";
import { logger } from "./lib/logger.js";
import { type SocketIOInstance, createSocketServer } from "./lib/realtime.js";
import { registerAuthMiddleware } from "./middleware/auth.js";
import { channelRoutes } from "./routes/channels.js";
import { healthRoutes } from "./routes/health.js";
import { notificationRoutes } from "./routes/notifications.js";
import { searchRoutes } from "./routes/search.js";
import { uploadRoutes } from "./routes/uploads.js";
import { workspaceRoutes } from "./routes/workspaces.js";

config({ path: "../../.env.local" });
config({ path: "../../.env" });

const PORT = Number(process.env["PORT"] ?? 3001);
const HOST = process.env["HOST"] ?? "0.0.0.0";
const UPLOAD_DIR = process.env["UPLOAD_DIR"] ?? "./uploads";

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
  await app.register(rateLimit, { max: 200, timeWindow: "1 minute" });
  await app.register(multipart);
  await app.register(staticFiles, {
    root: join(process.cwd(), UPLOAD_DIR),
    prefix: "/uploads/",
    decorateReply: false,
  });

  app.decorate("db", getDb());
  app.decorate("io", null);

  await registerAuthMiddleware(app);

  await app.register(healthRoutes);
  await app.register(workspaceRoutes, { prefix: "/api/v1/workspaces" });
  await app.register(channelRoutes, { prefix: "/api/v1" });
  await app.register(searchRoutes, { prefix: "/api/v1" });
  await app.register(notificationRoutes, { prefix: "/api/v1/notifications" });
  await app.register(uploadRoutes, { prefix: "/api/v1/uploads" });

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
