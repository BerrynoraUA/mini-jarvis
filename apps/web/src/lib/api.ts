import type { Note, NoteInput, Task, TaskInput, TaskUpdate } from "@mini-jarvis/schemas";

async function jsonFetch<T>(url: string, init?: RequestInit): Promise<T> {
  const res = await fetch(url, {
    ...init,
    headers: { "content-type": "application/json", ...(init?.headers ?? {}) },
  });
  if (!res.ok) {
    const text = await res.text().catch(() => res.statusText);
    throw new Error(text || `Request failed: ${res.status}`);
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
