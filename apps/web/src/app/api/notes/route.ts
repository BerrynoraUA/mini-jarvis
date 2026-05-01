import { NextResponse } from "next/server";
import { ZodError } from "zod";
import { NoteInputSchema } from "@mini-jarvis/schemas";
import { getRequestStorage, OnboardingRequiredError } from "@/lib/server-storage";

export const runtime = "nodejs";

export async function GET() {
  try {
    const notes = await (await getRequestStorage()).notes.list();
    return NextResponse.json({ notes });
  } catch (err) {
    if (err instanceof OnboardingRequiredError) {
      return NextResponse.json({ error: err.message }, { status: 401 });
    }
    return NextResponse.json({ error: (err as Error).message }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const body = NoteInputSchema.parse(await request.json());
    const note = await (await getRequestStorage()).notes.create(body);
    return NextResponse.json({ note }, { status: 201 });
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
