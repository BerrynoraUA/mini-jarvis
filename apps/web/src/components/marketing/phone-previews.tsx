import { cn } from "@mini-jarvis/ui";
import { Search, Home, ListChecks, Library, User } from "lucide-react";

/* In-phone screen previews. Pure visual; no real data. */

function NavBar({ active = "home" }: { active?: string }) {
  const items = [
    { id: "home", icon: Home, label: "Home" },
    { id: "tasks", icon: ListChecks, label: "Tasks" },
    { id: "library", icon: Library, label: "Library" },
    { id: "me", icon: User, label: "Me" },
  ];
  return (
    <div className="absolute inset-x-0 bottom-0 flex items-center justify-around border-t border-border/60 bg-card/95 px-4 py-3 backdrop-blur">
      {items.map(({ id, icon: Icon, label }) => (
        <div
          key={id}
          className={cn(
            "flex flex-col items-center gap-0.5",
            active === id ? "text-foreground" : "text-muted-foreground/70",
          )}
        >
          <Icon size={16} strokeWidth={1.5} />
          <span className="text-[9px]">{label}</span>
        </div>
      ))}
      {/* Floating add button */}
      <div className="absolute -top-5 left-1/2 flex size-10 -translate-x-1/2 items-center justify-center rounded-full bg-ink text-canvas">
        <span className="text-lg leading-none">+</span>
      </div>
    </div>
  );
}

export function HomePreview() {
  return (
    <>
      <div className="text-[10px] uppercase tracking-[0.18em] text-muted-foreground">
        Wednesday · Apr 29
      </div>
      <div className="mt-1 flex items-center justify-between">
        <h3 className="font-display text-[22px] leading-tight">
          Good morning, Mira
        </h3>
        <div className="flex size-7 items-center justify-center rounded-full bg-secondary text-[10px] font-medium">
          M
        </div>
      </div>
      <div className="mt-3 flex h-7 items-center gap-2 rounded-full bg-secondary px-3 text-[10px] text-muted-foreground">
        <Search size={11} strokeWidth={1.7} />
        <span className="flex-1">Search anything…</span>
        <span className="rounded bg-card px-1.5 py-0.5 text-[8px] font-medium">
          ⌘K
        </span>
      </div>
      <div className="mt-3 grid grid-cols-3 gap-2">
        {[
          { n: "6", label: "Today" },
          { n: "12", label: "This week" },
          { n: "82%", label: "Focus" },
        ].map((s) => (
          <div
            key={s.label}
            className="rounded-2xl border border-border bg-card p-2"
          >
            <div className="font-display text-xl leading-none">{s.n}</div>
            <div className="mt-1 text-[9px] text-muted-foreground">
              {s.label}
            </div>
          </div>
        ))}
      </div>
      <div className="mt-4 flex items-center justify-between">
        <span className="text-xs font-medium">Today</span>
        <span className="text-[10px] text-muted-foreground">3 of 6</span>
      </div>
      <div className="mt-2 space-y-1.5">
        {[
          { title: "Review brand guidelines", meta: "Design · 9:00", done: true, dot: "bg-terracotta" },
          { title: "Quarterly planning sync", meta: "Work · 11:30", dot: "bg-sage" },
          { title: "Send proposal to Nordh…", meta: "Today", dot: "bg-sky" },
        ].map((t) => (
          <div
            key={t.title}
            className="flex items-center justify-between rounded-xl border border-border bg-card px-2.5 py-2"
          >
            <div className="flex items-center gap-2">
              <div
                className={cn(
                  "size-3.5 rounded-full border",
                  t.done ? "border-foreground bg-foreground" : "border-border",
                )}
              />
              <div>
                <div
                  className={cn(
                    "text-[10px] font-medium leading-none",
                    t.done && "text-muted-foreground line-through",
                  )}
                >
                  {t.title}
                </div>
                <div className="mt-1 text-[9px] text-muted-foreground">
                  {t.meta}
                </div>
              </div>
            </div>
            <div className={cn("size-1.5 rounded-full", t.dot)} />
          </div>
        ))}
      </div>
      <NavBar active="home" />
    </>
  );
}

