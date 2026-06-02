import { z } from "zod";

export const ChannelTypeSchema = z.enum(["public", "private", "dm", "group_dm"]);

export const ChannelSchema = z.object({
  id: z.string().uuid(),
  workspaceId: z.string().uuid(),
  name: z.string().min(1).max(80).nullable().optional(),
  description: z.string().max(250).nullable().optional(),
  type: ChannelTypeSchema,
  createdById: z.string().uuid().nullable().optional(),
  createdAt: z.coerce.date(),
  updatedAt: z.coerce.date(),
});

export const CreateChannelSchema = z.object({
  name: z
    .string()
    .min(1, "Channel name is required")
    .max(80)
    .regex(/^[a-z0-9-_]+$/, "Use lowercase letters, numbers, hyphens, underscores"),
  description: z.string().max(250).optional(),
  type: z.enum(["public", "private"]).default("public"),
});

export type Channel = z.infer<typeof ChannelSchema>;
export type CreateChannel = z.infer<typeof CreateChannelSchema>;
