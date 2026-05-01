import { z } from "zod";

export const TaskStatusEnum = z.enum(["todo", "doing", "done"]);
export type TaskStatus = z.infer<typeof TaskStatusEnum>;

export const TaskSchema = z.object({
  id: z.string().uuid(),
  title: z.string().min(1).max(200),
  status: TaskStatusEnum.default("todo"),
  due: z.string().datetime().nullable().optional(),
  tags: z.array(z.string()).default([]),
  project: z.string().nullable().optional(),
  order: z.number().int().nonnegative().default(0),
  createdAt: z.string().datetime(),
  updatedAt: z.string().datetime(),
});

export const TaskInputSchema = z.object({
  title: z.string().min(1).max(200),
  status: TaskStatusEnum.optional(),
  due: z.string().datetime().nullable().optional(),
  tags: z.array(z.string()).optional(),
  project: z.string().nullable().optional(),
  order: z.number().int().nonnegative().optional(),
});

export const TaskUpdateSchema = TaskInputSchema.partial();

export const TaskListSchema = z.array(TaskSchema);

export type Task = z.infer<typeof TaskSchema>;
export type TaskInput = z.infer<typeof TaskInputSchema>;
export type TaskUpdate = z.infer<typeof TaskUpdateSchema>;
