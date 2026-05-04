"use client";

import type { Note } from "@mini-jarvis/schemas";
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

type NotesListData = { notes: Note[] };

function upsertNote(notes: Note[], next: Note): Note[] {
  const withoutCurrent = notes.filter((note) => note.slug !== next.slug);
  return [next, ...withoutCurrent].sort((a, b) => b.updatedAt.localeCompare(a.updatedAt));
}

function replaceNote(notes: Note[], fromSlug: string, next: Note): Note[] {
  const withoutCurrent = notes.filter((note) => note.slug !== fromSlug && note.slug !== next.slug);
  return [next, ...withoutCurrent].sort((a, b) => b.updatedAt.localeCompare(a.updatedAt));
}

export function NotesTab() {
  const qc = useQueryClient();
  const [query, setQuery] = useState("");
  const [selectedSlug, setSelectedSlug] = useState<string | null>(null);
  const [selectedEditorKey, setSelectedEditorKey] = useState<string | null>(null);
  const [newTitle, setNewTitle] = useState<string | null>(null);
  const titleInputRef = useRef<HTMLInputElement>(null);

  const notes = useQuery({ queryKey: ["notes"], queryFn: notesApi.list });

  const create = useMutation({
    mutationFn: (title: string) =>
      notesApi.create({ title: title.trim() || "Untitled", body: "", tags: [] }),
    onMutate: async (title: string) => {
      await qc.cancelQueries({ queryKey: ["notes"] });

      const previousNotes = qc.getQueryData<NotesListData>(["notes"]);
      const previousSelectedSlug = selectedSlug;
      const now = new Date().toISOString();
      const optimisticSlug = `temp-${Date.now()}`;
      const optimisticNote: Note = {
        id: `optimistic-${Date.now()}`,
        slug: optimisticSlug,
        title: title.trim() || "Untitled",
        body: "",
        tags: [],
        createdAt: now,
        updatedAt: now,
      };

      qc.setQueryData<NotesListData>(["notes"], {
        notes: upsertNote(previousNotes?.notes ?? [], optimisticNote),
      });
      qc.setQueryData(["note", optimisticSlug], { note: optimisticNote });
      setSelectedSlug(optimisticSlug);
      setSelectedEditorKey(optimisticSlug);
      setNewTitle(null);

      return {
        previousNotes,
        previousSelectedSlug,
        previousSelectedEditorKey: selectedEditorKey,
        optimisticSlug,
      };
    },
    onSuccess: ({ note }, _title, context) => {
      const optimisticSlug = context?.optimisticSlug ?? note.slug;
      const optimisticDraft =
        qc.getQueryData<{ note: Note }>(["note", optimisticSlug])?.note ??
        qc
          .getQueryData<NotesListData>(["notes"])
          ?.notes.find((item) => item.slug === optimisticSlug);
      const mergedNote: Note = optimisticDraft
        ? {
            ...note,
            title: optimisticDraft.title,
            body: optimisticDraft.body,
            tags: optimisticDraft.tags,
          }
        : note;

      qc.setQueryData<NotesListData>(["notes"], (current) => ({
        notes: replaceNote(current?.notes ?? [], optimisticSlug, mergedNote),
      }));
      qc.removeQueries({ queryKey: ["note", optimisticSlug], exact: true });
      qc.setQueryData(["note", note.slug], { note: mergedNote });
      setSelectedSlug(note.slug);
      const hasUnsavedDraft =
        mergedNote.title !== note.title ||
        mergedNote.body !== note.body ||
        mergedNote.tags.join("\u0000") !== note.tags.join("\u0000");
      if (!hasUnsavedDraft) {
        void qc.invalidateQueries({ queryKey: ["notes"], refetchType: "active" });
      }
    },
    onError: (err: Error, _title, context) => {
      if (context?.previousNotes) {
        qc.setQueryData(["notes"], context.previousNotes);
      } else {
        qc.removeQueries({ queryKey: ["notes"], exact: true });
      }
      if (context?.optimisticSlug) {
        qc.removeQueries({ queryKey: ["note", context.optimisticSlug], exact: true });
      }
      setSelectedSlug(context?.previousSelectedSlug ?? null);
      setSelectedEditorKey(context?.previousSelectedEditorKey ?? null);
      toast.error(err.message);
    },
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
    <div className="grid gap-6 xl:grid-cols-[minmax(320px,420px)_minmax(0,1fr)] 2xl:grid-cols-[minmax(360px,480px)_minmax(0,1fr)]">
      <section className="flex flex-col gap-4 xl:pr-2">
        <div className="flex flex-wrap items-center justify-between gap-3">
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
              placeholder="Note title..."
              disabled={create.isPending}
              onKeyDown={(e) => {
                if (e.key === "Escape") cancelCreating();
              }}
              className="flex-1"
            />
            <Button type="submit" size="sm" disabled={create.isPending}>
              {create.isPending ? "Creating..." : "Create"}
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
            <p className="text-sm text-muted-foreground">Loading...</p>
          ) : filtered.length === 0 ? (
            <EmptyNotes onCreate={startCreating} />
          ) : (
            <ul className="flex flex-col gap-2">
              {filtered.map((n) => (
                <li key={n.slug}>
                  <NoteCard
                    note={n}
                    active={selectedSlug === n.slug}
                    onSelect={() => {
                      setSelectedSlug(n.slug);
                      setSelectedEditorKey(n.slug);
                    }}
                  />
                </li>
              ))}
            </ul>
          )}
      </section>

      <section className="rounded-3xl border border-hairline bg-surface/30 px-5 pb-3 pt-2 lg:px-7 lg:pb-4 lg:pt-2.5 2xl:px-8 2xl:pb-5 2xl:pt-3">
        {selectedSlug ? (
          <NoteEditor
            key={selectedEditorKey ?? selectedSlug}
            slug={selectedSlug}
            onDeleted={() => {
              setSelectedSlug(null);
              setSelectedEditorKey(null);
            }}
            onSaved={(nextSlug) => setSelectedSlug(nextSlug)}
          />
        ) : (
          <div className="flex h-full min-h-[60vh] flex-col items-center justify-center text-center">
            <p className="font-display text-3xl italic text-ink">Select a note</p>
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
