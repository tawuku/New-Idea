import { randomUUID } from "node:crypto";
import { createWriteStream, mkdirSync } from "node:fs";
import { join } from "node:path";
import { pipeline } from "node:stream/promises";
import type { FastifyInstance } from "fastify";

const UPLOAD_DIR = process.env["UPLOAD_DIR"] ?? "./uploads";
const UPLOAD_PUBLIC_URL = process.env["UPLOAD_PUBLIC_URL"] ?? "http://localhost:3001/uploads";
const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10 MB

mkdirSync(UPLOAD_DIR, { recursive: true });

export async function uploadRoutes(app: FastifyInstance): Promise<void> {
  app.addHook("onRequest", async (req, reply) => {
    if (!req.user) {
      return reply.status(401).send({ type: "UNAUTHORIZED", title: "Authentication required" });
    }
  });

  app.post("/", async (req, reply) => {
    if (!req.user) return reply.status(401).send({ type: "UNAUTHORIZED" });

    const data = await req.file({ limits: { fileSize: MAX_FILE_SIZE } });

    if (!data) {
      return reply.status(400).send({ type: "BAD_REQUEST", title: "No file provided" });
    }

    const ext = data.filename.includes(".") ? (data.filename.split(".").pop() ?? "bin") : "bin";
    const storedName = `${randomUUID()}.${ext}`;
    const destPath = join(UPLOAD_DIR, storedName);

    await pipeline(data.file, createWriteStream(destPath));

    if (data.file.truncated) {
      return reply.status(413).send({
        type: "PAYLOAD_TOO_LARGE",
        title: `File exceeds ${MAX_FILE_SIZE / 1024 / 1024}MB limit`,
      });
    }

    return {
      url: `${UPLOAD_PUBLIC_URL}/${storedName}`,
      fileName: data.filename,
      mimeType: data.mimetype,
      fileSize: data.file.bytesRead,
    };
  });
}
