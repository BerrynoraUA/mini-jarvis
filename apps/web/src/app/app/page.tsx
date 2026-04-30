"use client";

import Link from "next/link";
import { useQuery } from "@tanstack/react-query";
import { format } from "date-fns";
import { ArrowUpRight, Notebook, ListTodo, Plus } from "lucide-react";
import {
  Badge,
  Button,
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@mini-jarvis/ui";
import { notesApi, tasksApi } from "@/lib/api";

export default function AppHomePage() {
  const notes = useQuery({ queryKey: ["notes"], queryFn: notesApi.list });
  const tasks = useQuery({ queryKey: ["tasks"], queryFn: tasksApi.list });

  const today = format(new Date(), "EEEE, MMMM d");
  const open = tasks.data?.tasks.filter((t) => t.status !== "done") ?? [];
  const recent = (notes.data?.notes ?? []).slice(0, 6);

  return (
    <div className="mx-auto flex max-w-5xl flex-col gap-10">
      <header className="flex flex-col gap-2">
        <span className="text-[11px] font-medium uppercase tracking-[0.2em] text-muted-foreground">
          {today}
        </span>
        <h1 className="font-display text-5xl text-ink">
          A calmer way to <em className="font-display italic text-terracotta">begin</em>.
        </h1>
        <p className="max-w-xl text-base text-muted-foreground">
          Pick up where you left off, or start something gentle. Your notes and tasks live
          quietly together, ready when you are.
        </p>
      </header>

      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <span className="flex items-center gap-2">
                <Notebook className="h-4 w-4 text-muted-foreground" /> Recent notes
              </span>
              <Link
                href="/app/notes"
                className="text-xs font-medium uppercase tracking-widest text-muted-foreground hover:text-ink"
              >
                All
              </Link>
            </CardTitle>
            <CardDescription>Quiet thinking, in markdown.</CardDescription>
          </CardHeader>
          <CardContent className="flex flex-col gap-2">
            {recent.length === 0 && (
              <p className="text-sm text-muted-foreground">
                No notes yet. Start with a single line.
              </p>
            )}
            {recent.map((n) => (
              <Link
                key={n.slug}
                href={`/app/notes/${n.slug}`}
                className="group flex items-center justify-between rounded-xl border border-transparent px-3 py-2 transition hover:border-hairline hover:bg-surface/60"
              >
                <span className="font-display text-lg text-ink">{n.title}</span>
                <ArrowUpRight className="h-4 w-4 text-muted-foreground opacity-0 transition group-hover:opacity-100" />
              </Link>
            ))}
            <Link href="/app/notes/new" className="mt-2">
              <Button variant="outline" size="sm" className="rounded-full">
                <Plus className="mr-1 h-4 w-4" /> New note
              </Button>
            </Link>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <span className="flex items-center gap-2">
                <ListTodo className="h-4 w-4 text-muted-foreground" /> Open tasks
              </span>
              <Link
                href="/app/tasks"
                className="text-xs font-medium uppercase tracking-widest text-muted-foreground hover:text-ink"
              >
                Board
              </Link>
            </CardTitle>
            <CardDescription>{open.length} on your plate.</CardDescription>
          </CardHeader>
          <CardContent className="flex flex-col gap-2">
            {open.length === 0 && (
              <p className="text-sm text-muted-foreground">Inbox zero. Breathe out.</p>
            )}
            {open.slice(0, 6).map((t) => (
              <div
                key={t.id}
                className="flex items-center justify-between rounded-xl border border-hairline bg-surface/40 px-3 py-2"
              >
                <span className="text-sm text-ink">{t.title}</span>
                <Badge variant={t.status === "doing" ? "accent" : "outline"}>
                  {t.status}
                </Badge>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
