import { clearAuthSession, createGoogleAuthorizationUrl, exchangeGoogleCodeForSession } from "../lib/auth.server";

import { type ApiHandler, redirect, sendMethodNotAllowed } from "./shared";

function getOrigin(req: Parameters<ApiHandler>[0]) {
  const isEncrypted = (req.socket as { encrypted?: boolean } | null)?.encrypted === true;
  const protocol = req.headers["x-forwarded-proto"] ?? (isEncrypted ? "https" : "http");
  const host = req.headers.host;
  if (!host) {
    throw new Error("Missing host header");
  }

  return `${protocol}://${host}`;
}

export const handleGoogleAuth: ApiHandler = async (req, res) => {
  if (req.method !== "GET") {
    return sendMethodNotAllowed(res, ["GET"]);
  }

  try {
    const url = await createGoogleAuthorizationUrl(getOrigin(req), req, res);
    redirect(res, 302, url);
  } catch (error) {
    const message = encodeURIComponent(error instanceof Error ? error.message : "auth_error");
    redirect(res, 302, `/login?error=${message}`);
  }
};

export const handleAuthCallback: ApiHandler = async (req, res) => {
  if (req.method !== "GET") {
    return sendMethodNotAllowed(res, ["GET"]);
  }

  const code = req.searchParams.get("code");
  const oauthError = req.searchParams.get("error");

  if (oauthError) {
    return redirect(res, 302, `/login?error=${encodeURIComponent(oauthError)}`);
  }
  if (!code) {
    return redirect(res, 302, "/login?error=missing_code");
  }

  try {
    await exchangeGoogleCodeForSession({ code, origin: getOrigin(req), req, res });
    redirect(res, 302, "/");
  } catch (error) {
    const message = encodeURIComponent(error instanceof Error ? error.message : "auth_error");
    redirect(res, 302, `/login?error=${message}`);
  }
};

export const handleLogout: ApiHandler = async (req, res) => {
  if (req.method !== "GET" && req.method !== "POST") {
    return sendMethodNotAllowed(res, ["GET", "POST"]);
  }

  await clearAuthSession(req, res);
  redirect(res, 303, "/login");
};
