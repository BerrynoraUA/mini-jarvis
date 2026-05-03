import { NextRequest, NextResponse } from "next/server";
import { TaskUpdateSchema } from "@mini-jarvis/schemas";

import { getRequestStorage } from "@/lib/server-storage";
import { createSupabaseRouteContext, jsonApiError } from "@/lib/route-handler";

function getId(req: NextRequest) {
  const id = req.nextUrl.pathname.split("/").pop() ?? "";
  return decodeURIComponent(id).trim();
}

export async function PATCH(req: NextRequest) {
  const id = getId(req);
  if (!id) {
    return NextResponse.json({ error: "Missing id" }, { status: 400 });
  }

  const { supabaseReq, supabaseRes, applyCookies } = createSupabaseRouteContext(req);

  try {
    const body = TaskUpdateSchema.parse(await req.json());
    const storage = await getRequestStorage(supabaseReq, supabaseRes);
    const task = await storage.tasks.update(id, body);
    return applyCookies(NextResponse.json({ task }));
  } catch (err) {
    return applyCookies(jsonApiError(err));
  }
}

export async function DELETE(req: NextRequest) {
  const id = getId(req);
  if (!id) {
    return NextResponse.json({ error: "Missing id" }, { status: 400 });
  }

  const { supabaseReq, supabaseRes, applyCookies } = createSupabaseRouteContext(req);

  try {
    const storage = await getRequestStorage(supabaseReq, supabaseRes);
    await storage.tasks.remove(id);
    return applyCookies(NextResponse.json({ ok: true }));
  } catch (err) {
    return applyCookies(jsonApiError(err));
  }
}
