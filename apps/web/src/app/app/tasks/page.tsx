"use client";

import { useMemo, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  DndContext,
  DragOverlay,
  PointerSensor,
  closestCorners,
  useDroppable,
  useSensor,
  useSensors,
  type DragEndEvent,
  type DragStartEvent,
} from "@dnd-kit/core";
import {
  SortableContext,
  arrayMove,
  useSortable,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { toast } from "sonner";
import { Plus, Trash2 } from "lucide-react";
import {
  Badge,
  Button,
  Checkbox,
  Input,
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
  cn,
} from "@mini-jarvis/ui";
import type { Task, TaskStatus } from "@mini-jarvis/schemas";
import { tasksApi } from "@/lib/api";

const COLUMNS: { id: TaskStatus; label: string; tone: string }[] = [
  { id: "todo", label: "To do", tone: "text-muted-foreground" },
  { id: "doing", label: "Doing", tone: "text-terracotta" },
  { id: "done", label: "Done", tone: "text-sage" },
];

export default function TasksPage() {
  const qc = useQueryClient();
  const tasks = useQuery({ queryKey: ["tasks"], queryFn: tasksApi.list });
  const [newTitle, setNewTitle] = useState("");

  const create = useMutation({
    mutationFn: (title: string) =>
      tasksApi.create({ title, status: "todo", tags: [], project: null, due: null }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["tasks"] });
      setNewTitle("");
    },
    onError: (e: Error) => toast.error(e.message),
  });

  const update = useMutation({
    mutationFn: ({ id, ...patch }: { id: string } & Parameters<typeof tasksApi.update>[1]) =>
      tasksApi.update(id, patch),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["tasks"] }),
  });

  const remove = useMutation({
    mutationFn: (id: string) => tasksApi.remove(id),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["tasks"] }),
  });

  const list = tasks.data?.tasks ?? [];

  return (
    <div className="mx-auto flex max-w-6xl flex-col gap-8">
      <header className="flex flex-col gap-2">
        <span className="text-[11px] font-medium uppercase tracking-[0.2em] text-muted-foreground">
          Workboard
        </span>
        <h1 className="font-display text-4xl text-ink">
          Tasks — <em className="italic text-terracotta">small, on purpose</em>
        </h1>
      </header>

      <form
        className="flex items-center gap-2"
        onSubmit={(e) => {
          e.preventDefault();
          const t = newTitle.trim();
          if (t) create.mutate(t);
        }}
      >
        <Input
          value={newTitle}
          onChange={(e) => setNewTitle(e.target.value)}
          placeholder="What needs doing?"
          className="flex-1"
        />
        <Button type="submit" disabled={!newTitle.trim() || create.isPending}>
          <Plus className="mr-1 h-4 w-4" /> Add
        </Button>
      </form>

      <Tabs defaultValue="list">
        <TabsList>
          <TabsTrigger value="list">List</TabsTrigger>
          <TabsTrigger value="board">Board</TabsTrigger>
          <TabsTrigger value="calendar">Calendar</TabsTrigger>
        </TabsList>

        <TabsContent value="list">
          <ListView
            tasks={list}
            onToggle={(t) =>
              update.mutate({ id: t.id, status: t.status === "done" ? "todo" : "done" })
            }
            onRemove={(id) => remove.mutate(id)}
          />
        </TabsContent>

        <TabsContent value="board">
          <BoardView
            tasks={list}
            onMove={(id, status) => update.mutate({ id, status })}
          />
        </TabsContent>

        <TabsContent value="calendar">
          <div className="rounded-2xl border border-dashed border-hairline bg-surface/40 p-12 text-center">
            <p className="font-display text-2xl">Calendar coming soon.</p>
            <p className="mt-2 text-sm text-muted-foreground">
              Due dates land in this view.
            </p>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}

