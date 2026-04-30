import { NextResponse } from "next/server";
import { ZodError, z } from "zod";
import { TaskInputSchema } from "@mini-jarvis/schemas";
import { getStorage } from "@mini-jarvis/storage/server";

export const runtime = "nodejs";

const ReorderSchema = z.object({ ids: z.array(z.string().uuid()) });

export async function GET() {
  const tasks = await getStorage().tasks.list();
  return NextResponse.json({ tasks });
}

export async function POST(request: Request) {
  try {
    const body = TaskInputSchema.parse(await request.json());
    const task = await getStorage().tasks.create(body);
    return NextResponse.json({ task }, { status: 201 });
  } catch (err) {
    if (err instanceof ZodError) {
      return NextResponse.json({ error: err.flatten() }, { status: 400 });
    }
    return NextResponse.json({ error: (err as Error).message }, { status: 500 });
  }
}

/** PATCH /api/tasks { ids: [...] } — bulk reorder */
export async function PATCH(request: Request) {
  try {
    const { ids } = ReorderSchema.parse(await request.json());
    await getStorage().tasks.reorder(ids);
    return NextResponse.json({ ok: true });
  } catch (err) {
    if (err instanceof ZodError) {
      return NextResponse.json({ error: err.flatten() }, { status: 400 });
    }
    return NextResponse.json({ error: (err as Error).message }, { status: 500 });
  }
}
