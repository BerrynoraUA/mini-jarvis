import { NextResponse } from "next/server";
import { ZodError } from "zod";
import { NoteInputSchema } from "@mini-jarvis/schemas";
import { getStorage } from "@mini-jarvis/storage/server";

export const runtime = "nodejs";

interface Ctx {
  params: Promise<{ slug: string }>;
}

export async function GET(_req: Request, { params }: Ctx) {
  const { slug } = await params;
  const note = await getStorage().notes.get(slug);
  if (!note) return NextResponse.json({ error: "not found" }, { status: 404 });
  return NextResponse.json({ note });
}

export async function PUT(request: Request, { params }: Ctx) {
  const { slug } = await params;
  try {
    const body = NoteInputSchema.partial().parse(await request.json());
    const note = await getStorage().notes.update(slug, body);
    return NextResponse.json({ note });
  } catch (err) {
    if (err instanceof ZodError) {
      return NextResponse.json({ error: err.flatten() }, { status: 400 });
    }
    return NextResponse.json({ error: (err as Error).message }, { status: 500 });
  }
}

export async function DELETE(_req: Request, { params }: Ctx) {
  const { slug } = await params;
  await getStorage().notes.remove(slug);
  return NextResponse.json({ ok: true });
}
