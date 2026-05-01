import path from "node:path";

import { createLocalStorage } from "./local";
import { createDriveStorage } from "./drive";
import type { Storage } from "./types";

/**
 * Server-side storage factory.
 *
 * Pick adapter via STORAGE_KIND ("local" | "drive"; default "local").
 * Local root via STORAGE_ROOT (default "<cwd>/.data").
 *
 * Cached per-process so repeated handler calls don't re-instantiate.
 */

let cached: Storage | null = null;

export function getStorage(): Storage {
  if (cached) return cached;
  const kind = (process.env.STORAGE_KIND ?? "local").toLowerCase();
  if (kind === "drive") {
    cached = createDriveStorage();
  } else {
    const root =
      process.env.STORAGE_ROOT ?? path.resolve(process.cwd(), ".data");
    cached = createLocalStorage(root);
  }
  return cached;
}

export type { Storage, NotesStore, TasksStore } from "./types";
