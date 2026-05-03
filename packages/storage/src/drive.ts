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

const DRIVE_FILES_ENDPOINT = "https://www.googleapis.com/drive/v3/files";
const DRIVE_UPLOAD_ENDPOINT = "https://www.googleapis.com/upload/drive/v3/files";
const FOLDER_MIME_TYPE = "application/vnd.google-apps.folder";
const DEFAULT_ROOT_FOLDER = "Mini Jarvis";

export interface DriveStorageOptions {
  accessToken?: string;
  rootFolderName?: string;
}

interface DriveFile {
  id: string;
  name: string;
  mimeType?: string;
  modifiedTime?: string;
}

interface GoogleApiErrorPayload {
  error?: {
    code?: number;
    message?: string;
    status?: string;
    details?: Array<{
      "@type"?: string;
      reason?: string;
      metadata?: {
        activationUrl?: string;
        serviceTitle?: string;
        consumer?: string;
      };
    }>;
  };
}

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

function escapeDriveQueryValue(value: string): string {
  return value.replace(/\\/g, "\\\\").replace(/'/g, "\\'");
}

function ensureAccessToken(accessToken?: string): string {
  if (!accessToken) {
    throw new Error("Google Drive adapter not configured (missing access token)");
  }
  return accessToken;
}

function toNoteFrontmatter(note: Note) {
  return NoteFrontmatterSchema.parse({
    id: note.id,
    title: note.title,
    tags: note.tags,
    createdAt: note.createdAt,
    updatedAt: note.updatedAt,
    ...(note.pinned !== undefined ? { pinned: note.pinned } : {}),
    ...(note.archived !== undefined ? { archived: note.archived } : {}),
  });
}

function formatGoogleDriveError(raw: string, fallbackStatus: string): string {
  try {
    const payload = JSON.parse(raw) as GoogleApiErrorPayload;
    const error = payload.error;
    if (!error) {
      return raw || fallbackStatus;
    }

    const serviceDisabledDetail = error.details?.find(
      (detail) => detail.reason === "SERVICE_DISABLED",
    );

    if (serviceDisabledDetail?.metadata?.activationUrl) {
      const serviceName = serviceDisabledDetail.metadata.serviceTitle ?? "Google Drive API";
      const consumer = serviceDisabledDetail.metadata.consumer ?? "the Google Cloud project";
      return `${serviceName} is disabled for ${consumer}. Enable it at ${serviceDisabledDetail.metadata.activationUrl} and retry in a few minutes.`;
    }

    return error.message || raw || fallbackStatus;
  } catch {
    return raw || fallbackStatus;
  }
}

class DriveClient {
  constructor(private readonly accessToken: string) {}

  private async request(input: string, init?: RequestInit): Promise<Response> {
    const response = await fetch(input, {
      ...init,
      headers: {
        authorization: `Bearer ${this.accessToken}`,
        ...(init?.headers ?? {}),
      },
      cache: "no-store",
    });

    if (!response.ok) {
      const message = await response.text().catch(() => response.statusText);
      throw new Error(
        `Google Drive request failed: ${formatGoogleDriveError(message, response.statusText)}`,
      );
    }

    return response;
  }

  async listFiles(query: string, fields = "files(id,name,mimeType,modifiedTime)"): Promise<DriveFile[]> {
    const url = new URL(DRIVE_FILES_ENDPOINT);
    url.searchParams.set("q", query);
    url.searchParams.set("fields", fields);
    url.searchParams.set("pageSize", "200");
    url.searchParams.set("supportsAllDrives", "false");
    const response = await this.request(url.toString());
    const payload = (await response.json()) as { files?: DriveFile[] };
    return payload.files ?? [];
  }

  async createFile(metadata: Record<string, unknown>, content: string, mimeType: string): Promise<DriveFile> {
    const boundary = `mini-jarvis-${randomUUID()}`;
    const body = [
      `--${boundary}`,
      "Content-Type: application/json; charset=UTF-8",
      "",
      JSON.stringify(metadata),
      `--${boundary}`,
      `Content-Type: ${mimeType}`,
      "",
      content,
      `--${boundary}--`,
      "",
    ].join("\r\n");

    const url = new URL(DRIVE_UPLOAD_ENDPOINT);
    url.searchParams.set("uploadType", "multipart");
    url.searchParams.set("fields", "id,name,mimeType,modifiedTime");
    const response = await this.request(url.toString(), {
      method: "POST",
      headers: { "content-type": `multipart/related; boundary=${boundary}` },
      body,
    });
    return (await response.json()) as DriveFile;
  }

  async createMetadataFile(metadata: Record<string, unknown>): Promise<DriveFile> {
    const url = new URL(DRIVE_FILES_ENDPOINT);
    url.searchParams.set("fields", "id,name,mimeType,modifiedTime");
    const response = await this.request(url.toString(), {
      method: "POST",
      headers: { "content-type": "application/json; charset=utf-8" },
      body: JSON.stringify(metadata),
    });
    return (await response.json()) as DriveFile;
  }

  async updateFile(fileId: string, content: string, mimeType: string): Promise<DriveFile> {
    const url = new URL(`${DRIVE_UPLOAD_ENDPOINT}/${fileId}`);
    url.searchParams.set("uploadType", "media");
    url.searchParams.set("fields", "id,name,mimeType,modifiedTime");
    const response = await this.request(url.toString(), {
      method: "PATCH",
      headers: { "content-type": mimeType },
      body: content,
    });
    return (await response.json()) as DriveFile;
  }

  async deleteFile(fileId: string): Promise<void> {
    await this.request(`${DRIVE_FILES_ENDPOINT}/${fileId}`, { method: "DELETE" });
  }

  async getFileText(fileId: string): Promise<string> {
    const url = new URL(`${DRIVE_FILES_ENDPOINT}/${fileId}`);
    url.searchParams.set("alt", "media");
    const response = await this.request(url.toString());
    return response.text();
  }

  async ensureFolder(name: string, parentId?: string): Promise<DriveFile> {
    const parentClause = parentId ? `'${parentId}' in parents` : "'root' in parents";
    const existing = await this.listFiles(
      `mimeType = '${FOLDER_MIME_TYPE}' and name = '${escapeDriveQueryValue(name)}' and ${parentClause} and trashed = false`,
    );
    if (existing[0]) {
      return existing[0];
    }

    return this.createMetadataFile(
      {
        name,
        mimeType: FOLDER_MIME_TYPE,
        parents: parentId ? [parentId] : undefined,
      },
    );
  }
}

class DriveWorkspace {
  private rootFolderPromise?: Promise<DriveFile>;
  private notesFolderPromise?: Promise<DriveFile>;
  private tasksFolderPromise?: Promise<DriveFile>;

  constructor(
    private readonly client: DriveClient,
    private readonly rootFolderName: string,
  ) {}

  getRootFolder(): Promise<DriveFile> {
    this.rootFolderPromise ??= this.client.ensureFolder(this.rootFolderName);
    return this.rootFolderPromise;
  }

  async getNotesFolder(): Promise<DriveFile> {
    this.notesFolderPromise ??= this.getRootFolder().then((folder) =>
      this.client.ensureFolder("notes", folder.id),
    );
    return this.notesFolderPromise;
  }

  async getTasksFolder(): Promise<DriveFile> {
    this.tasksFolderPromise ??= this.getRootFolder().then((folder) =>
      this.client.ensureFolder("tasks", folder.id),
    );
    return this.tasksFolderPromise;
  }
}

class DriveNotesStore implements NotesStore {
  constructor(
    private readonly client: DriveClient,
    private readonly workspace: DriveWorkspace,
  ) {}

  private async listNoteFiles(): Promise<DriveFile[]> {
    const folder = await this.workspace.getNotesFolder();
    return this.client.listFiles(
      `'${folder.id}' in parents and trashed = false and name contains '.md'`,
    );
  }

  private async findBySlug(slug: string): Promise<DriveFile | null> {
    const folder = await this.workspace.getNotesFolder();
    const files = await this.client.listFiles(
      `'${folder.id}' in parents and trashed = false and name = '${escapeDriveQueryValue(`${slug}.md`)}'`,
    );
    return files[0] ?? null;
  }

  private async parseNote(file: DriveFile): Promise<Note | null> {
    const raw = await this.client.getFileText(file.id);
    const parsed = matter(raw);
    const frontmatter = NoteFrontmatterSchema.parse(parsed.data);
    return {
      ...frontmatter,
      slug: file.name.replace(/\.md$/, ""),
      body: parsed.content,
    };
  }

  private async writeNote(note: Note, fileId?: string): Promise<void> {
    const folder = await this.workspace.getNotesFolder();
    const content = matter.stringify(note.body ?? "", toNoteFrontmatter(note));

    if (fileId) {
      await this.client.updateFile(fileId, content, "text/markdown; charset=utf-8");
      return;
    }

    await this.client.createFile(
      {
        name: `${note.slug}.md`,
        parents: [folder.id],
      },
      content,
      "text/markdown; charset=utf-8",
    );
  }

  async list(): Promise<Note[]> {
    const files = await this.listNoteFiles();
    const notes = await Promise.all(files.map((file) => this.parseNote(file)));
    return notes
      .filter((note): note is Note => Boolean(note))
      .sort((a, b) => b.updatedAt.localeCompare(a.updatedAt));
  }

  async get(slug: string): Promise<Note | null> {
    const file = await this.findBySlug(slug);
    if (!file) return null;
    return this.parseNote(file);
  }

  async create(input: NoteInput): Promise<Note> {
    const data = NoteInputSchema.parse(input);
    const files = await this.listNoteFiles();
    const slugs = new Set(files.map((file) => file.name.replace(/\.md$/, "")));
    let slug = slugify(data.title);
    let suffix = 0;
    while (slugs.has(suffix === 0 ? slug : `${slug}-${suffix}`)) {
      suffix += 1;
    }
    if (suffix > 0) {
      slug = `${slug}-${suffix}`;
    }

    const now = new Date().toISOString();
    const note: Note = {
      id: randomUUID(),
      slug,
      title: data.title,
      tags: data.tags,
      body: data.body,
      createdAt: now,
      updatedAt: now,
      pinned: data.pinned,
      archived: data.archived,
    };

    await this.writeNote(note);
    return note;
  }

  async update(slug: string, input: Partial<NoteInput>): Promise<Note> {
    const file = await this.findBySlug(slug);
    if (!file) {
      throw new Error(`Note not found: ${slug}`);
    }
    const existing = await this.parseNote(file);
    if (!existing) {
      throw new Error(`Note could not be parsed: ${slug}`);
    }

    const merged: Note = {
      ...existing,
      ...input,
      tags: input.tags ?? existing.tags,
      updatedAt: new Date().toISOString(),
    };
    await this.writeNote(merged, file.id);
    return merged;
  }

  async remove(slug: string): Promise<void> {
    const file = await this.findBySlug(slug);
    if (!file) return;
    await this.client.deleteFile(file.id);
  }
}

class DriveTasksStore implements TasksStore {
  constructor(
    private readonly client: DriveClient,
    private readonly workspace: DriveWorkspace,
  ) {}

  private async getTasksFile(): Promise<DriveFile | null> {
    const folder = await this.workspace.getTasksFolder();
    const files = await this.client.listFiles(
      `'${folder.id}' in parents and trashed = false and name = 'tasks.json'`,
    );
    return files[0] ?? null;
  }

  private async readAll(): Promise<Task[]> {
    const file = await this.getTasksFile();
    if (!file) return [];
    const raw = await this.client.getFileText(file.id);
    if (!raw.trim()) return [];
    return TaskListSchema.parse(JSON.parse(raw) as unknown);
  }

  private async writeAll(tasks: Task[]): Promise<void> {
    const folder = await this.workspace.getTasksFolder();
    const payload = JSON.stringify(tasks, null, 2);
    const file = await this.getTasksFile();
    if (file) {
      await this.client.updateFile(file.id, payload, "application/json; charset=utf-8");
      return;
    }
    await this.client.createFile(
      { name: "tasks.json", parents: [folder.id] },
      payload,
      "application/json; charset=utf-8",
    );
  }

  async list(): Promise<Task[]> {
    const tasks = await this.readAll();
    return tasks.sort((a, b) => a.order - b.order || a.createdAt.localeCompare(b.createdAt));
  }

  async create(input: TaskInput): Promise<Task> {
    const data = TaskInputSchema.parse(input);
    const tasks = await this.readAll();
    const now = new Date().toISOString();
    const task = TaskSchema.parse({
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
    const index = tasks.findIndex((task) => task.id === id);
    if (index === -1) {
      throw new Error(`Task not found: ${id}`);
    }
    const merged = TaskSchema.parse({
      ...tasks[index],
      ...data,
      updatedAt: new Date().toISOString(),
    });
    tasks[index] = merged;
    await this.writeAll(tasks);
    return merged;
  }

  async remove(id: string): Promise<void> {
    const tasks = await this.readAll();
    await this.writeAll(tasks.filter((task) => task.id !== id));
  }

  async reorder(ids: string[]): Promise<void> {
    const tasks = await this.readAll();
    const byId = new Map(tasks.map((task) => [task.id, task]));
    const reordered: Task[] = [];
    ids.forEach((id, order) => {
      const task = byId.get(id);
      if (task) {
        reordered.push({ ...task, order, updatedAt: new Date().toISOString() });
      }
    });
    tasks.forEach((task) => {
      if (!ids.includes(task.id)) {
        reordered.push({ ...task, order: reordered.length });
      }
    });
    await this.writeAll(reordered);
  }
}

export function createDriveStorage(options?: DriveStorageOptions): Storage {
  const client = new DriveClient(ensureAccessToken(options?.accessToken));
  const workspace = new DriveWorkspace(client, options?.rootFolderName ?? DEFAULT_ROOT_FOLDER);

  return {
    notes: new DriveNotesStore(client, workspace),
    tasks: new DriveTasksStore(client, workspace),
  };
}
