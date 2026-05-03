import type { Session, User } from "@supabase/supabase-js";

import {
  createSupabaseAdminClient,
  createSupabaseServerClientForRequest,
  createSupabaseServerClientFromNextHeaders,
  type SupabaseServerRequest,
  type SupabaseServerResponse,
} from "./supabase.server";

const GOOGLE_AUTH_SCOPE = [
  "openid",
  "email",
  "profile",
  "https://www.googleapis.com/auth/drive.file",
].join(" ");

export interface AuthSession {
  provider: "google";
  userId: string;
  email: string;
  name: string;
  picture?: string;
  googleAccessToken?: string;
  googleRefreshToken?: string;
  scope: string;
  supabaseAccessToken: string;
}

export class AuthRequiredError extends Error {
  constructor() {
    super("Authentication is required");
    this.name = "AuthRequiredError";
  }
}

function mustEnv(name: string): string {
  const value = process.env[name]?.trim();
  if (!value) {
    throw new Error(`Missing required environment variable: ${name}`);
  }
  return value;
}

async function postGoogleToken(params: URLSearchParams): Promise<GoogleTokenResponse> {
  const response = await fetch("https://oauth2.googleapis.com/token", {
    method: "POST",
    headers: { "content-type": "application/x-www-form-urlencoded" },
    body: params,
    cache: "no-store",
  });

  if (!response.ok) {
    const message = await response.text().catch(() => response.statusText);
    throw new Error(`Google token exchange failed: ${message || response.statusText}`);
  }

  return (await response.json()) as GoogleTokenResponse;
}

interface GoogleTokenResponse {
  access_token: string;
  expires_in: number;
  refresh_token?: string;
  scope?: string;
  token_type: string;
}

type ProviderSession = Session & {
  provider_token?: string;
  provider_refresh_token?: string;
};

function getGoogleClientId(): string {
  return mustEnv("GOOGLE_CLIENT_ID");
}

function getGoogleClientSecret(): string {
  return mustEnv("GOOGLE_CLIENT_SECRET");
}

function getGoogleMetadata(user: User): {
  refreshToken?: string;
  accessToken?: string;
  scope?: string;
} {
  const metadata = user.user_metadata ?? {};
  return {
    refreshToken:
      typeof metadata.mj_google_refresh_token === "string"
        ? metadata.mj_google_refresh_token
        : undefined,
    accessToken:
      typeof metadata.mj_google_access_token === "string"
        ? metadata.mj_google_access_token
        : undefined,
    scope:
      typeof metadata.mj_google_scope === "string"
        ? metadata.mj_google_scope
        : undefined,
  };
}

function buildAuthSession(user: User, session: ProviderSession | null): AuthSession | null {
  const email = user.email?.trim().toLowerCase();
  if (!email) {
    return null;
  }

  const metadata = getGoogleMetadata(user);
  const fullName =
    typeof user.user_metadata?.full_name === "string"
      ? user.user_metadata.full_name
      : typeof user.user_metadata?.name === "string"
        ? user.user_metadata.name
        : email;
  const picture =
    typeof user.user_metadata?.avatar_url === "string"
      ? user.user_metadata.avatar_url
      : undefined;

  return {
    provider: "google",
    userId: user.id,
    email,
    name: fullName,
    picture,
    googleAccessToken: session?.provider_token ?? metadata.accessToken,
    googleRefreshToken: session?.provider_refresh_token ?? metadata.refreshToken,
    scope: metadata.scope ?? GOOGLE_AUTH_SCOPE,
    supabaseAccessToken: session?.access_token ?? "",
  };
}

export function getGoogleAuthorizationScope(): string {
  return GOOGLE_AUTH_SCOPE;
}

export async function getAuthSession(
  req: SupabaseServerRequest,
  res?: SupabaseServerResponse,
): Promise<AuthSession | null> {
  const supabase = createSupabaseServerClientForRequest(req, res);
  const [{ data: userData, error: userError }, { data: sessionData }] = await Promise.all([
    supabase.auth.getUser(),
    supabase.auth.getSession(),
  ]);

  if (userError || !userData.user) {
    return null;
  }

  return buildAuthSession(userData.user, (sessionData.session as ProviderSession | null) ?? null);
}

