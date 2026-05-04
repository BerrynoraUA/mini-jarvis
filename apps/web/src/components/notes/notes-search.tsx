"use client";

import { Search, X } from "lucide-react";
import { Button, Input } from "@mini-jarvis/ui";

export function NotesSearch({
  value,
  onChange,
}: {
  value: string;
  onChange: (next: string) => void;
}) {
  return (
    <div className="relative">
      <Search className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
      <Input
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder="Search by title, body, or tag..."
        className="h-11 rounded-2xl border-hairline bg-canvas/85 pl-10 pr-11 shadow-none focus-visible:ring-1"
      />
      {value ? (
        <Button
          type="button"
          variant="ghost"
          size="icon"
          onClick={() => onChange("")}
          className="absolute right-1.5 top-1/2 h-8 w-8 -translate-y-1/2 rounded-full text-muted-foreground hover:text-ink"
          aria-label="Clear search"
        >
          <X className="h-4 w-4" />
        </Button>
      ) : null}
    </div>
  );
}
