"use client";

import { use, useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { ArrowLeft, Save, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { Button, Input, Textarea } from "@mini-jarvis/ui";
import { notesApi } from "@/lib/api";

export default function NotePage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = use(params);
  const router = useRouter();
  const qc = useQueryClient();

  const note = useQuery({
    queryKey: ["note", slug],
    queryFn: () => notesApi.get(slug),
  });

  const [title, setTitle] = useState("");
  const [body, setBody] = useState("");
  const [tagsRaw, setTagsRaw] = useState("");
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    if (note.data && !hydrated) {
      setTitle(note.data.note.title);
      setBody(note.data.note.body);
      setTagsRaw(note.data.note.tags.join(", "));
      setHydrated(true);
    }
  }, [note.data, hydrated]);

  const save = useMutation({
    mutationFn: () =>
      notesApi.update(slug, {
        title: title.trim() || "Untitled",
        body,
        tags: tagsRaw
          .split(",")
          .map((t) => t.trim())
          .filter(Boolean),
      }),
    onSuccess: ({ note: saved }) => {
      qc.invalidateQueries({ queryKey: ["notes"] });
      qc.setQueryData(["note", slug], { note: saved });
      toast.success("Saved");
      if (saved.slug !== slug) router.replace(`/app/notes/${saved.slug}`);
    },
    onError: (err: Error) => toast.error(err.message),
  });

  const remove = useMutation({
    mutationFn: () => notesApi.remove(slug),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["notes"] });
      toast.success("Note deleted");
      router.replace("/app/notes");
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
  if (note.isError) {
    return (
      <div className="mx-auto max-w-2xl text-center">
        <p className="font-display text-3xl">Note not found</p>
        <Link
          href="/app/notes"
          className="mt-4 inline-flex text-sm text-muted-foreground hover:text-ink"
        >
          ← Back to notes
        </Link>
      </div>
    );
  }

  return (
    <div className="mx-auto flex max-w-3xl flex-col gap-6">
      <div className="flex items-center justify-between">
        <Link
          href="/app/notes"
          className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-ink"
        >
          <ArrowLeft className="h-4 w-4" /> Notes
        </Link>
        <div className="flex items-center gap-2">
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
      </div>

      <Input
        value={title}
        onChange={(e) => setTitle(e.target.value)}
        placeholder="Title"
        className="rounded-none border-0 border-b border-hairline bg-transparent px-0 font-display text-4xl h-auto py-2 focus-visible:ring-0"
      />
      <Input
        value={tagsRaw}
        onChange={(e) => setTagsRaw(e.target.value)}
        placeholder="Tags (comma separated)"
        className="rounded-none border-0 bg-transparent px-0 text-sm text-muted-foreground focus-visible:ring-0 h-auto py-1"
      />
      <Textarea
        value={body}
        onChange={(e) => setBody(e.target.value)}
        placeholder="Begin writing…"
        className="min-h-[60vh] resize-y border-0 bg-transparent px-0 font-mono text-base leading-relaxed focus-visible:ring-0"
      />
      <p className="text-xs text-muted-foreground">⌘S to save</p>
    </div>
  );
}
