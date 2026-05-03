import type { IncomingMessage, ServerResponse } from "node:http";

import { handleAuthCallback, handleGoogleAuth, handleLogout } from "./auth";
import { handleNoteBySlug, handleNotes } from "./notes";
import { createApiRequest, type ApiHandler, sendMethodNotAllowed } from "./shared";
import { handleTaskById, handleTasks } from "./tasks";

type Route = {
  pattern: RegExp;
  methods: Partial<Record<string, ApiHandler>>;
  params: (match: RegExpMatchArray) => Record<string, string>;
};

const routes: Route[] = [
  {
    pattern: /^\/api\/auth\/google\/?$/,
    methods: { GET: handleGoogleAuth },
    params: () => ({}),
  },
  {
    pattern: /^\/api\/auth\/callback\/?$/,
    methods: { GET: handleAuthCallback },
    params: () => ({}),
  },
  {
    pattern: /^\/api\/auth\/logout\/?$/,
    methods: { GET: handleLogout, POST: handleLogout },
    params: () => ({}),
  },
  {
    pattern: /^\/api\/notes\/?$/,
    methods: { GET: handleNotes, POST: handleNotes },
    params: () => ({}),
  },
  {
    pattern: /^\/api\/notes\/([^/]+)\/?$/,
    methods: { GET: handleNoteBySlug, PUT: handleNoteBySlug, DELETE: handleNoteBySlug },
    params: (match) => ({ slug: decodeURIComponent(match[1] ?? "") }),
  },
  {
    pattern: /^\/api\/tasks\/?$/,
    methods: { GET: handleTasks, POST: handleTasks, PATCH: handleTasks },
    params: () => ({}),
  },
  {
    pattern: /^\/api\/tasks\/([^/]+)\/?$/,
    methods: { PATCH: handleTaskById, DELETE: handleTaskById },
    params: (match) => ({ id: decodeURIComponent(match[1] ?? "") }),
  },
];

export async function handleApiRequest(req: IncomingMessage, res: ServerResponse<IncomingMessage>) {
  const base = `http://${req.headers.host ?? "localhost"}`;
  const url = new URL(req.url ?? "/", base);

  for (const route of routes) {
    const match = url.pathname.match(route.pattern);
    if (!match) {
      continue;
    }

    const method = (req.method ?? "GET").toUpperCase();
    const handler = route.methods[method];
    if (!handler) {
      sendMethodNotAllowed(res, Object.keys(route.methods));
      return true;
    }

    const apiReq = createApiRequest({
      req,
      pathname: url.pathname,
      searchParams: url.searchParams,
      params: route.params(match),
    });

    await handler(apiReq, res);
    return true;
  }

  return false;
}
