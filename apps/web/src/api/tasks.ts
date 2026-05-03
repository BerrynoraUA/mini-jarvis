import { z } from "zod";
import { TaskInputSchema, TaskUpdateSchema } from "@mini-jarvis/schemas";

import { getRequestStorage } from "../lib/server-storage";

import { type ApiHandler, sendApiError, sendJson, sendMethodNotAllowed } from "./shared";

const ReorderSchema = z.object({ ids: z.array(z.string().uuid()) });

export const handleTasks: ApiHandler = async (req, res) => {
  try {
    const storage = await getRequestStorage(req, res);

    if (req.method === "GET") {
      const tasks = await storage.tasks.list();
      return sendJson(res, 200, { tasks });
    }

    if (req.method === "POST") {
      const body = TaskInputSchema.parse(await req.json());
      const task = await storage.tasks.create(body);
      return sendJson(res, 201, { task });
    }

    if (req.method === "PATCH") {
      const { ids } = ReorderSchema.parse(await req.json());
      await storage.tasks.reorder(ids);
      return sendJson(res, 200, { ok: true });
    }

    return sendMethodNotAllowed(res, ["GET", "POST", "PATCH"]);
  } catch (err) {
    return sendApiError(res, err);
  }
};

export const handleTaskById: ApiHandler = async (req, res) => {
  const id = req.params.id ?? "";
  if (!id) {
    return sendJson(res, 400, { error: "Missing id" });
  }

  try {
    const storage = await getRequestStorage(req, res);

    if (req.method === "PATCH") {
      const body = TaskUpdateSchema.parse(await req.json());
      const task = await storage.tasks.update(id, body);
      return sendJson(res, 200, { task });
    }

    if (req.method === "DELETE") {
      await storage.tasks.remove(id);
      return sendJson(res, 200, { ok: true });
    }

    return sendMethodNotAllowed(res, ["PATCH", "DELETE"]);
  } catch (err) {
    return sendApiError(res, err);
  }
};
