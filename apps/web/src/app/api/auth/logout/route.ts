import { NextRequest, NextResponse } from "next/server";

import { clearAuthSession } from "@/lib/auth.server";
import { createSupabaseRouteContext } from "@/lib/route-handler";

async function logout(req: NextRequest) {
  const { supabaseReq, supabaseRes, applyCookies } = createSupabaseRouteContext(req);
  await clearAuthSession(supabaseReq, supabaseRes);
  return applyCookies(NextResponse.redirect(new URL("/login", req.url), { status: 303 }));
}

export async function GET(req: NextRequest) {
  return logout(req);
}

export async function POST(req: NextRequest) {
  return logout(req);
}
