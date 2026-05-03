"use client";

import { useMemo, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Plus } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@mini-jarvis/ui";

import { notesApi } from "@/lib/api";
import { EmptyNotes } from "./empty-notes";
import { NoteCard } from "./note-card";
import { NoteEditor } from "./note-editor";
import { NotesSearch } from "./notes-search";

export function NotesTab() {
  const qc = useQueryClient();
  const [query, setQuery] = useState("");
  const [selectedSlug, setSelectedSlug] = useState<string | null>(null);

  const notes = useQuery({ queryKey: ["notes"], queryFn: notesApi.list });

  const create = useMutation({
    mutationFn: () =>
      notesApi.create({ title: "Untitled", body: "", tags: [] }),
    onSuccess: ({ note }) => {
      qc.invalidateQueries({ queryKey: ["notes"] });
      setSelectedSlug(note.slug);
    },
    onError: (err: Error) => toast.error(err.message),
  });

  const filtered = useMemo(() => {
    const list = notes.data?.notes ?? [];
    if (!query.trim()) return list;
    const needle = query.toLowerCase();
    return list.filter(
      (n) =>
        n.title.toLowerCase().includes(needle) ||
        n.body.toLowerCase().includes(needle) ||
        n.tags.some((t) => t.toLowerCase().includes(needle)),
    );
  }, [notes.data, query]);

  return (
    <div className="grid gap-6 lg:grid-cols-[minmax(0,360px)_minmax(0,1fr)]">
      <section className="flex flex-col gap-4">
        <div className="flex items-center justify-between gap-2">
          <h2 className="font-display text-2xl text-ink">Your notes</h2>
          <Button
            size="sm"
            onClick={() => create.mutate()}
            disabled={create.isPending}
          >
            <Plus className="mr-1 h-4 w-4" /> New
          </Button>
        </div>

        <NotesSearch value={query} onChange={setQuery} />

        {notes.isLoading ? (
          <p className="text-sm text-muted-foreground">Loading…</p>
        ) : filtered.length === 0 ? (
          <EmptyNotes onCreate={() => create.mutate()} />
        ) : (
          <ul className="flex flex-col gap-2">
            {filtered.map((n) => (
              <li key={n.slug}>
                <NoteCard
                  note={n}
                  active={selectedSlug === n.slug}
                  onSelect={() => setSelectedSlug(n.slug)}
                />
              </li>
            ))}
          </ul>
        )}
      </section>

      <section className="rounded-3xl border border-hairline bg-surface/30 p-6 lg:p-8">
        {selectedSlug ? (
          <NoteEditor
            key={selectedSlug}
            slug={selectedSlug}
            onDeleted={() => setSelectedSlug(null)}
            onSaved={(nextSlug) => setSelectedSlug(nextSlug)}
          />
        ) : (
          <div className="flex h-full min-h-[60vh] flex-col items-center justify-center text-center">
            <p className="font-display text-3xl italic text-ink">
              Select a note
            </p>
            <p className="mt-2 max-w-sm text-sm text-muted-foreground">
              Pick something from the list, or start a new thought.
            </p>
            <Button
              className="mt-6"
              onClick={() => create.mutate()}
              disabled={create.isPending}
            >
              <Plus className="mr-1 h-4 w-4" /> New note
            </Button>
          </div>
        )}
      </section>
    </div>
  );
}
