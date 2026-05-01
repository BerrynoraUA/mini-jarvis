import fs from "node:fs/promises";
import path from "node:path";
import { randomUUID } from "node:crypto";
import matter from "gray-matter";

import {
  NoteFrontmatterSchema,
  NoteInputSchema,
  TaskInputSchema,
  TaskListSchema,
  TaskSchema,
  TaskUpdateSchema,
  type Note,
  type NoteInput,
  type Task,
  type TaskInput,
  type TaskUpdate,
} from "@mini-jarvis/schemas";

import type { NotesStore, Storage, TasksStore } from "./types";

/* ----- helpers ----- */

function slugify(input: string): string {
  return input
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9\s-]/g, "")
    .trim()
    .replace(/\s+/g, "-")
    .slice(0, 80) || "untitled";
}

async function ensureDir(dir: string) {
  await fs.mkdir(dir, { recursive: true });
}

async function pathExists(p: string) {
  try {
    await fs.access(p);
    return true;
  } catch {
    return false;
  }
}

/* ----- adapters ----- */

class LocalNotesStore implements NotesStore {
  constructor(private readonly notesDir: string) {}

  private file(slug: string) {
    return path.join(this.notesDir, `${slug}.md`);
  }

  async list(): Promise<Note[]> {
    await ensureDir(this.notesDir);
    const entries = await fs.readdir(this.notesDir);
    const notes: Note[] = [];
    for (const file of entries) {
      if (!file.endsWith(".md")) continue;
      const slug = file.replace(/\.md$/, "");
      const note = await this.get(slug);
      if (note) notes.push(note);
    }
    notes.sort((a, b) => b.updatedAt.localeCompare(a.updatedAt));
    return notes;
  }

  async get(slug: string): Promise<Note | null> {
    const file = this.file(slug);
    if (!(await pathExists(file))) return null;
    const raw = await fs.readFile(file, "utf8");
    const parsed = matter(raw);
    const fm = NoteFrontmatterSchema.parse(parsed.data);
    return { ...fm, slug, body: parsed.content };
  }

  async create(input: NoteInput): Promise<Note> {
    await ensureDir(this.notesDir);
    const data = NoteInputSchema.parse(input);
    const now = new Date().toISOString();
    const id = randomUUID();
    let slug = slugify(data.title);
    // ensure unique slug
    let suffix = 0;
    while (await pathExists(this.file(suffix === 0 ? slug : `${slug}-${suffix}`))) {
      suffix += 1;
    }
    if (suffix > 0) slug = `${slug}-${suffix}`;

    const note: Note = {
      id,
      slug,
      title: data.title,
      tags: data.tags,
      body: data.body,
      createdAt: now,
      updatedAt: now,
      pinned: data.pinned,
      archived: data.archived,
    };
    await this.write(note);
    return note;
  }

  async update(slug: string, input: Partial<NoteInput>): Promise<Note> {
    const existing = await this.get(slug);
    if (!existing) throw new Error(`Note not found: ${slug}`);
    const merged: Note = {
      ...existing,
      ...input,
      tags: input.tags ?? existing.tags,
      updatedAt: new Date().toISOString(),
    };
    await this.write(merged);
    return merged;
  }

  async remove(slug: string): Promise<void> {
    const file = this.file(slug);
    if (await pathExists(file)) await fs.unlink(file);
  }

  private async write(note: Note) {
    const fm = NoteFrontmatterSchema.parse({
      id: note.id,
      title: note.title,
      tags: note.tags,
      createdAt: note.createdAt,
      updatedAt: note.updatedAt,
      pinned: note.pinned,
      archived: note.archived,
    });
    const file = this.file(note.slug);
    const out = matter.stringify(note.body ?? "", fm);
    await fs.writeFile(file, out, "utf8");
  }
}

class LocalTasksStore implements TasksStore {
  constructor(private readonly tasksFile: string) {}

  private async readAll(): Promise<Task[]> {
    if (!(await pathExists(this.tasksFile))) return [];
    const raw = await fs.readFile(this.tasksFile, "utf8");
    if (!raw.trim()) return [];
    const json: unknown = JSON.parse(raw);
    return TaskListSchema.parse(json);
  }

  private async writeAll(tasks: Task[]) {
    await ensureDir(path.dirname(this.tasksFile));
    await fs.writeFile(this.tasksFile, JSON.stringify(tasks, null, 2), "utf8");
  }

  async list(): Promise<Task[]> {
    const tasks = await this.readAll();
    tasks.sort((a, b) => a.order - b.order || a.createdAt.localeCompare(b.createdAt));
    return tasks;
  }

  async create(input: TaskInput): Promise<Task> {
    const data = TaskInputSchema.parse(input);
    const tasks = await this.readAll();
    const now = new Date().toISOString();
    const task: Task = TaskSchema.parse({
      id: randomUUID(),
      title: data.title,
      status: data.status ?? "todo",
      due: data.due ?? null,
      tags: data.tags ?? [],
      project: data.project ?? null,
      order: data.order ?? tasks.length,
      createdAt: now,
      updatedAt: now,
    });
    tasks.push(task);
    await this.writeAll(tasks);
    return task;
  }

  async update(id: string, input: TaskUpdate): Promise<Task> {
    const data = TaskUpdateSchema.parse(input);
    const tasks = await this.readAll();
    const idx = tasks.findIndex((t) => t.id === id);
    if (idx === -1) throw new Error(`Task not found: ${id}`);
    const merged = TaskSchema.parse({
      ...tasks[idx],
      ...data,
      updatedAt: new Date().toISOString(),
    });
    tasks[idx] = merged;
    await this.writeAll(tasks);
    return merged;
  }

  async remove(id: string): Promise<void> {
    const tasks = await this.readAll();
    const next = tasks.filter((t) => t.id !== id);
    await this.writeAll(next);
  }

  async reorder(ids: string[]): Promise<void> {
    const tasks = await this.readAll();
    const byId = new Map(tasks.map((t) => [t.id, t]));
    const reordered: Task[] = [];
    ids.forEach((id, order) => {
      const t = byId.get(id);
      if (t) reordered.push({ ...t, order, updatedAt: new Date().toISOString() });
    });
    // include any unreferenced tasks at the end, preserving relative order
    tasks.forEach((t) => {
      if (!ids.includes(t.id)) {
        reordered.push({ ...t, order: reordered.length });
      }
    });
    await this.writeAll(reordered);
  }
}

/* ----- factory ----- */

export function createLocalStorage(root: string): Storage {
  return {
    notes: new LocalNotesStore(path.join(root, "notes")),
    tasks: new LocalTasksStore(path.join(root, "tasks", "tasks.json")),
  };
}
