import { NextResponse } from "next/server";
import { ZodError } from "zod";
import { NoteInputSchema } from "@mini-jarvis/schemas";
import { getRequestStorage, OnboardingRequiredError } from "@/lib/server-storage";

export const runtime = "nodejs";

interface Ctx {
  params: Promise<{ slug: string }>;
}

export async function GET(_req: Request, { params }: Ctx) {
  try {
    const { slug } = await params;
    const note = await (await getRequestStorage()).notes.get(slug);
    if (!note) {
      return NextResponse.json({ error: "not found" }, { status: 404 });
    }
    return NextResponse.json({ note });
  } catch (err) {
    if (err instanceof OnboardingRequiredError) {
      return NextResponse.json({ error: err.message }, { status: 401 });
    }
    return NextResponse.json({ error: (err as Error).message }, { status: 500 });
  }
}

export async function PUT(request: Request, { params }: Ctx) {
  const { slug } = await params;
  try {
    const body = NoteInputSchema.partial().parse(await request.json());
    const note = await (await getRequestStorage()).notes.update(slug, body);
    return NextResponse.json({ note });
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
    const { slug } = await params;
    await (await getRequestStorage()).notes.remove(slug);
    return NextResponse.json({ ok: true });
  } catch (err) {
    if (err instanceof OnboardingRequiredError) {
      return NextResponse.json({ error: err.message }, { status: 401 });
    }
    return NextResponse.json({ error: (err as Error).message }, { status: 500 });
  }
}
