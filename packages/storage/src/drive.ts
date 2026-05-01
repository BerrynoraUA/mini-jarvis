import type { NotesStore, Storage, TasksStore } from "./types";

/**
 * Google Drive adapter — stub.
 *
 * Will be implemented after Supabase auth lands. Plan:
 *   - Read user's Google OAuth refresh token from Supabase user metadata.
 *   - Use googleapis Drive v3 client to read/write files under a
 *     `Mini Jarvis/` folder (or App Data folder if we go that route).
 *   - Same on-disk layout as the local adapter:
 *       Mini Jarvis/
 *         notes/<slug>.md   (markdown + YAML frontmatter)
 *         tasks/tasks.json
 *
 * Required env (per-user, not global):
 *   GOOGLE_CLIENT_ID, GOOGLE_CLIENT_SECRET (app-level)
 *   per-user refresh token retrieved at request time via Supabase.
 */
export function createDriveStorage(): Storage {
  const notImplemented = (op: string) => () =>
    Promise.reject(new Error(`Google Drive adapter not configured (${op})`));

  const notes: NotesStore = {
    list: notImplemented("notes.list"),
    get: notImplemented("notes.get"),
    create: notImplemented("notes.create"),
    update: notImplemented("notes.update"),
    remove: notImplemented("notes.remove"),
  };
  const tasks: TasksStore = {
    list: notImplemented("tasks.list"),
    create: notImplemented("tasks.create"),
    update: notImplemented("tasks.update"),
    remove: notImplemented("tasks.remove"),
    reorder: notImplemented("tasks.reorder"),
  };
  return { notes, tasks };
}
