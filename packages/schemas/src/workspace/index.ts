import { z } from "zod";

export const WorkspaceSchema = z.object({
  id: z.string().uuid(),
  name: z.string().min(1).max(100),
  slug: z
    .string()
    .min(2)
    .max(48)
    .regex(/^[a-z0-9-]+$/, "Slug must be lowercase letters, numbers, and hyphens only"),
  logoUrl: z.string().url().nullable().optional(),
  plan: z.enum(["solo", "team", "business", "enterprise"]).default("solo"),
  createdAt: z.coerce.date(),
  updatedAt: z.coerce.date(),
});

export const CreateWorkspaceSchema = WorkspaceSchema.pick({
  name: true,
  slug: true,
}).extend({
  logoUrl: z.string().url().optional(),
});

export const UpdateWorkspaceSchema = CreateWorkspaceSchema.partial();

export const WorkspaceMemberSchema = z.object({
  workspaceId: z.string().uuid(),
  userId: z.string().uuid(),
  role: z.enum(["owner", "admin", "member", "guest"]),
  createdAt: z.coerce.date(),
});

export type Workspace = z.infer<typeof WorkspaceSchema>;
export type CreateWorkspace = z.infer<typeof CreateWorkspaceSchema>;
export type UpdateWorkspace = z.infer<typeof UpdateWorkspaceSchema>;
export type WorkspaceMember = z.infer<typeof WorkspaceMemberSchema>;
