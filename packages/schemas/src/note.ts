import { z } from "zod";

/**
 * Note — markdown body + frontmatter metadata.
 * Persisted on disk as `<slug>.md` with YAML frontmatter via gray-matter.
 */

export const NoteFrontmatterSchema = z.object({
  id: z.string().uuid(),
  title: z.string().min(1).max(200),
  tags: z.array(z.string()).default([]),
  createdAt: z.string().datetime(),
  updatedAt: z.string().datetime(),
  pinned: z.boolean().optional(),
  archived: z.boolean().optional(),
});

export const NoteSchema = NoteFrontmatterSchema.extend({
  slug: z.string().min(1),
  body: z.string().default(""),
});

export const NoteInputSchema = z.object({
  title: z.string().min(1).max(200),
  body: z.string().default(""),
  tags: z.array(z.string()).default([]),
  pinned: z.boolean().optional(),
  archived: z.boolean().optional(),
});

export type NoteFrontmatter = z.infer<typeof NoteFrontmatterSchema>;
export type Note = z.infer<typeof NoteSchema>;
export type NoteInput = z.infer<typeof NoteInputSchema>;
