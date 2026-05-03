"use client";

import { useMemo, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  addMonths,
  startOfMonth,
  startOfToday,
  subMonths,
} from "date-fns";
import { toast } from "sonner";
import { Card, CardContent, CardHeader } from "@mini-jarvis/ui";

import { tasksApi } from "@/lib/api";

import { AddEventForm } from "./add-event-form";
import { CalendarHeader } from "./calendar-header";
import { MonthGrid } from "./month-grid";
import { SelectedDayPanel } from "./selected-day-panel";
import { UnscheduledList } from "./unscheduled-list";
import { toDateInputValue, useCalendarMonth } from "./use-calendar-month";

function dueIsoFromInput(value: string): string {
  return new Date(`${value}T09:00:00.000Z`).toISOString();
}

export function CalendarTab() {
  const qc = useQueryClient();
  const tasks = useQuery({ queryKey: ["tasks"], queryFn: tasksApi.list });
  const today = startOfToday();
  const [month, setMonth] = useState(startOfMonth(today));
  const [selectedDate, setSelectedDate] = useState(today);
  const [title, setTitle] = useState("");
  const [due, setDue] = useState(toDateInputValue(today));

  const list = useMemo(() => tasks.data?.tasks ?? [], [tasks.data]);
  const { calendarDays, scheduledByDay } = useCalendarMonth(month, list);

  const create = useMutation({
    mutationFn: (input: { title: string; due: string | null }) =>
      tasksApi.create({
        title: input.title,
        due: input.due ? dueIsoFromInput(input.due) : null,
        status: "todo",
        tags: [],
        project: null,
      }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["tasks"] });
      setTitle("");
      setDue(toDateInputValue(selectedDate));
    },
    onError: (error: Error) => toast.error(error.message),
  });

  const update = useMutation({
    mutationFn: ({ id, due }: { id: string; due: string }) =>
      tasksApi.update(id, { due: dueIsoFromInput(due) }),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["tasks"] }),
    onError: (error: Error) => toast.error(error.message),
  });

  const selectedTasks = useMemo(
    () => scheduledByDay.get(toDateInputValue(selectedDate)) ?? [],
    [scheduledByDay, selectedDate],
  );
  const unscheduledTasks = useMemo(
    () => list.filter((task) => !task.due),
    [list],
  );

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <p className="text-sm text-muted-foreground">
          A clean month view for scheduled tasks, with unscheduled items off to the side.
        </p>
        <AddEventForm
          title={title}
          due={due}
          pending={create.isPending}
          onTitleChange={setTitle}
          onDueChange={setDue}
          onSubmit={() => create.mutate({ title: title.trim(), due: due || null })}
        />
      </div>

      <div className="grid gap-6 xl:grid-cols-[minmax(0,1.65fr)_minmax(320px,0.85fr)]">
        <Card className="border-hairline bg-canvas/90">
          <CardHeader className="space-y-0">
            <CalendarHeader
              month={month}
              onPrev={() => setMonth((current) => subMonths(current, 1))}
              onNext={() => setMonth((current) => addMonths(current, 1))}
              onToday={() => {
                setMonth(startOfMonth(today));
                setSelectedDate(today);
                setDue(toDateInputValue(today));
              }}
            />
          </CardHeader>
          <CardContent>
            <MonthGrid
              days={calendarDays}
              month={month}
              selectedDate={selectedDate}
              scheduledByDay={scheduledByDay}
              onSelect={(day) => {
                setSelectedDate(day);
                setDue(toDateInputValue(day));
              }}
            />
          </CardContent>
        </Card>

        <div className="flex flex-col gap-6">
          <SelectedDayPanel date={selectedDate} tasks={selectedTasks} />
          <UnscheduledList
            tasks={unscheduledTasks}
            today={today}
            pending={update.isPending}
            onSchedule={(id, nextDue) => update.mutate({ id, due: nextDue })}
          />
        </div>
      </div>
    </div>
  );
}
