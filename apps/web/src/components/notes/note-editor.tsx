"use client";

import { useEffect, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Save, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { Button, Input, Textarea } from "@mini-jarvis/ui";

import { ApiError, notesApi } from "@/lib/api";

function getErrorSummary(error: Error): string {
  return error.message.trim() || "Saving the note failed.";
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
  const note = useQuery({
    queryKey: ["note", slug],
    queryFn: () => notesApi.get(slug),
  });

  const [title, setTitle] = useState<string | null>(null);
  const [body, setBody] = useState<string | null>(null);
  const [tagsRaw, setTagsRaw] = useState<string | null>(null);
  const [saveError, setSaveError] = useState<ApiError | Error | null>(null);

  const save = useMutation({
    mutationFn: () =>
      notesApi.update(slug, {
        title: (title ?? note.data?.note.title ?? "").trim() || "Untitled",
        body: body ?? note.data?.note.body ?? "",
        tags: (tagsRaw ?? note.data?.note.tags.join(", ") ?? "")
          .split(",")
          .map((t) => t.trim())
          .filter(Boolean),
      }),
    onSuccess: ({ note: saved }) => {
      setSaveError(null);
      qc.invalidateQueries({ queryKey: ["notes"] });
      qc.setQueryData(["note", saved.slug], { note: saved });
      toast.success("Saved");
      if (saved.slug !== slug) onSaved?.(saved.slug);
    },
    onError: (err: Error) => setSaveError(err),
  });

  const remove = useMutation({
    mutationFn: () => notesApi.remove(slug),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["notes"] });
      toast.success("Note deleted");
      onDeleted();
    },
  });

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "s") {
        e.preventDefault();
        save.mutate();
      }
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [save]);

  if (note.isLoading) {
    return <p className="text-sm text-muted-foreground">Loading…</p>;
  }
  if (note.isError || !note.data) {
    return <p className="text-sm text-muted-foreground">Note not found.</p>;
  }

  const loaded = note.data.note;

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-end gap-2">
        <Button
          variant="ghost"
          size="icon"
          onClick={() => {
            if (confirm("Delete this note?")) remove.mutate();
          }}
          aria-label="Delete note"
        >
          <Trash2 className="h-4 w-4" />
        </Button>
        <Button onClick={() => save.mutate()} disabled={save.isPending}>
          <Save className="mr-1 h-4 w-4" /> {save.isPending ? "Saving…" : "Save"}
        </Button>
      </div>

      {saveError ? (
        <div className="rounded-2xl border border-red-300 bg-red-50 px-4 py-3 text-sm text-red-900">
          <p className="font-medium">Could not save note</p>
          <p className="mt-1 whitespace-pre-wrap break-words text-red-800">
            {getErrorSummary(saveError)}
          </p>
        </div>
      ) : null}

      <Input
        value={title ?? loaded.title}
        onChange={(e) => setTitle(e.target.value)}
        placeholder="Title"
        className="rounded-none border-0 border-b border-hairline bg-transparent px-0 font-display text-4xl h-auto py-2 focus-visible:ring-0"
      />
      <Input
        value={tagsRaw ?? loaded.tags.join(", ")}
        onChange={(e) => setTagsRaw(e.target.value)}
        placeholder="Tags (comma separated)"
        className="rounded-none border-0 bg-transparent px-0 text-sm text-muted-foreground focus-visible:ring-0 h-auto py-1"
      />
      <Textarea
        value={body ?? loaded.body}
        onChange={(e) => setBody(e.target.value)}
        placeholder="Begin writing…"
        className="min-h-[60vh] resize-y border-0 bg-transparent px-0 font-mono text-base leading-relaxed focus-visible:ring-0"
      />
      <p className="text-xs text-muted-foreground">⌘S to save</p>
    </div>
  );
}