export function TasksPreview() {
  return (
    <>
      <div className="text-[10px] uppercase tracking-[0.18em] text-muted-foreground">
        Tasks
      </div>
      <h3 className="font-display text-[22px] leading-tight">All tasks</h3>
      <div className="mt-3 flex gap-1 rounded-full bg-secondary p-1 text-[10px]">
        {["List", "Board", "Calendar"].map((t, i) => (
          <span
            key={t}
            className={cn(
              "flex-1 rounded-full px-2 py-1 text-center",
              i === 0 ? "bg-card text-foreground" : "text-muted-foreground",
            )}
          >
            {t}
          </span>
        ))}
      </div>
      <div className="mt-3 flex items-center gap-1 text-[10px]">
        <span>▾</span>
        <span className="font-medium">Today</span>
        <span className="text-muted-foreground">· Wed, Apr 29</span>
      </div>
      <div className="mt-2 space-y-2">
        <TaskRow done title="Morning review" tag="Ritual" tagColor="bg-terracotta" />
        <TaskRow title="Finalise onboarding copy" tag="Quill" tagColor="bg-sage">
          <SubTask label="Hero section" />
          <SubTask label="Empty states" />
        </TaskRow>
        <TaskRow title="Call with Theodora" tag="Work" tagColor="bg-sky" />
      </div>
      <div className="mt-3 flex items-center gap-1 text-[10px]">
        <span>▾</span>
        <span className="font-medium">Tomorrow</span>
        <span className="text-muted-foreground">· Thu, Apr 30</span>
      </div>
      <div className="mt-2 space-y-2">
        <TaskRow title="Publish weekly note" tag="Writing" tagColor="bg-terracotta" />
      </div>
      <NavBar active="tasks" />
    </>
  );
}

function TaskRow({
  done,
  title,
  tag,
  tagColor,
  children,
}: {
  done?: boolean;
  title: string;
  tag: string;
  tagColor: string;
  children?: React.ReactNode;
}) {
  return (
    <div className="rounded-xl border border-border bg-card px-2.5 py-2">
      <div className="flex items-center gap-2">
        <div
          className={cn(
            "size-3.5 rounded-full border",
            done ? "border-foreground bg-foreground" : "border-border",
          )}
        />
        <div className="flex-1">
          <div
            className={cn(
              "text-[10px] font-medium leading-none",
              done && "text-muted-foreground line-through",
            )}
          >
            {title}
          </div>
          <div className="mt-1 flex items-center gap-1">
            <span className={cn("size-1.5 rounded-full", tagColor)} />
            <span className="text-[9px] text-muted-foreground">{tag}</span>
          </div>
        </div>
      </div>
      {children && (
        <div className="mt-1.5 space-y-1 pl-5">{children}</div>
      )}
    </div>
  );
}

function SubTask({ label }: { label: string }) {
  return (
    <div className="flex items-center gap-1.5">
      <div className="size-2.5 rounded-full border border-border" />
      <span className="text-[9px] text-muted-foreground">{label}</span>
    </div>
  );
}

export function NotePreview() {
  return (
    <>
      <div className="flex items-center justify-between text-[10px] text-muted-foreground">
        <span>‹</span>
        <span>Notes / Ideas</span>
        <span />
      </div>
      <div className="mt-3 text-[9px] uppercase tracking-[0.18em] text-muted-foreground">
        Apr 29 · 4 min read
      </div>
      <h3 className="mt-1 font-display text-[20px] leading-tight">
        On Designing Calm
      </h3>
      <div className="mt-2 flex flex-wrap gap-1">
        {["#design", "#essay", "#calm"].map((t) => (
          <span
            key={t}
            className="rounded-full bg-secondary px-2 py-0.5 text-[9px]"
          >
            {t}
          </span>
        ))}
      </div>
      <div className="mt-3 space-y-2 text-[10px] leading-relaxed text-foreground/85">
        <p>
          Calm is not the absence of motion. is motion <em>considered</em> —
          every transition earned, every surface intentional.
        </p>
        <p>
          The interface should feel like linen: quiet, breathable, and warm to
          the touch.
        </p>
        <blockquote className="rounded-r border-l-2 border-terracotta bg-secondary/50 px-2 py-1.5 text-[10px] italic">
          &ldquo;What you remove matters more than what you add.&rdquo;
        </blockquote>
        <p>Three principles guide the work:</p>
        <ul className="space-y-0.5 text-[10px]">
          <li>— Restraint with colour.</li>
          <li>— Generous whitespace.</li>
          <li>— One clear action per screen.</li>
        </ul>
      </div>
      <div className="absolute inset-x-0 bottom-0 flex items-center gap-2 border-t border-border/60 bg-card/95 px-3 py-2 text-[10px] text-muted-foreground">
        <span className="font-bold text-foreground">B</span>
        <span className="italic">I</span>
        <span># </span>
        <span>🔗</span>
        <span>🖼</span>
        <span className="ml-auto rounded-full bg-ink px-2 py-0.5 text-[9px] text-canvas">
          Save
        </span>
      </div>
    </>
  );
}

