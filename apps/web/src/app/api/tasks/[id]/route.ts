import { NextResponse } from "next/server";
import { ZodError } from "zod";
import { TaskUpdateSchema } from "@mini-jarvis/schemas";
import { getRequestStorage, OnboardingRequiredError } from "@/lib/server-storage";

export const runtime = "nodejs";

interface Ctx {
  params: Promise<{ id: string }>;
}

export async function PATCH(request: Request, { params }: Ctx) {
  const { id } = await params;
  try {
    const body = TaskUpdateSchema.parse(await request.json());
    const task = await (await getRequestStorage()).tasks.update(id, body);
    return NextResponse.json({ task });
  } catch (err) {
    if (err instanceof OnboardingRequiredError) {
      return NextResponse.json({ error: err.message }, { status: 401 });
    }
    if (err instanceof ZodError) {
      return NextResponse.json({ error: err.flatten() }, { status: 400 });
    }
    return NextResponse.json({ error: (err as Error).message }, { status: 500 });
  }
}

export async function DELETE(_req: Request, { params }: Ctx) {
  try {
    const { id } = await params;
    await (await getRequestStorage()).tasks.remove(id);
    return NextResponse.json({ ok: true });
  } catch (err) {
    if (err instanceof OnboardingRequiredError) {
      return NextResponse.json({ error: err.message }, { status: 401 });
    }
    return NextResponse.json({ error: (err as Error).message }, { status: 500 });
  }
}
