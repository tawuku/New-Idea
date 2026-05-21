import { describe, expect, it } from "vitest";
import { CreateWorkspaceSchema, WorkspaceSchema } from "../workspace/index.js";

describe("CreateWorkspaceSchema", () => {
  it("accepts a valid workspace", () => {
    const result = CreateWorkspaceSchema.safeParse({
      name: "Acme Corp",
      slug: "acme-corp",
    });
    expect(result.success).toBe(true);
  });

  it("rejects a slug with uppercase letters", () => {
    const result = CreateWorkspaceSchema.safeParse({
      name: "Acme Corp",
      slug: "Acme-Corp",
    });
    expect(result.success).toBe(false);
  });

  it("rejects a slug with spaces", () => {
    const result = CreateWorkspaceSchema.safeParse({
      name: "Acme Corp",
      slug: "acme corp",
    });
    expect(result.success).toBe(false);
  });

  it("rejects a slug shorter than 2 characters", () => {
    const result = CreateWorkspaceSchema.safeParse({
      name: "A",
      slug: "a",
    });
    expect(result.success).toBe(false);
  });

  it("rejects a slug longer than 48 characters", () => {
    const result = CreateWorkspaceSchema.safeParse({
      name: "Long name",
      slug: "a".repeat(49),
    });
    expect(result.success).toBe(false);
  });

  it("rejects an empty name", () => {
    const result = CreateWorkspaceSchema.safeParse({ name: "", slug: "valid-slug" });
    expect(result.success).toBe(false);
  });
});

describe("WorkspaceSchema", () => {
  it("coerces date strings to Date objects", () => {
    const result = WorkspaceSchema.safeParse({
      id: crypto.randomUUID(),
      name: "Nexus Dev",
      slug: "nexus-dev",
      plan: "solo",
      createdAt: "2026-01-01T00:00:00Z",
      updatedAt: "2026-01-01T00:00:00Z",
    });
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.createdAt).toBeInstanceOf(Date);
    }
  });
});
