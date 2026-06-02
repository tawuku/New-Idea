import pino from "pino";

export const loggerOptions = {
  level: process.env["NODE_ENV"] === "production" ? "info" : "debug",
  redact: {
    paths: ["req.headers.authorization", "req.headers.cookie", "*.password", "*.token"],
    censor: "[REDACTED]",
  },
  serializers: {
    req(req: { method: string; url: string; headers: Record<string, string> }) {
      return {
        method: req.method,
        url: req.url,
        traceId: req.headers["x-trace-id"],
      };
    },
  },
};

export const logger = pino(loggerOptions);

export function createChildLogger(bindings: Record<string, string | undefined>) {
  return logger.child(bindings);
}
