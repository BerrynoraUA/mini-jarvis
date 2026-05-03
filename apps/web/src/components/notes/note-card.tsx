"use client";

import type { Note } from "@mini-jarvis/schemas";
import { format } from "date-fns";
import { Badge, cn } from "@mini-jarvis/ui";

export function NoteCard({
  note,
  active,
  onSelect,
}: {
  note: Note;
  active: boolean;
  onSelect: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onSelect}
      className={cn(
        "block w-full rounded-2xl border px-5 py-4 text-left transition",
        active
          ? "border-ink bg-ink text-canvas"
          : "border-hairline bg-canvas hover:border-ink/20 hover:shadow-sm",
      )}
    >
      <div className="flex items-start justify-between gap-4">
        <div className="min-w-0 flex-1">
          <h3
            className={cn(
              "truncate font-display text-xl",
              active ? "text-canvas" : "text-ink",
            )}
          >
            {note.title || "Untitled"}
          </h3>
          <p
            className={cn(
              "mt-1 line-clamp-2 text-sm",
              active ? "text-canvas/80" : "text-muted-foreground",
            )}
          >
            {note.body.replace(/[#>*`_\[\]]/g, "").slice(0, 160) || "Empty note"}
          </p>
        </div>
        <span
          className={cn(
            "shrink-0 text-xs uppercase tracking-widest",
            active ? "text-canvas/70" : "text-muted-foreground",
          )}
        >
          {format(new Date(note.updatedAt), "MMM d")}
        </span>
      </div>
      {note.tags.length > 0 && (
        <div className="mt-3 flex flex-wrap gap-1.5">
          {note.tags.map((t) => (
            <Badge key={t} variant={active ? "accent" : "outline"}>
              {t}
            </Badge>
          ))}
        </div>
      )}
    </button>
  );
}
