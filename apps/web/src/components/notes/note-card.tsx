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
          ? "border-terracotta/55 bg-[#F1E7DB] text-ink shadow-[0_10px_30px_rgba(212,152,106,0.12)]"
          : "border-hairline bg-canvas hover:border-ink/20 hover:shadow-sm",
      )}
    >
      <div className="flex items-start justify-between gap-4">
        <div className="min-w-0 flex-1">
          <h3
            className={cn(
              "truncate font-display text-xl",
              active ? "text-ink" : "text-ink",
            )}
          >
            {note.title || "Untitled"}
          </h3>
          <p
            className={cn(
              "mt-1 line-clamp-2 text-sm",
              active ? "text-ink/75" : "text-muted-foreground",
            )}
          >
            {note.body.replace(/[#>*`_\[\]]/g, "").slice(0, 160) || "Empty note"}
          </p>
        </div>
        <span
          className={cn(
            "shrink-0 text-xs uppercase tracking-widest",
            active ? "text-ink/55" : "text-muted-foreground",
          )}
        >
          {format(new Date(note.updatedAt), "MMM d")}
        </span>
      </div>
      {note.tags.length > 0 && (
        <div className="mt-3 flex flex-wrap gap-2">
          {note.tags.map((t) => (
            <Badge
              key={t}
              variant="outline"
              className={cn(
                "max-w-full shrink-0 rounded-full px-3 py-1 text-xs italic leading-none whitespace-nowrap",
                active
                  ? "border-terracotta/35 bg-canvas/55 text-ink/80"
                  : "border-hairline/80 bg-transparent text-muted-foreground",
              )}
            >
              {t}
            </Badge>
          ))}
        </div>
      )}
    </button>
  );
}
