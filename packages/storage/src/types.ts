import type {
  Note,
  NoteInput,
  Task,
  TaskInput,
  TaskUpdate,
} from "@mini-jarvis/schemas";

export interface NotesStore {
  list(): Promise<Note[]>;
  get(slug: string): Promise<Note | null>;
  create(input: NoteInput): Promise<Note>;
  update(slug: string, input: Partial<NoteInput>): Promise<Note>;
  remove(slug: string): Promise<void>;
}

export interface TasksStore {
  list(): Promise<Task[]>;
  create(input: TaskInput): Promise<Task>;
  update(id: string, input: TaskUpdate): Promise<Task>;
  remove(id: string): Promise<void>;
  reorder(ids: string[]): Promise<void>;
}

export interface Storage {
  notes: NotesStore;
  tasks: TasksStore;
}
