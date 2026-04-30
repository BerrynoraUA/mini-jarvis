"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import {
  Home,
  Notebook,
  ListTodo,
  Library,
  Search,
  Plus,
} from "lucide-react";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
  CommandSeparator,
  Dialog,
  DialogContent,
  DialogTitle,
  cn,
} from "@mini-jarvis/ui";
import { useQuery } from "@tanstack/react-query";
import { notesApi, tasksApi } from "@/lib/api";

const NAV = [
  { href: "/app", label: "Home", icon: Home },
  { href: "/app/notes", label: "Notes", icon: Notebook },
  { href: "/app/tasks", label: "Tasks", icon: ListTodo },
  { href: "/app/library", label: "Library", icon: Library },
];

export function AppSidebar({ onOpenPalette }: { onOpenPalette: () => void }) {
  const pathname = usePathname();
  return (
    <aside className="hidden w-64 shrink-0 flex-col border-r border-hairline bg-canvas px-4 py-6 lg:flex">
      <Link href="/app" className="flex items-center gap-2 px-2">
        <span className="font-display text-2xl italic text-ink">Mini Jarvis</span>
      </Link>
      <button
        type="button"
        onClick={onOpenPalette}
        className="mt-6 flex items-center justify-between rounded-full border border-hairline bg-surface/60 px-4 py-2 text-sm text-muted-foreground transition hover:bg-surface"
      >
        <span className="flex items-center gap-2">
          <Search className="h-4 w-4" /> Quick find
        </span>
        <kbd className="rounded bg-canvas px-1.5 py-0.5 text-[10px] tracking-widest text-muted-foreground">
          ⌘K
        </kbd>
      </button>
      <nav className="mt-8 flex flex-col gap-1">
        {NAV.map(({ href, label, icon: Icon }) => {
          const active =
            href === "/app" ? pathname === href : pathname?.startsWith(href);
          return (
            <Link
              key={href}
              href={href}
              className={cn(
                "flex items-center gap-3 rounded-full px-4 py-2 text-sm transition",
                active
                  ? "bg-ink text-canvas"
                  : "text-ink hover:bg-surface",
              )}
            >
              <Icon className="h-4 w-4" />
              {label}
            </Link>
          );
        })}
      </nav>
      <div className="mt-auto rounded-2xl border border-hairline bg-surface/60 p-4 text-xs text-muted-foreground">
        <p className="font-medium text-ink">Local workspace</p>
        <p className="mt-1">
          Notes &amp; tasks live in <code className="font-mono text-[11px]">./.data</code>. Drive
          sync arrives soon.
        </p>
      </div>
    </aside>
  );
}

export function CommandPalette({
  open,
  onOpenChange,
}: {
  open: boolean;
  onOpenChange: (v: boolean) => void;
}) {
  const router = useRouter();
  const notes = useQuery({ queryKey: ["notes"], queryFn: notesApi.list, enabled: open });
  const tasks = useQuery({ queryKey: ["tasks"], queryFn: tasksApi.list, enabled: open });

  const go = (href: string) => {
    onOpenChange(false);
    router.push(href);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="p-0 max-w-xl" showClose={false}>
        <DialogTitle className="sr-only">Command palette</DialogTitle>
        <Command label="Quick find">
          <CommandInput placeholder="Search notes, tasks, or jump to a page…" />
          <CommandList>
            <CommandEmpty>No results.</CommandEmpty>
            <CommandGroup heading="Create">
              <CommandItem onSelect={() => go("/app/notes/new")}>
                <Plus className="h-4 w-4" /> New note
              </CommandItem>
              <CommandItem onSelect={() => go("/app/tasks?new=1")}>
                <Plus className="h-4 w-4" /> New task
              </CommandItem>
            </CommandGroup>
            <CommandSeparator />
            <CommandGroup heading="Navigate">
              {NAV.map(({ href, label, icon: Icon }) => (
                <CommandItem key={href} onSelect={() => go(href)}>
                  <Icon className="h-4 w-4" /> {label}
                </CommandItem>
              ))}
            </CommandGroup>
            {notes.data && notes.data.notes.length > 0 && (
              <>
                <CommandSeparator />
                <CommandGroup heading="Notes">
                  {notes.data.notes.slice(0, 8).map((n) => (
                    <CommandItem
                      key={n.slug}
                      onSelect={() => go(`/app/notes/${n.slug}`)}
                    >
                      <Notebook className="h-4 w-4" /> {n.title}
                    </CommandItem>
                  ))}
                </CommandGroup>
              </>
            )}
            {tasks.data && tasks.data.tasks.length > 0 && (
              <>
                <CommandSeparator />
                <CommandGroup heading="Tasks">
                  {tasks.data.tasks.slice(0, 8).map((t) => (
                    <CommandItem
                      key={t.id}
                      onSelect={() => go(`/app/tasks?focus=${t.id}`)}
                    >
                      <ListTodo className="h-4 w-4" /> {t.title}
                    </CommandItem>
                  ))}
                </CommandGroup>
              </>
            )}
          </CommandList>
        </Command>
      </DialogContent>
    </Dialog>
  );
}

export function AppShell({ children }: { children: React.ReactNode }) {
  const [paletteOpen, setPaletteOpen] = useState(false);

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        setPaletteOpen((v) => !v);
      }
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, []);

  return (
    <div className="flex min-h-screen bg-canvas">
      <AppSidebar onOpenPalette={() => setPaletteOpen(true)} />
      <main className="flex-1 px-6 py-8 sm:px-10 lg:px-14">{children}</main>
      <CommandPalette open={paletteOpen} onOpenChange={setPaletteOpen} />
    </div>
  );
}
