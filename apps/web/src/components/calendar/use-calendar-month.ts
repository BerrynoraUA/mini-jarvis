import { useMemo } from "react";
import {
  eachDayOfInterval,
  endOfMonth,
  endOfWeek,
  format,
  parseISO,
  startOfMonth,
  startOfWeek,
} from "date-fns";
import type { Task } from "@mini-jarvis/schemas";

export function toDateInputValue(value: Date): string {
  return format(value, "yyyy-MM-dd");
}

export function toDayKey(value: string): string {
  return format(parseISO(value), "yyyy-MM-dd");
}

export function useCalendarMonth(month: Date, tasks: Task[]) {
  const calendarDays = useMemo(() => {
    const first = startOfWeek(startOfMonth(month), { weekStartsOn: 1 });
    const last = endOfWeek(endOfMonth(month), { weekStartsOn: 1 });
    return eachDayOfInterval({ start: first, end: last });
  }, [month]);

  const scheduledByDay = useMemo(() => {
    const map = new Map<string, Task[]>();
    for (const task of tasks) {
      if (!task.due) continue;
      const key = toDayKey(task.due);
      const existing = map.get(key);
      if (existing) existing.push(task);
      else map.set(key, [task]);
    }
    return map;
  }, [tasks]);

  return { calendarDays, scheduledByDay };
}
