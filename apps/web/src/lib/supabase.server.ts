import { createServerClient } from "@supabase/ssr";
import { createClient } from "@supabase/supabase-js";
import type { IncomingMessage, ServerResponse } from "node:http";
import { parse, serialize } from "cookie";

type CookieMutation = {
  name: string;
  value: string;
  options?: Parameters<typeof serialize>[2];
};

export type SupabaseServerRequest = Pick<IncomingMessage, "headers">;
export type SupabaseServerResponse = Pick<
  ServerResponse<IncomingMessage>,
  "getHeader" | "setHeader"
>;

function mustEnv(name: string): string {
  const value = process.env[name]?.trim();
  if (!value) {
    throw new Error(`Missing required environment variable: ${name}`);
  }
  return value;
}

function getSupabaseUrl(): string {
  return mustEnv("NEXT_PUBLIC_SUPABASE_URL");
}

function getSupabasePublishableKey(): string {
  return mustEnv("NEXT_PUBLIC_SUPABASE_PUBLISHABLE_DEFAULT_KEY");
}

export async function createSupabaseServerClient() {
  return createServerClient(getSupabaseUrl(), getSupabasePublishableKey(), {
    cookies: {
      getAll() {
        return [];
      },
    },
  });
}

export async function createSupabaseServerClientFromNextHeaders() {
  const { cookies } = await import("next/headers");
  const cookieStore = await cookies();
  return createServerClient(getSupabaseUrl(), getSupabasePublishableKey(), {
    cookies: {
      getAll() {
        return cookieStore.getAll();
      },
      setAll(cookiesToSet) {
        try {
          cookiesToSet.forEach(({ name, value, options }) =>
            cookieStore.set(name, value, options),
          );
        } catch {
          // Called from a Server Component — mutations are a no-op here
        }
      },
    },
  });
}

function readCookies(req: SupabaseServerRequest) {
  const parsed = parse(req.headers.cookie ?? "");
  return Object.entries(parsed).map(([name, value]) => ({ name, value }));
}

function appendCookies(res: SupabaseServerResponse, cookiesToSet: CookieMutation[]) {
  const existing = res.getHeader("Set-Cookie");
  const current = Array.isArray(existing)
    ? existing.map(String)
    : existing
      ? [String(existing)]
      : [];

  const next = cookiesToSet.map(({ name, value, options }) =>
    serialize(name, value, { path: "/", ...options }),
  );

  res.setHeader("Set-Cookie", [...current, ...next]);
}

export function createSupabaseServerClientForRequest(
  req: SupabaseServerRequest,
  res?: SupabaseServerResponse,
) {
  return createServerClient(getSupabaseUrl(), getSupabasePublishableKey(), {
    cookies: {
      getAll() {
        return readCookies(req);
      },
      setAll(cookiesToSet: CookieMutation[]) {
        if (res) {
          appendCookies(res, cookiesToSet);
        }
      },
    },
  });
}

export function createSupabaseAdminClient() {
  return createClient(getSupabaseUrl(), mustEnv("SUPABASE_SERVICE_ROLE_KEY"), {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  });
}