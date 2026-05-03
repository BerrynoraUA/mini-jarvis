import type { NextApiResponse } from "next";
import { ZodError } from "zod";

import { AuthRequiredError } from "./auth.server";

export function sendApiError(res: NextApiResponse, err: unknown) {
  if (err instanceof AuthRequiredError) {
    return res.status(401).json({ error: err.message });
  }
  if (err instanceof ZodError) {
    return res.status(400).json({ error: err.flatten() });
  }
  return res.status(500).json({ error: (err as Error).message ?? "Internal error" });
}
