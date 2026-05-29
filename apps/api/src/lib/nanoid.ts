import { randomBytes } from "node:crypto";

const CHARS = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";

export function nanoid(size = 21): string {
  const bytes = randomBytes(size);
  return Array.from(bytes, (b) => CHARS[b % CHARS.length]).join("");
}
