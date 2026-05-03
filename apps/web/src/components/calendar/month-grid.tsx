"use client";

import type { Task } from "@mini-jarvis/schemas";

import { DayCell } from "./day-cell";
import { toDateInputValue } from "./use-calendar-month";

const WEEKDAYS = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];

export function MonthGrid({
  days,
  month,
  selectedDate,
  scheduledByDay,
  onSelect,
}: {
  days: Date[];
  month: Date;
  selectedDate: Date;
  scheduledByDay: Map<string, Task[]>;
  onSelect: (day: Date) => void;
}) {
  return (
    <div className="space-y-4">
      <div className="grid grid-cols-7 gap-2 text-center text-[11px] font-medium uppercase tracking-[0.18em] text-muted-foreground">
        {WEEKDAYS.map((day) => (
          <div key={day} className="px-2 py-1">
            {day}
          </div>
        ))}
      </div>
      <div className="grid grid-cols-7 gap-2">
        {days.map((day) => {
          const key = toDateInputValue(day);
          return (
            <DayCell
              key={key}
              day={day}
              month={month}
              selectedDate={selectedDate}
              items={scheduledByDay.get(key) ?? []}
              onSelect={onSelect}
            />
          );
        })}
      </div>
    </div>
  );
}
