"use client";

import type { Note } from "@mini-jarvis/schemas";
import { useCallback, useEffect, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Plus, Save, Trash2, X } from "lucide-react";
import { toast } from "sonner";
import { Badge, Button, Input } from "@mini-jarvis/ui";

import { ApiError, notesApi } from "@/lib/api";
import { MarkdownLiveEditor } from "./markdown-live-editor";

type NotesListData = { notes: Note[] };

function getErrorSummary(error: Error): string {
  return error.message.trim() || "Saving the note failed.";
}

function applyNoteToList(notes: Note[], next: Note, previousSlug?: string): Note[] {
  return [
    next,
    ...notes.filter((item) => item.slug !== next.slug && item.slug !== previousSlug),
  ].sort((a, b) => b.updatedAt.localeCompare(a.updatedAt));
}

export function NoteEditor({
  slug,
  onDeleted,
  onSaved,
}: {
  slug: string;
  onDeleted: () => void;
  onSaved?: (nextSlug: string) => void;
}) {
  const qc = useQueryClient();
  const cachedNote = qc
    .getQueryData<NotesListData>(["notes"])
    ?.notes.find((item) => item.slug === slug);

  const note = useQuery({
    queryKey: ["note", slug],
    queryFn: () => notesApi.get(slug),
    initialData: cachedNote ? { note: cachedNote } : undefined,
    enabled: !cachedNote?.id.startsWith("optimistic-"),
  });

  const [title, setTitle] = useState<string | null>(null);
  const [body, setBody] = useState<string | null>(null);
  const [tags, setTags] = useState<string[] | null>(null);
  const [tagDraft, setTagDraft] = useState("");
  const [isAddingTag, setIsAddingTag] = useState(false);
  const [saveError, setSaveError] = useState<ApiError | Error | null>(null);
  const [saveWhenReady, setSaveWhenReady] = useState(false);

  const save = useMutation({
    mutationFn: () =>
      notesApi.update(slug, {
        title: (title ?? note.data?.note.title ?? "").trim() || "Untitled",
        body: body ?? note.data?.note.body ?? "",
        tags: tags ?? note.data?.note.tags ?? [],
      }),
    onSuccess: ({ note: saved }) => {
      setSaveError(null);
      qc.setQueryData<NotesListData>(["notes"], (current) => ({
        notes: applyNoteToList(current?.notes ?? [], saved, slug),
      }));
      qc.setQueryData(["note", saved.slug], { note: saved });
      void qc.invalidateQueries({ queryKey: ["notes"], refetchType: "active" });
      toast.success("Saved");
      if (saved.slug !== slug) onSaved?.(saved.slug);
    },
    onError: (err: Error) => setSaveError(err),
  });

  const remove = useMutation({
    mutationFn: () => notesApi.remove(slug),
    onMutate: async () => {
      await qc.cancelQueries({ queryKey: ["notes"] });

      const previousNotes = qc.getQueryData<NotesListData>(["notes"]);
      const previousNote = qc.getQueryData<{ note: Note }>(["note", slug]);

      qc.setQueryData<NotesListData>(["notes"], {
        notes: (previousNotes?.notes ?? []).filter((item) => item.slug !== slug),
      });
      qc.removeQueries({ queryKey: ["note", slug], exact: true });
      onDeleted();

      return { previousNotes, previousNote };
    },
    onSuccess: () => {
      void qc.invalidateQueries({ queryKey: ["notes"], refetchType: "active" });
      toast.success("Note deleted");
    },
    onError: (err: Error, _vars, context) => {
      if (context?.previousNotes) {
        qc.setQueryData(["notes"], context.previousNotes);
      }
      if (context?.previousNote) {
        qc.setQueryData(["note", slug], context.previousNote);
      }
      onSaved?.(slug);
      toast.error(err.message);
    },
  });

  if (note.isLoading) {
    return <p className="text-sm text-muted-foreground">Loading...</p>;
  }
  if (note.isError || !note.data) {
    return <p className="text-sm text-muted-foreground">Note not found.</p>;
  }

  const loaded = note.data.note;
  const isOptimistic = loaded.id.startsWith("optimistic-");
  const currentBody = body ?? loaded.body;
  const currentTags = tags ?? loaded.tags;

  function updateOptimisticDraft(patch: Partial<Note>) {
    if (!isOptimistic) return;

    const nextNote = { ...loaded, ...patch };
    qc.setQueryData(["note", slug], { note: nextNote });
    qc.setQueryData<NotesListData>(["notes"], (current) => ({
      notes: applyNoteToList(current?.notes ?? [], nextNote),
    }));
  }

  function updateBody(nextBody: string) {
    setBody(nextBody);
    updateOptimisticDraft({ body: nextBody });
  }

  function addTag(rawValue: string) {
    const value = rawValue.trim();
    if (!value) {
      setTagDraft("");
      setIsAddingTag(false);
      return;
    }

    const nextTags = Array.from(new Set([...currentTags, value]));
    setTags(nextTags);
    setTagDraft("");
    setIsAddingTag(false);
    updateOptimisticDraft({ tags: nextTags });
  }

  function removeTag(tag: string) {
    const nextTags = currentTags.filter((item) => item !== tag);
    setTags(nextTags);
    updateOptimisticDraft({ tags: nextTags });
  }

  const triggerSave = useCallback(() => {
    if (isOptimistic) {
      setSaveWhenReady(true);
      return;
    }
    save.mutate();
  }, [isOptimistic, save]);

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "s") {
        e.preventDefault();
        triggerSave();
      }
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [triggerSave]);

  useEffect(() => {
    if (!isOptimistic && saveWhenReady) {
      setSaveWhenReady(false);
      save.mutate();
    }
  }, [isOptimistic, saveWhenReady, save]);

  return (
    <div className="flex flex-col gap-3">
      <div className="-mb-1 flex items-center justify-end gap-2">
        <div className="flex items-center gap-2">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => {
              if (confirm("Delete this note?")) remove.mutate();
            }}
            disabled={isOptimistic || remove.isPending}
            aria-label="Delete note"
          >
            <Trash2 className="h-4 w-4" />
          </Button>
          <Button onClick={triggerSave} disabled={save.isPending}>
            <Save className="mr-1 h-4 w-4" /> {save.isPending ? "Saving..." : "Save"}
          </Button>
        </div>
      </div>

      {saveError ? (
        <div className="rounded-2xl border border-red-300 bg-red-50 px-4 py-3 text-sm text-red-900">
          <p className="font-medium">Could not save note</p>
          <p className="mt-1 whitespace-pre-wrap break-words text-red-800">
            {getErrorSummary(saveError)}
          </p>
        </div>
      ) : null}

      <div className="rounded-[24px] border border-hairline bg-surface/35 px-4 py-3">
        <Input
          value={title ?? loaded.title}
          onChange={(e) => {
            setTitle(e.target.value);
            updateOptimisticDraft({ title: e.target.value });
          }}
          placeholder="Untitled"
          className="h-auto rounded-2xl border border-transparent bg-transparent px-2 py-2 font-display text-3xl text-ink shadow-none focus-visible:border-hairline focus-visible:bg-canvas/75 focus-visible:ring-0"
        />

        <div className="mt-3 border-t border-hairline/80 pt-2.5">
          <div className="flex flex-wrap items-center gap-2">
            {currentTags.map((tag) => (
              <Badge
                key={tag}
                variant="outline"
                className="group gap-1.5 rounded-full border-hairline/70 bg-transparent px-3 py-1 text-[11px] italic tracking-[0.02em] text-muted-foreground"
              >
                <span>{tag}</span>
                <button
                  type="button"
                  onClick={() => removeTag(tag)}
                  className="inline-flex h-4 w-4 items-center justify-center rounded-full text-muted-foreground/70 opacity-0 transition duration-150 group-hover:opacity-100 hover:text-ink"
                  aria-label={`Remove tag ${tag}`}
                >
                  <X className="h-3 w-3" />
                </button>
              </Badge>
            ))}

            {isAddingTag ? (
              <Input
                autoFocus
                value={tagDraft}
                onChange={(e) => setTagDraft(e.target.value)}
                onBlur={() => addTag(tagDraft)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    e.preventDefault();
                    addTag(tagDraft);
                  }
                  if (e.key === "Escape") {
                    setTagDraft("");
                    setIsAddingTag(false);
                  }
                }}
                placeholder="New tag"
                className="h-8 w-32 rounded-full border-hairline bg-canvas px-3 text-xs focus-visible:ring-1"
              />
            ) : (
              <button
                type="button"
                onClick={() => setIsAddingTag(true)}
                className="inline-flex h-8 items-center gap-1 rounded-full border border-dashed border-hairline px-3 text-xs text-muted-foreground transition hover:border-ink/20 hover:text-ink"
              >
                <Plus className="h-3.5 w-3.5" />
                Add tag
              </button>
            )}
          </div>
        </div>
      </div>
      <MarkdownLiveEditor
        documentKey={loaded.id}
        initialValue={currentBody}
        onChange={updateBody}
      />
      <p className="text-xs text-muted-foreground">Ctrl/Cmd+S to save.</p>
    </div>
  );
}
