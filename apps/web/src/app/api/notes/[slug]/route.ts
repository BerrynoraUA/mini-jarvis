import { NextRequest, NextResponse } from "next/server";
import { NoteInputSchema } from "@mini-jarvis/schemas";

import { getRequestStorage } from "@/lib/server-storage";
import { createSupabaseRouteContext, jsonApiError } from "@/lib/route-handler";

function getSlug(req: NextRequest) {
  const slug = req.nextUrl.pathname.split("/").pop() ?? "";
  return decodeURIComponent(slug).trim();
}

export async function GET(req: NextRequest) {
  const slug = getSlug(req);
  if (!slug) {
    return NextResponse.json({ error: "Missing slug" }, { status: 400 });
  }

  const { supabaseReq, supabaseRes, applyCookies } = createSupabaseRouteContext(req);

  try {
    const storage = await getRequestStorage(supabaseReq, supabaseRes);
    const note = await storage.notes.get(slug);
    if (!note) {
      return applyCookies(NextResponse.json({ error: "not found" }, { status: 404 }));
    }
    return applyCookies(NextResponse.json({ note }));
  } catch (err) {
    return applyCookies(jsonApiError(err));
  }
}

export async function PUT(req: NextRequest) {
  const slug = getSlug(req);
  if (!slug) {
    return NextResponse.json({ error: "Missing slug" }, { status: 400 });
  }

  const { supabaseReq, supabaseRes, applyCookies } = createSupabaseRouteContext(req);

  try {
    const body = NoteInputSchema.partial().parse(await req.json());
    const storage = await getRequestStorage(supabaseReq, supabaseRes);
    const note = await storage.notes.update(slug, body);
    return applyCookies(NextResponse.json({ note }));
  } catch (err) {
    return applyCookies(jsonApiError(err));
  }
}

export async function DELETE(req: NextRequest) {
  const slug = getSlug(req);
  if (!slug) {
    return NextResponse.json({ error: "Missing slug" }, { status: 400 });
  }

  const { supabaseReq, supabaseRes, applyCookies } = createSupabaseRouteContext(req);

  try {
    const storage = await getRequestStorage(supabaseReq, supabaseRes);
    await storage.notes.remove(slug);
    return applyCookies(NextResponse.json({ ok: true }));
  } catch (err) {
    return applyCookies(jsonApiError(err));
  }
}
