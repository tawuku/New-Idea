import { z } from "zod";

export const PageSchema = z.object({
  id: z.string().uuid(),
  workspaceId: z.string().uuid(),
  parentId: z.string().uuid().nullable(),
  title: z.string().min(0).max(500).default("Untitled"),
  icon: z.string().max(8).nullable().optional(),
  slug: z.string().min(1).max(200),
  sortOrder: z.number().int().default(0),
  createdById: z.string().uuid().nullable().optional(),
  archivedAt: z.coerce.date().nullable().optional(),
  deletedAt: z.coerce.date().nullable().optional(),
  createdAt: z.coerce.date(),
  updatedAt: z.coerce.date(),
});

export const CreatePageSchema = z.object({
  title: z.string().max(500).default("Untitled"),
  parentId: z.string().uuid().nullable().optional(),
  icon: z.string().max(8).nullable().optional(),
  sortOrder: z.number().int().optional(),
});

export const UpdatePageSchema = z.object({
  title: z.string().max(500).optional(),
  parentId: z.string().uuid().nullable().optional(),
  icon: z.string().max(8).nullable().optional(),
  sortOrder: z.number().int().optional(),
  archivedAt: z.coerce.date().nullable().optional(),
});

export const PageTreeNodeSchema: z.ZodType<PageTreeNode> = z.lazy(() =>
  PageSchema.extend({
    children: z.array(PageTreeNodeSchema),
  }),
);

export type Page = z.infer<typeof PageSchema>;
export type CreatePage = z.infer<typeof CreatePageSchema>;
export type UpdatePage = z.infer<typeof UpdatePageSchema>;
export type PageTreeNode = z.infer<typeof PageSchema> & { children: PageTreeNode[] };
