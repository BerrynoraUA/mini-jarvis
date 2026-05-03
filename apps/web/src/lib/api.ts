import type { Note, NoteInput, Task, TaskInput, TaskUpdate } from "@mini-jarvis/schemas";

export class ApiError extends Error {
  constructor(
    message: string,
    readonly status: number,
    readonly detail: string,
  ) {
    super(message);
    this.name = "ApiError";
  }
}

function formatApiErrorDetail(payload: unknown): string {
  if (typeof payload === "string") {
    return payload;
  }

  if (payload && typeof payload === "object") {
    if (
      "fieldErrors" in payload ||
      "formErrors" in payload ||
      "error" in payload
    ) {
      return JSON.stringify(payload, null, 2);
    }
  }

  return JSON.stringify(payload, null, 2);
}

function parseApiError(status: number, text: string): ApiError {
  if (!text) {
    return new ApiError(`Request failed: ${status}`, status, `HTTP ${status}`);
  }

  try {
    const payload = JSON.parse(text) as { error?: unknown } | unknown;
    const errorValue =
      payload && typeof payload === "object" && "error" in payload
        ? payload.error
        : payload;

    if (typeof errorValue === "string" && errorValue.trim()) {
      return new ApiError(errorValue, status, text);
    }

    const detail = formatApiErrorDetail(errorValue);
    return new ApiError(`Request failed: ${status}`, status, detail);
  } catch {
    return new ApiError(text, status, text);
  }
}

async function jsonFetch<T>(url: string, init?: RequestInit): Promise<T> {
  const res = await fetch(url, {
    ...init,
    headers: { "content-type": "application/json", ...(init?.headers ?? {}) },
  });
  if (!res.ok) {
    const text = await res.text().catch(() => res.statusText);
    throw parseApiError(res.status, text || res.statusText);
  }
  return (await res.json()) as T;
}

export const notesApi = {
  list: () => jsonFetch<{ notes: Note[] }>("/api/notes"),
  get: (slug: string) => jsonFetch<{ note: Note }>(`/api/notes/${encodeURIComponent(slug)}`),
  create: (input: NoteInput) =>
    jsonFetch<{ note: Note }>("/api/notes", {
      method: "POST",
      body: JSON.stringify(input),
    }),
  update: (slug: string, input: Partial<NoteInput>) =>
    jsonFetch<{ note: Note }>(`/api/notes/${encodeURIComponent(slug)}`, {
      method: "PUT",
      body: JSON.stringify(input),
    }),
  remove: (slug: string) =>
    jsonFetch<{ ok: true }>(`/api/notes/${encodeURIComponent(slug)}`, { method: "DELETE" }),
};

export const tasksApi = {
  list: () => jsonFetch<{ tasks: Task[] }>("/api/tasks"),
  create: (input: TaskInput) =>
    jsonFetch<{ task: Task }>("/api/tasks", { method: "POST", body: JSON.stringify(input) }),
  update: (id: string, input: TaskUpdate) =>
    jsonFetch<{ task: Task }>(`/api/tasks/${id}`, { method: "PATCH", body: JSON.stringify(input) }),
  remove: (id: string) =>
    jsonFetch<{ ok: true }>(`/api/tasks/${id}`, { method: "DELETE" }),
  reorder: (ids: string[]) =>
    jsonFetch<{ ok: true }>("/api/tasks", { method: "PATCH", body: JSON.stringify({ ids }) }),
};