export function LibraryPreview() {
  return (
    <>
      <div className="text-[10px] uppercase tracking-[0.18em] text-muted-foreground">
        Library
      </div>
      <h3 className="font-display text-[22px] leading-tight">Your knowledge</h3>
      <div className="mt-2 inline-flex items-center gap-1 self-start rounded-full bg-accent/15 px-2 py-1 text-[9px]">
        ✦ 3 new items auto-organised
      </div>
      <div className="mt-3 grid grid-cols-2 gap-2">
        {[
          { name: "Design", count: "24 items", bg: "bg-canvas" },
          { name: "Reading", count: "18 items", bg: "bg-secondary" },
          { name: "Research", count: "12 items", bg: "bg-sky/40" },
          { name: "Inspiration", count: "31 items", bg: "bg-sage/30" },
        ].map((c) => (
          <div
            key={c.name}
            className={cn(
              "rounded-2xl border border-border p-2",
              c.bg,
            )}
          >
            <div className="size-6 rounded-md bg-card/80" />
            <div className="mt-2 text-[10px] font-medium">{c.name}</div>
            <div className="text-[9px] text-muted-foreground">{c.count}</div>
          </div>
        ))}
      </div>
      <div className="mt-3 text-[10px] font-medium">Reading list</div>
      <div className="mt-1 space-y-1.5">
        {[
          { title: "The Shape of…", meta: "essay · 8 min", tag: "Reading" },
          { title: "Naoto Fukasa…", meta: "video · 14 min", tag: "Design" },
        ].map((b) => (
          <div
            key={b.title}
            className="flex items-center justify-between rounded-xl border border-border bg-card px-2 py-1.5"
          >
            <div className="flex items-center gap-1.5">
              <div className="size-5 rounded-md bg-secondary" />
              <div>
                <div className="text-[10px] font-medium leading-none">
                  {b.title}
                </div>
                <div className="mt-0.5 text-[9px] text-muted-foreground">
                  {b.meta}
                </div>
              </div>
            </div>
            <span className="rounded-full bg-secondary px-1.5 py-0.5 text-[9px]">
              {b.tag}
            </span>
          </div>
        ))}
      </div>
      <NavBar active="library" />
    </>
  );
}

export function SearchPreview() {
  return (
    <div className="flex h-full flex-col bg-secondary/40 backdrop-blur">
      <div className="m-3 flex items-center gap-2 rounded-full bg-card px-3 py-2 text-[11px]">
        <Search size={12} strokeWidth={1.7} />
        <span className="flex-1 text-foreground">deep wo|</span>
        <span className="rounded bg-secondary px-1.5 py-0.5 text-[9px]">
          esc
        </span>
      </div>
      <div className="px-3">
        <SearchSection
          label="TASKS"
          items={[
            { title: "Finish chapter on Deep…", meta: "Today · Reading", active: true },
            { title: "Schedule deep-work block", meta: "Tomorrow · 9–11" },
          ]}
        />
        <SearchSection
          label="NOTES"
          items={[
            { title: "Notes on Deep Work, ch. 4", meta: "Notes · 12 min" },
            { title: "#deepwork", meta: "14 linked items" },
          ]}
        />
        <SearchSection
          label="RESOURCES"
          items={[
            {
              title: "Cal Newport — Deep Work",
              meta: "calnewport.com",
            },
          ]}
        />
      </div>
      <div className="mt-auto flex items-center justify-between border-t border-border/60 bg-card/95 px-3 py-2 text-[9px] text-muted-foreground">
        <span>⌘ K to open</span>
        <span>↑↓ to move</span>
        <span>Open →</span>
      </div>
    </div>
  );
}

function SearchSection({
  label,
  items,
}: {
  label: string;
  items: { title: string; meta: string; active?: boolean }[];
}) {
  return (
    <div className="mb-2">
      <div className="px-2 text-[8px] font-semibold tracking-[0.2em] text-muted-foreground">
        {label}
      </div>
      <div className="mt-1 space-y-0.5">
        {items.map((it) => (
          <div
            key={it.title}
            className={cn(
              "flex items-center justify-between rounded-lg px-2 py-1.5",
              it.active ? "bg-card" : "",
            )}
          >
            <div>
              <div className="text-[10px] font-medium leading-none">
                {it.title}
              </div>
              <div className="mt-0.5 text-[9px] text-muted-foreground">
                {it.meta}
              </div>
            </div>
            {it.active && <span className="text-[10px]">→</span>}
          </div>
        ))}
      </div>
    </div>
  );
}
