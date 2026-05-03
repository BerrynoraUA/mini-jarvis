import { NoteInputSchema } from "@mini-jarvis/schemas";

import { getRequestStorage } from "../lib/server-storage";

import { type ApiHandler, sendApiError, sendJson, sendMethodNotAllowed } from "./shared";

export const handleNotes: ApiHandler = async (req, res) => {
  try {
    const storage = await getRequestStorage(req, res);

    if (req.method === "GET") {
      const notes = await storage.notes.list();
      return sendJson(res, 200, { notes });
    }

    if (req.method === "POST") {
      const body = NoteInputSchema.parse(await req.json());
      const note = await storage.notes.create(body);
      return sendJson(res, 201, { note });
    }

    return sendMethodNotAllowed(res, ["GET", "POST"]);
  } catch (err) {
    return sendApiError(res, err);
  }
};

export const handleNoteBySlug: ApiHandler = async (req, res) => {
  const slug = req.params.slug ?? "";
  if (!slug) {
    return sendJson(res, 400, { error: "Missing slug" });
  }

  try {
    const storage = await getRequestStorage(req, res);

    if (req.method === "GET") {
      const note = await storage.notes.get(slug);
      if (!note) {
        return sendJson(res, 404, { error: "not found" });
      }
      return sendJson(res, 200, { note });
    }

    if (req.method === "PUT") {
      const body = NoteInputSchema.partial().parse(await req.json());
      const note = await storage.notes.update(slug, body);
      return sendJson(res, 200, { note });
    }

    if (req.method === "DELETE") {
      await storage.notes.remove(slug);
      return sendJson(res, 200, { ok: true });
    }

    return sendMethodNotAllowed(res, ["GET", "PUT", "DELETE"]);
  } catch (err) {
    return sendApiError(res, err);
  }
};
