import { CalendarDays, Notebook } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@mini-jarvis/ui";

import { CalendarTab } from "../calendar/calendar-tab";
import { NotesTab } from "../notes/notes-tab";

export function WorkspacePage() {
  return (
    <div className="mx-auto w-full max-w-7xl">
      <div className="mb-8">
        <span className="text-[11px] font-medium uppercase tracking-[0.2em] text-muted-foreground">
          Workspace
        </span>
        <h1 className="mt-1 font-display text-4xl text-ink">
          Notes &amp; Calendar — <em className="italic text-terracotta">at peace.</em>
        </h1>
      </div>

      <Tabs defaultValue="notes" className="gap-6">
        <TabsList className="rounded-full bg-surface/60 p-1">
          <TabsTrigger value="notes" className="rounded-full px-5">
            <Notebook className="mr-1.5 h-4 w-4" /> Notes
          </TabsTrigger>
          <TabsTrigger value="calendar" className="rounded-full px-5">
            <CalendarDays className="mr-1.5 h-4 w-4" /> Calendar
          </TabsTrigger>
        </TabsList>
        <TabsContent value="notes">
          <NotesTab />
        </TabsContent>
        <TabsContent value="calendar">
          <CalendarTab />
        </TabsContent>
      </Tabs>
    </div>
  );
}