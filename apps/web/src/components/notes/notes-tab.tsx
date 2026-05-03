"use client";

import { useMemo, useRef, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Plus, X } from "lucide-react";
import { toast } from "sonner";
import { Button, Input } from "@mini-jarvis/ui";

import { notesApi } from "@/lib/api";
import { EmptyNotes } from "./empty-notes";
import { NoteCard } from "./note-card";
import { NoteEditor } from "./note-editor";
import { NotesSearch } from "./notes-search";

export function NotesTab() {
  const qc = useQueryClient();
  const [query, setQuery] = useState("");
  const [selectedSlug, setSelectedSlug] = useState<string | null>(null);
  const [newTitle, setNewTitle] = useState<string | null>(null);
  const titleInputRef = useRef<HTMLInputElement>(null);

  const notes = useQuery({ queryKey: ["notes"], queryFn: notesApi.list });

  const create = useMutation({
    mutationFn: (title: string) =>
      notesApi.create({ title: title.trim() || "Untitled", body: "", tags: [] }),
    onSuccess: ({ note }) => {
      qc.invalidateQueries({ queryKey: ["notes"] });
      setSelectedSlug(note.slug);
      setNewTitle(null);
    },
    onError: (err: Error) => toast.error(err.message),
  });

  function startCreating() {
    setNewTitle("");
    setTimeout(() => titleInputRef.current?.focus(), 0);
  }

  function cancelCreating() {
    setNewTitle(null);
  }

  function submitCreate() {
    if (create.isPending) return;
    create.mutate(newTitle ?? "");
  }

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
          {newTitle === null && (
            <Button size="sm" onClick={startCreating}>
              <Plus className="mr-1 h-4 w-4" /> New
            </Button>
          )}
        </div>

        {newTitle !== null && (
          <form
            className="flex items-center gap-2"
            onSubmit={(e) => {
              e.preventDefault();
              submitCreate();
            }}
          >
            <Input
              ref={titleInputRef}
              value={newTitle}
              onChange={(e) => setNewTitle(e.target.value)}
              placeholder="Note title…"
              disabled={create.isPending}
              onKeyDown={(e) => {
                if (e.key === "Escape") cancelCreating();
              }}
              className="flex-1"
            />
            <Button type="submit" size="sm" disabled={create.isPending}>
              {create.isPending ? "Creating…" : "Create"}
            </Button>
            <Button
              type="button"
              size="icon"
              variant="ghost"
              onClick={cancelCreating}
              disabled={create.isPending}
              aria-label="Cancel"
            >
              <X className="h-4 w-4" />
            </Button>
          </form>
        )}

        <NotesSearch value={query} onChange={setQuery} />

        {notes.isLoading ? (
          <p className="text-sm text-muted-foreground">Loading…</p>
        ) : filtered.length === 0 ? (
          <EmptyNotes onCreate={startCreating} />
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
            <Button className="mt-6" onClick={startCreating}>
              <Plus className="mr-1 h-4 w-4" /> New note
            </Button>
          </div>
        )}
      </section>
    </div>
  );
}
