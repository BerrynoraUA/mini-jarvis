"use client";

import { Plus } from "lucide-react";
import { Button } from "@mini-jarvis/ui";

export function EmptyNotes({ onCreate }: { onCreate: () => void }) {
  return (
    <div className="rounded-2xl border border-dashed border-hairline bg-surface/40 p-12 text-center">
      <p className="font-display text-2xl text-ink">Nothing here yet.</p>
      <p className="mt-2 text-sm text-muted-foreground">
        Begin with a single thought.
      </p>
      <Button onClick={onCreate} className="mt-6">
        <Plus className="mr-1 h-4 w-4" /> New note
      </Button>
    </div>
  );
}
