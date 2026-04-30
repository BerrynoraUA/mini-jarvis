import { NextResponse } from "next/server";
import { ZodError } from "zod";
import { NoteInputSchema } from "@mini-jarvis/schemas";
import { getStorage } from "@mini-jarvis/storage/server";

export const runtime = "nodejs";

export async function GET() {
  const notes = await getStorage().notes.list();
  return NextResponse.json({ notes });
}

export async function POST(request: Request) {
  try {
    const body = NoteInputSchema.parse(await request.json());
    const note = await getStorage().notes.create(body);
    return NextResponse.json({ note }, { status: 201 });
  } catch (err) {
    if (err instanceof ZodError) {
      return NextResponse.json({ error: err.flatten() }, { status: 400 });
    }
    return NextResponse.json({ error: (err as Error).message }, { status: 500 });
  }
}
