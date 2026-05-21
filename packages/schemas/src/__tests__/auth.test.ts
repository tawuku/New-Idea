import { describe, expect, it } from "vitest";
import { MagicLinkSchema, SignUpSchema } from "../auth/index.js";

describe("MagicLinkSchema", () => {
  it("accepts a valid email", () => {
    expect(MagicLinkSchema.safeParse({ email: "user@example.com" }).success).toBe(true);
  });

  it("rejects an invalid email", () => {
    expect(MagicLinkSchema.safeParse({ email: "not-an-email" }).success).toBe(false);
  });
});

describe("SignUpSchema", () => {
  it("accepts valid sign-up data", () => {
    expect(
      SignUpSchema.safeParse({ email: "user@example.com", name: "Ada Lovelace" }).success,
    ).toBe(true);
  });

  it("rejects an empty name", () => {
    expect(SignUpSchema.safeParse({ email: "user@example.com", name: "" }).success).toBe(false);
  });

  it("rejects a password shorter than 8 characters", () => {
    expect(
      SignUpSchema.safeParse({
        email: "user@example.com",
        name: "Ada",
        password: "short",
      }).success,
    ).toBe(false);
  });
});
