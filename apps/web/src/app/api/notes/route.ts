import { NextRequest, NextResponse } from "next/server";
import { NoteInputSchema } from "@mini-jarvis/schemas";

import { getRequestStorage } from "@/lib/server-storage";
import { createSupabaseRouteContext, jsonApiError } from "@/lib/route-handler";

export async function GET(req: NextRequest) {
  const { supabaseReq, supabaseRes, applyCookies } = createSupabaseRouteContext(req);

  try {
    const storage = await getRequestStorage(supabaseReq, supabaseRes);
    const notes = await storage.notes.list();
    return applyCookies(NextResponse.json({ notes }));
  } catch (err) {
    return applyCookies(jsonApiError(err));
  }
}

export async function POST(req: NextRequest) {
  const { supabaseReq, supabaseRes, applyCookies } = createSupabaseRouteContext(req);

  try {
    const body = NoteInputSchema.parse(await req.json());
    const storage = await getRequestStorage(supabaseReq, supabaseRes);
    const note = await storage.notes.create(body);
    return applyCookies(NextResponse.json({ note }, { status: 201 }));
  } catch (err) {
    return applyCookies(jsonApiError(err));
  }
}
