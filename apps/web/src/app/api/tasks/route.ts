import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { TaskInputSchema } from "@mini-jarvis/schemas";

import { getRequestStorage } from "@/lib/server-storage";
import { createSupabaseRouteContext, jsonApiError } from "@/lib/route-handler";

const ReorderSchema = z.object({ ids: z.array(z.string().uuid()) });

export async function GET(req: NextRequest) {
  const { supabaseReq, supabaseRes, applyCookies } = createSupabaseRouteContext(req);

  try {
    const storage = await getRequestStorage(supabaseReq, supabaseRes);
    const tasks = await storage.tasks.list();
    return applyCookies(NextResponse.json({ tasks }));
  } catch (err) {
    return applyCookies(jsonApiError(err));
  }
}

export async function POST(req: NextRequest) {
  const { supabaseReq, supabaseRes, applyCookies } = createSupabaseRouteContext(req);

  try {
    const body = TaskInputSchema.parse(await req.json());
    const storage = await getRequestStorage(supabaseReq, supabaseRes);
    const task = await storage.tasks.create(body);
    return applyCookies(NextResponse.json({ task }, { status: 201 }));
  } catch (err) {
    return applyCookies(jsonApiError(err));
  }
}

export async function PATCH(req: NextRequest) {
  const { supabaseReq, supabaseRes, applyCookies } = createSupabaseRouteContext(req);

  try {
    const { ids } = ReorderSchema.parse(await req.json());
    const storage = await getRequestStorage(supabaseReq, supabaseRes);
    await storage.tasks.reorder(ids);
    return applyCookies(NextResponse.json({ ok: true }));
  } catch (err) {
    return applyCookies(jsonApiError(err));
  }
}
