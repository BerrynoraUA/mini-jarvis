import type { IncomingMessage, ServerResponse } from "node:http";
import { ZodError } from "zod";

import { AuthRequiredError } from "../lib/auth.server";

export interface ApiRequest extends IncomingMessage {
  pathname: string;
  searchParams: URLSearchParams;
  params: Record<string, string>;
  json: () => Promise<unknown>;
}

export type ApiResponse = ServerResponse<IncomingMessage>;
export type ApiHandler = (req: ApiRequest, res: ApiResponse) => Promise<void>;

export function createApiRequest(input: {
  req: IncomingMessage;
  pathname: string;
  searchParams: URLSearchParams;
  params: Record<string, string>;
}): ApiRequest {
  let parsedBody: Promise<unknown> | null = null;

  const json = async () => {
    parsedBody ??= (async () => {
      const chunks: Buffer[] = [];
      for await (const chunk of input.req) {
        chunks.push(Buffer.isBuffer(chunk) ? chunk : Buffer.from(chunk));
      }

      const raw = Buffer.concat(chunks).toString("utf8").trim();
      if (!raw) {
        return null;
      }

      try {
        return JSON.parse(raw) as unknown;
      } catch {
        throw new Error("Invalid JSON body");
      }
    })();

    return parsedBody;
  };

  return Object.assign(input.req, {
    pathname: input.pathname,
    searchParams: input.searchParams,
    params: input.params,
    json,
  });
}

export function sendJson(res: ApiResponse, status: number, payload: unknown) {
  res.statusCode = status;
  res.setHeader("Content-Type", "application/json; charset=utf-8");
  res.end(JSON.stringify(payload));
}

export function redirect(res: ApiResponse, status: number, location: string) {
  res.statusCode = status;
  res.setHeader("Location", location);
  res.end();
}

export function sendMethodNotAllowed(res: ApiResponse, allow: string[]) {
  res.setHeader("Allow", allow.join(", "));
  res.statusCode = 405;
  res.end();
}

export function sendApiError(res: ApiResponse, err: unknown) {
  if (err instanceof AuthRequiredError) {
    return sendJson(res, 401, { error: err.message });
  }
  if (err instanceof ZodError) {
    return sendJson(res, 400, { error: err.flatten() });
  }

  const message = err instanceof Error ? err.message : "Internal error";
  return sendJson(res, 500, { error: message });
}
