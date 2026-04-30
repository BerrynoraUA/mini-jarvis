"use client";

import { useRouter } from "next/navigation";
import { useState, useEffect } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { ArrowLeft, Save } from "lucide-react";
import Link from "next/link";
import { toast } from "sonner";
import { Button, Input, Textarea } from "@mini-jarvis/ui";
import { notesApi } from "@/lib/api";

export default function NewNotePage() {
  const router = useRouter();
  const qc = useQueryClient();
  const [title, setTitle] = useState("");
  const [body, setBody] = useState("");
  const [tagsRaw, setTagsRaw] = useState("");

  const create = useMutation({
    mutationFn: () =>
      notesApi.create({
        title: title.trim() || "Untitled",
        body,
        tags: tagsRaw
          .split(",")
          .map((t) => t.trim())
          .filter(Boolean),
      }),
    onSuccess: ({ note }) => {
      qc.invalidateQueries({ queryKey: ["notes"] });
      toast.success("Note saved");
      router.replace(`/app/notes/${note.slug}`);
    },
    onError: (err: Error) => toast.error(err.message),
  });

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "s") {
        e.preventDefault();
        create.mutate();
      }
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [create]);

  return (
    <div className="mx-auto flex max-w-3xl flex-col gap-6">
      <div className="flex items-center justify-between">
        <Link
          href="/app/notes"
          className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-ink"
        >
          <ArrowLeft className="h-4 w-4" /> Notes
        </Link>
        <Button onClick={() => create.mutate()} disabled={create.isPending}>
          <Save className="mr-1 h-4 w-4" /> {create.isPending ? "Saving…" : "Save"}
        </Button>
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
