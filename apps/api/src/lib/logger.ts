import pino from "pino";

export const logger = pino({
  level: process.env["NODE_ENV"] === "production" ? "info" : "debug",
  redact: {
    paths: ["req.headers.authorization", "req.headers.cookie", "*.password", "*.token"],
    censor: "[REDACTED]",
  },
  serializers: {
    req(req) {
      return {
        method: req.method,
        url: req.url,
        traceId: req.headers["x-trace-id"],
      };
    },
  },
});

export function createChildLogger(bindings: Record<string, string | undefined>) {
  return logger.child(bindings);
}
