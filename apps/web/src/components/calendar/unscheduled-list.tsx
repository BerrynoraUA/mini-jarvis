"use client";

import { addDays, format } from "date-fns";
import { Button, Card, CardContent, CardHeader, CardTitle } from "@mini-jarvis/ui";
import type { Task } from "@mini-jarvis/schemas";

import { toDateInputValue } from "./use-calendar-month";

export function UnscheduledList({
  tasks,
  today,
  pending,
  onSchedule,
}: {
  tasks: Task[];
  today: Date;
  pending: boolean;
  onSchedule: (id: string, due: string) => void;
}) {
  return (
    <Card className="border-hairline bg-surface/50">
      <CardHeader>
        <CardTitle className="font-display text-2xl text-ink">Unscheduled</CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        {tasks.length === 0 ? (
          <p className="text-sm text-muted-foreground">
            Everything already has a date.
          </p>
        ) : (
          tasks.slice(0, 8).map((task, index) => {
            const suggestedDate = toDateInputValue(addDays(today, index));
            return (
              <div
                key={task.id}
                className="flex items-center justify-between gap-3 rounded-2xl border border-hairline bg-canvas px-4 py-3"
              >
                <div className="min-w-0">
                  <p className="truncate text-sm font-medium text-ink">
                    {task.title}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    Suggest {format(addDays(today, index), "EEE, MMM d")}
                  </p>
                </div>
                <Button
                  size="sm"
                  variant="outline"
                  disabled={pending}
                  onClick={() => onSchedule(task.id, suggestedDate)}
                >
                  Schedule
                </Button>
              </div>
            );
          })
        )}
      </CardContent>
    </Card>
  );
}
