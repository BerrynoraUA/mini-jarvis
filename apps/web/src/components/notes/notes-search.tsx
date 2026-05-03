"use client";

import { Search } from "lucide-react";
import { Input } from "@mini-jarvis/ui";

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
        placeholder="Search by title, body, or tag…"
        className="pl-10"
      />
    </div>
  );
}
