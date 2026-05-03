import { NextRequest, NextResponse } from "next/server";

import { exchangeGoogleCodeForSession } from "@/lib/auth.server";
import { createSupabaseRouteContext } from "@/lib/route-handler";

export async function GET(req: NextRequest) {
  const { supabaseReq, supabaseRes, applyCookies } = createSupabaseRouteContext(req);

  const code = req.nextUrl.searchParams.get("code");
  const oauthError = req.nextUrl.searchParams.get("error");

  if (oauthError) {
    return applyCookies(
      NextResponse.redirect(new URL(`/login?error=${encodeURIComponent(oauthError)}`, req.url), {
        status: 302,
      }),
    );
  }
  if (!code) {
    return applyCookies(NextResponse.redirect(new URL("/login?error=missing_code", req.url), { status: 302 }));
  }

  try {
    const protocol = req.headers.get("x-forwarded-proto") ?? "http";
    const host = req.headers.get("host");
    if (!host) {
      throw new Error("Missing host header");
    }

    const origin = `${protocol}://${host}`;
    await exchangeGoogleCodeForSession({ code, origin, req: supabaseReq, res: supabaseRes });
    return applyCookies(NextResponse.redirect(new URL("/", req.url), { status: 302 }));
  } catch (error) {
    const message = encodeURIComponent(error instanceof Error ? error.message : "auth_error");
    return applyCookies(NextResponse.redirect(new URL(`/login?error=${message}`, req.url), { status: 302 }));
  }
}