export async function getAuthSessionFromCookies(): Promise<AuthSession | null> {
  const supabase = await createSupabaseServerClientFromNextHeaders();
  const [{ data: userData, error: userError }, { data: sessionData }] = await Promise.all([
    supabase.auth.getUser(),
    supabase.auth.getSession(),
  ]);

  if (userError || !userData.user) {
    return null;
  }

  return buildAuthSession(userData.user, (sessionData.session as ProviderSession | null) ?? null);
}

export async function clearAuthSession(
  req: SupabaseServerRequest,
  res?: SupabaseServerResponse,
): Promise<void> {
  const supabase = createSupabaseServerClientForRequest(req, res);
  await supabase.auth.signOut({ scope: "local" });
}

export async function createGoogleAuthorizationUrl(
  origin: string,
  req: SupabaseServerRequest,
  res?: SupabaseServerResponse,
): Promise<string> {
  const supabase = createSupabaseServerClientForRequest(req, res);
  const { data, error } = await supabase.auth.signInWithOAuth({
    provider: "google",
    options: {
      redirectTo: new URL("/api/auth/callback", origin).toString(),
      scopes: GOOGLE_AUTH_SCOPE,
      queryParams: {
        access_type: "offline",
        prompt: "consent",
        include_granted_scopes: "true",
      },
    },
  });

  if (error || !data.url) {
    throw error ?? new Error("Supabase did not return an OAuth redirect URL");
  }

  return data.url;
}

export async function saveAuthSession(): Promise<void> {
  // Supabase persists the PKCE session into cookies during the code exchange.
}

export async function exchangeGoogleCodeForSession(input: {
  code: string;
  origin: string;
  req: SupabaseServerRequest;
  res?: SupabaseServerResponse;
}): Promise<AuthSession> {
  const supabase = createSupabaseServerClientForRequest(input.req, input.res);
  const { data, error } = await supabase.auth.exchangeCodeForSession(input.code);
  if (error || !data.user) {
    throw error ?? new Error("Supabase did not return an authenticated user");
  }

  const session = (data.session as ProviderSession | null) ?? null;
  await persistGoogleProviderTokens(data.user, session);

  const authSession = buildAuthSession(data.user, session);
  if (!authSession) {
    throw new Error("Supabase session did not contain a usable email address");
  }

  return authSession;
}

export async function getValidGoogleAccessToken(session: AuthSession): Promise<string> {
  if (session.googleAccessToken) {
    return session.googleAccessToken;
  }

  if (!session.googleRefreshToken) {
    throw new Error("Google Drive access is missing. Sign in again to reconnect Google Drive.");
  }

  const tokens = await postGoogleToken(
    new URLSearchParams({
      client_id: getGoogleClientId(),
      client_secret: getGoogleClientSecret(),
      refresh_token: session.googleRefreshToken,
      grant_type: "refresh_token",
    }),
  );

  await updateGoogleMetadata(session.userId, {
    mj_google_access_token: tokens.access_token,
    mj_google_refresh_token: tokens.refresh_token ?? session.googleRefreshToken,
    mj_google_scope: tokens.scope ?? session.scope,
  });

  return tokens.access_token;
}

export async function requireAuthSession(
  req: SupabaseServerRequest,
  res?: SupabaseServerResponse,
): Promise<AuthSession> {
  const session = await getAuthSession(req, res);
  if (!session) {
    throw new AuthRequiredError();
  }
  return session;
}

async function updateGoogleMetadata(userId: string, updates: Record<string, string>) {
  const admin = createSupabaseAdminClient();
  const { data, error } = await admin.auth.admin.getUserById(userId);
  if (error || !data.user) {
    throw error ?? new Error("Unable to load Supabase user metadata");
  }

  const nextMetadata = {
    ...(data.user.user_metadata ?? {}),
    ...updates,
  };

  const { error: updateError } = await admin.auth.admin.updateUserById(userId, {
    user_metadata: nextMetadata,
  });
  if (updateError) {
    throw updateError;
  }
}

async function persistGoogleProviderTokens(user: User, session: ProviderSession | null) {
  const updates: Record<string, string> = {};

  if (session?.provider_token) {
    updates.mj_google_access_token = session.provider_token;
  }
  if (session?.provider_refresh_token) {
    updates.mj_google_refresh_token = session.provider_refresh_token;
  }
  if (session?.provider_token || session?.provider_refresh_token) {
    updates.mj_google_scope = GOOGLE_AUTH_SCOPE;
  }

  if (Object.keys(updates).length === 0) {
    return;
  }

  await updateGoogleMetadata(user.id, updates);
}