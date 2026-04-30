"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Plus, Search } from "lucide-react";
import { Badge, Button, Input } from "@mini-jarvis/ui";
import { notesApi } from "@/lib/api";
import { format } from "date-fns";

export default function NotesIndexPage() {
  const [q, setQ] = useState("");
  const notes = useQuery({ queryKey: ["notes"], queryFn: notesApi.list });

  const filtered = useMemo(() => {
    const list = notes.data?.notes ?? [];
    if (!q.trim()) return list;
    const needle = q.toLowerCase();
    return list.filter(
      (n) =>
        n.title.toLowerCase().includes(needle) ||
        n.body.toLowerCase().includes(needle) ||
        n.tags.some((t) => t.toLowerCase().includes(needle)),
    );
  }, [notes.data, q]);

  return (
    <div className="mx-auto flex max-w-5xl flex-col gap-8">
      <header className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <span className="text-[11px] font-medium uppercase tracking-[0.2em] text-muted-foreground">
            Library
          </span>
          <h1 className="font-display text-4xl text-ink">
            Notes — <em className="italic text-terracotta">a quiet place</em>
          </h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Markdown with frontmatter. Saved on demand.
          </p>
        </div>
        <Link href="/app/notes/new">
          <Button>
            <Plus className="mr-1 h-4 w-4" /> New note
          </Button>
        </Link>
      </header>

      <div className="relative">
        <Search className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <Input
          value={q}
          onChange={(e) => setQ(e.target.value)}
          placeholder="Search by title, body, or tag…"
          className="pl-10"
        />
      </div>

      {notes.isLoading ? (
        <p className="text-sm text-muted-foreground">Loading…</p>
      ) : filtered.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-hairline bg-surface/40 p-12 text-center">
          <p className="font-display text-2xl text-ink">Nothing here yet.</p>
          <p className="mt-2 text-sm text-muted-foreground">
            Begin with a single thought.
          </p>
          <Link href="/app/notes/new" className="mt-6 inline-flex">
            <Button>
              <Plus className="mr-1 h-4 w-4" /> New note
            </Button>
          </Link>
        </div>
      ) : (
        <ul className="grid gap-3">
          {filtered.map((n) => (
            <li key={n.slug}>
              <Link
                href={`/app/notes/${n.slug}`}
                className="group block rounded-2xl border border-hairline bg-canvas px-5 py-4 transition hover:border-ink/20 hover:shadow-sm"
              >
                <div className="flex items-start justify-between gap-4">
                  <div className="min-w-0 flex-1">
                    <h2 className="font-display text-2xl text-ink">{n.title}</h2>
                    <p className="mt-1 line-clamp-2 text-sm text-muted-foreground">
                      {n.body.replace(/[#>*`_\[\]]/g, "").slice(0, 200) || "Empty note"}
                    </p>
                  </div>
                  <span className="shrink-0 text-xs uppercase tracking-widest text-muted-foreground">
                    {format(new Date(n.updatedAt), "MMM d")}
                  </span>
                </div>
                {n.tags.length > 0 && (
                  <div className="mt-3 flex flex-wrap gap-1.5">
                    {n.tags.map((t) => (
                      <Badge key={t} variant="outline">
                        {t}
                      </Badge>
                    ))}
                  </div>
                )}
              </Link>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
