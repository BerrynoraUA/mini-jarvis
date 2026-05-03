"use client";

import { format, isSameDay, isSameMonth } from "date-fns";
import type { Task } from "@mini-jarvis/schemas";
import { cn } from "@mini-jarvis/ui";

export function DayCell({
  day,
  month,
  selectedDate,
  items,
  onSelect,
}: {
  day: Date;
  month: Date;
  selectedDate: Date;
  items: Task[];
  onSelect: (day: Date) => void;
}) {
  const active = isSameDay(day, selectedDate);
  const inMonth = isSameMonth(day, month);

  return (
    <button
      type="button"
      onClick={() => onSelect(day)}
      className={cn(
        "min-h-32 rounded-2xl border p-3 text-left transition",
        active
          ? "border-ink bg-ink text-canvas"
          : "border-hairline bg-surface/40 hover:border-ink/20 hover:bg-surface",
        !inMonth && !active && "opacity-45",
      )}
    >
      <div className="flex items-start justify-between gap-2">
        <span className={cn("text-sm font-medium", active ? "text-canvas" : "text-ink")}>
          {format(day, "d")}
        </span>
        {items.length > 0 && (
          <span
            className={cn(
              "rounded-full px-2 py-0.5 text-[10px] font-medium uppercase tracking-[0.16em]",
              active
                ? "bg-canvas/15 text-canvas"
                : "bg-terracotta/10 text-terracotta",
            )}
          >
            {items.length}
          </span>
        )}
      </div>
      <div className="mt-3 space-y-1.5">
        {items.slice(0, 3).map((task) => (
          <div
            key={task.id}
            className={cn(
              "truncate rounded-xl px-2 py-1 text-xs",
              active ? "bg-canvas/10 text-canvas" : "bg-canvas text-ink",
            )}
          >
            {task.title}
          </div>
        ))}
        {items.length > 3 && (
          <p
            className={cn(
              "text-xs",
              active ? "text-canvas/80" : "text-muted-foreground",
            )}
          >
            +{items.length - 3} more
          </p>
        )}
      </div>
    </button>
  );
}
