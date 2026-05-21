import { z } from "zod";

const baseEventSchema = z.object({
  id: z.string().uuid(),
  workspaceId: z.string().uuid(),
  actorId: z.string().uuid(),
  occurredAt: z.coerce.date(),
  traceId: z.string().optional(),
});

export const UserSignedInEventSchema = baseEventSchema.extend({
  type: z.literal("user.signed_in"),
  payload: z.object({
    userId: z.string().uuid(),
    method: z.enum(["password", "magic_link", "google", "microsoft"]),
  }),
});

export const WorkspaceCreatedEventSchema = baseEventSchema.extend({
  type: z.literal("workspace.created"),
  payload: z.object({
    workspaceId: z.string().uuid(),
    name: z.string(),
    slug: z.string(),
  }),
});

export const MemberInvitedEventSchema = baseEventSchema.extend({
  type: z.literal("member.invited"),
  payload: z.object({
    inviteeEmail: z.string().email(),
    role: z.enum(["admin", "member", "guest"]),
  }),
});

export const DomainEventSchema = z.discriminatedUnion("type", [
  UserSignedInEventSchema,
  WorkspaceCreatedEventSchema,
  MemberInvitedEventSchema,
]);

export type DomainEvent = z.infer<typeof DomainEventSchema>;
export type UserSignedInEvent = z.infer<typeof UserSignedInEventSchema>;
export type WorkspaceCreatedEvent = z.infer<typeof WorkspaceCreatedEventSchema>;
export type MemberInvitedEvent = z.infer<typeof MemberInvitedEventSchema>;
