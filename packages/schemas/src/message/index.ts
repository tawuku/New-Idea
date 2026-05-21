import { z } from "zod";

export const MessageSchema = z.object({
  id: z.string().uuid(),
  workspaceId: z.string().uuid(),
  channelId: z.string().uuid(),
  userId: z.string().uuid(),
  parentId: z.string().uuid().nullable().optional(),
  body: z.string().min(1).max(4000),
  edited: z.boolean().default(false),
  createdAt: z.coerce.date(),
  updatedAt: z.coerce.date(),
});

export const SendMessageSchema = z.object({
  body: z.string().min(1, "Message cannot be empty").max(4000),
  parentId: z.string().uuid().optional(),
});

export const EditMessageSchema = z.object({
  body: z.string().min(1).max(4000),
});

export const MessageWithAuthorSchema = MessageSchema.extend({
  author: z.object({
    id: z.string().uuid(),
    name: z.string(),
    avatarUrl: z.string().url().nullable().optional(),
  }),
});

export type Message = z.infer<typeof MessageSchema>;
export type SendMessage = z.infer<typeof SendMessageSchema>;
export type EditMessage = z.infer<typeof EditMessageSchema>;
export type MessageWithAuthor = z.infer<typeof MessageWithAuthorSchema>;
