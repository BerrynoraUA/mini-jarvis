import { CalendarDays } from "lucide-react";
import { format } from "date-fns";
import { Badge, Card, CardContent, CardHeader, CardTitle } from "@mini-jarvis/ui";
import type { Task } from "@mini-jarvis/schemas";

function statusLabel(status: Task["status"]): string {
  if (status === "done") return "Completed";
  if (status === "doing") return "In progress";
  return "Planned";
}

export function SelectedDayPanel({
  date,
  tasks,
}: {
  date: Date;
  tasks: Task[];
}) {
  return (
    <Card className="border-hairline bg-surface/50">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 font-display text-2xl text-ink">
          <CalendarDays className="h-5 w-5 text-muted-foreground" />
          {format(date, "EEEE, MMMM d")}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        {tasks.length === 0 ? (
          <p className="text-sm text-muted-foreground">
            Nothing scheduled for this day.
          </p>
        ) : (
          tasks.map((task) => (
            <div
              key={task.id}
              className="rounded-2xl border border-hairline bg-canvas px-4 py-3"
            >
              <div className="flex items-start justify-between gap-3">
                <div>
                  <p className="text-sm font-medium text-ink">{task.title}</p>
                  <p className="mt-1 text-xs text-muted-foreground">
                    {statusLabel(task.status)}
                  </p>
                </div>
                <Badge variant={task.status === "doing" ? "accent" : "outline"}>
                  {task.status}
                </Badge>
              </div>
            </div>
          ))
        )}
      </CardContent>
    </Card>
  );
}
