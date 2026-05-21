import { describe, expect, it } from "vitest";
import { CreateChannelSchema } from "../channel/index.js";
import { SendMessageSchema } from "../message/index.js";

describe("CreateChannelSchema", () => {
  it("accepts a valid public channel", () => {
    expect(CreateChannelSchema.safeParse({ name: "general", type: "public" }).success).toBe(true);
  });

  it("rejects a name with uppercase letters", () => {
    expect(CreateChannelSchema.safeParse({ name: "General", type: "public" }).success).toBe(false);
  });

  it("rejects a name with spaces", () => {
    expect(CreateChannelSchema.safeParse({ name: "my channel", type: "public" }).success).toBe(
      false,
    );
  });

  it("accepts hyphens and underscores", () => {
    expect(CreateChannelSchema.safeParse({ name: "my-channel_2", type: "public" }).success).toBe(
      true,
    );
  });

  it("defaults type to public", () => {
    const result = CreateChannelSchema.safeParse({ name: "random" });
    expect(result.success).toBe(true);
    if (result.success) expect(result.data.type).toBe("public");
  });
});

describe("SendMessageSchema", () => {
  it("accepts a valid message", () => {
    expect(SendMessageSchema.safeParse({ body: "Hello world" }).success).toBe(true);
  });

  it("rejects an empty body", () => {
    expect(SendMessageSchema.safeParse({ body: "" }).success).toBe(false);
  });

  it("rejects a body over 4000 characters", () => {
    expect(SendMessageSchema.safeParse({ body: "a".repeat(4001) }).success).toBe(false);
  });

  it("accepts an optional parentId (thread reply)", () => {
    const parentId = crypto.randomUUID();
    const result = SendMessageSchema.safeParse({ body: "reply", parentId });
    expect(result.success).toBe(true);
  });
});
