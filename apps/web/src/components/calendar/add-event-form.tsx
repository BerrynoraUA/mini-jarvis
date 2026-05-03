"use client";

import { CirclePlus } from "lucide-react";
import { Button, Input } from "@mini-jarvis/ui";

export function AddEventForm({
  title,
  due,
  pending,
  onTitleChange,
  onDueChange,
  onSubmit,
}: {
  title: string;
  due: string;
  pending: boolean;
  onTitleChange: (value: string) => void;
  onDueChange: (value: string) => void;
  onSubmit: () => void;
}) {
  return (
    <form
      className="flex flex-col gap-2 rounded-3xl border border-hairline bg-surface/50 p-3 sm:flex-row"
      onSubmit={(event) => {
        event.preventDefault();
        if (!title.trim()) return;
        onSubmit();
      }}
    >
      <Input
        value={title}
        onChange={(event) => onTitleChange(event.target.value)}
        placeholder="Add calendar item"
        className="sm:min-w-64"
      />
      <Input
        type="date"
        value={due}
        onChange={(event) => onDueChange(event.target.value)}
      />
      <Button type="submit" disabled={!title.trim() || pending}>
        <CirclePlus className="mr-1 h-4 w-4" /> Add
      </Button>
    </form>
  );
}