function ListView({
  tasks,
  onToggle,
  onRemove,
}: {
  tasks: Task[];
  onToggle: (t: Task) => void;
  onRemove: (id: string) => void;
}) {
  const grouped = useMemo(
    () => ({
      todo: tasks.filter((t) => t.status === "todo"),
      doing: tasks.filter((t) => t.status === "doing"),
      done: tasks.filter((t) => t.status === "done"),
    }),
    [tasks],
  );

  if (tasks.length === 0) {
    return (
      <div className="rounded-2xl border border-dashed border-hairline bg-surface/40 p-12 text-center">
        <p className="font-display text-2xl text-ink">A clear list.</p>
        <p className="mt-2 text-sm text-muted-foreground">Add your first task above.</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-6">
      {COLUMNS.map((col) => {
        const items = grouped[col.id];
        if (items.length === 0) return null;
        return (
          <section key={col.id} className="flex flex-col gap-2">
            <div className="flex items-baseline gap-2">
              <h2 className={cn("font-display text-xl", col.tone)}>{col.label}</h2>
              <span className="text-xs text-muted-foreground">{items.length}</span>
            </div>
            <ul className="flex flex-col gap-1">
              {items.map((t) => (
                <li
                  key={t.id}
                  className="group flex items-center gap-3 rounded-xl border border-transparent px-3 py-2 transition hover:border-hairline hover:bg-surface/40"
                >
                  <Checkbox
                    checked={t.status === "done"}
                    onCheckedChange={() => onToggle(t)}
                  />
                  <span
                    className={cn(
                      "flex-1 text-sm text-ink",
                      t.status === "done" && "text-muted-foreground line-through",
                    )}
                  >
                    {t.title}
                  </span>
                  {t.tags.length > 0 && (
                    <div className="flex gap-1">
                      {t.tags.map((tag) => (
                        <Badge key={tag} variant="outline">
                          {tag}
                        </Badge>
                      ))}
                    </div>
                  )}
                  <button
                    type="button"
                    onClick={() => onRemove(t.id)}
                    className="rounded-full p-1 text-muted-foreground opacity-0 transition hover:bg-surface group-hover:opacity-100"
                    aria-label="Delete task"
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </button>
                </li>
              ))}
            </ul>
          </section>
        );
      })}
    </div>
  );
}

function BoardView({
  tasks,
  onMove,
}: {
  tasks: Task[];
  onMove: (id: string, status: TaskStatus) => void;
}) {
  const [activeId, setActiveId] = useState<string | null>(null);
  const sensors = useSensors(useSensor(PointerSensor, { activationConstraint: { distance: 4 } }));

  const grouped = useMemo(() => {
    const g: Record<TaskStatus, Task[]> = { todo: [], doing: [], done: [] };
    for (const t of tasks) g[t.status].push(t);
    return g;
  }, [tasks]);

  function handleDragStart(e: DragStartEvent) {
    setActiveId(String(e.active.id));
  }

  function handleDragEnd(e: DragEndEvent) {
    setActiveId(null);
    const { active, over } = e;
    if (!over) return;

    const activeTask = tasks.find((t) => t.id === active.id);
    if (!activeTask) return;

    // Dropping on a column or another task
    let targetStatus: TaskStatus | null = null;
    if (COLUMNS.some((c) => c.id === over.id)) {
      targetStatus = over.id as TaskStatus;
    } else {
      const overTask = tasks.find((t) => t.id === over.id);
      if (overTask) targetStatus = overTask.status;
    }
    if (!targetStatus || targetStatus === activeTask.status) return;
    onMove(activeTask.id, targetStatus);
  }

  const active = tasks.find((t) => t.id === activeId);

  return (
    <DndContext
      sensors={sensors}
      collisionDetection={closestCorners}
      onDragStart={handleDragStart}
      onDragEnd={handleDragEnd}
    >
      <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
        {COLUMNS.map((col) => (
          <Column key={col.id} id={col.id} label={col.label} tone={col.tone} tasks={grouped[col.id]} />
        ))}
      </div>
      <DragOverlay>
        {active ? (
          <div className="rounded-xl border border-ink/20 bg-canvas px-3 py-2 text-sm shadow-lg">
            {active.title}
          </div>
        ) : null}
      </DragOverlay>
    </DndContext>
  );
}

function Column({
  id,
  label,
  tone,
  tasks,
}: {
  id: TaskStatus;
  label: string;
  tone: string;
  tasks: Task[];
}) {
  const { setNodeRef, isOver } = useDroppable({ id });
  return (
    <div
      ref={setNodeRef}
      className={cn(
        "flex min-h-[300px] flex-col gap-2 rounded-2xl border border-hairline bg-surface/40 p-3 transition",
        isOver && "border-ink/30 bg-surface",
      )}
    >
      <div className="flex items-baseline justify-between px-2">
        <h2 className={cn("font-display text-lg", tone)}>{label}</h2>
        <span className="text-xs text-muted-foreground">{tasks.length}</span>
      </div>
      <SortableContext items={tasks.map((t) => t.id)} strategy={verticalListSortingStrategy}>
        <ul className="flex flex-col gap-2">
          {tasks.map((t) => (
            <BoardCard key={t.id} task={t} />
          ))}
        </ul>
      </SortableContext>
    </div>
  );
}

function BoardCard({ task }: { task: Task }) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
    id: task.id,
  });
  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };
  return (
    <li
      ref={setNodeRef}
      style={style}
      {...attributes}
      {...listeners}
      className={cn(
        "cursor-grab rounded-xl border border-hairline bg-canvas px-3 py-2 text-sm text-ink shadow-sm transition active:cursor-grabbing",
        isDragging && "opacity-40",
      )}
    >
      {task.title}
      {task.tags.length > 0 && (
        <div className="mt-2 flex flex-wrap gap-1">
          {task.tags.map((t) => (
            <Badge key={t} variant="outline">
              {t}
            </Badge>
          ))}
        </div>
      )}
    </li>
  );
}
