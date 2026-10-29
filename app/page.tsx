"use client";

import { useState } from "react";
import {
  createNote,
  createTask,
  completeTask,
  reopenTask,
  updateNote,
  deleteNote,
} from "./actions/workspace";
import {
  Archive,
  ArrowUpRight,
  BookOpen,
  Check,
  Circle,
  FolderKanban,
  LayoutDashboard,
  Plus,
  Search,
  Tag,
  TerminalSquare,
  Trash2,
  Pencil,
  X,
} from "lucide-react";

type Task = {
  id?: string;
  title: string;
  project: string;
  status: string;
  priority: string;
  due?: string;
};
type Note = { id: string; title: string; content: string };
const initialTasks: Task[] = [
  {
    title: "Finalize authentication flow",
    project: "Nexus Command Center",
    status: "In Progress",
    priority: "Critical",
    due: "Today",
  },
  {
    title: "Document API error patterns",
    project: "Nexus Command Center",
    status: "Todo",
    priority: "High",
    due: "Tomorrow",
  },
  {
    title: "Review deployment checklist",
    project: "Marketing site v2",
    status: "Todo",
    priority: "Medium",
    due: "Oct 31",
  },
];
const projects = [
  {
    name: "Nexus Command Center",
    initials: "NC",
    color: "bg-indigo-500",
    progress: 68,
    tasks: 12,
  },
  {
    name: "Marketing site v2",
    initials: "MS",
    color: "bg-amber-500",
    progress: 42,
    tasks: 8,
  },
  {
    name: "Mobile companion",
    initials: "MC",
    color: "bg-cyan-500",
    progress: 24,
    tasks: 5,
  },
];
const notesSeed: Note[] = [
  {
    id: "seed-auth",
    title: "Better Auth patterns",
    content:
      "Patterns and decisions for secure sessions, cookies, and trusted origins.",
  },
  {
    id: "seed-api",
    title: "API error patterns",
    content:
      "Common failure modes and the response shapes we use to make debugging fast.",
  },
  {
    id: "seed-release",
    title: "Release checklist",
    content:
      "Verify migrations, browser flows, accessibility, and production headers.",
  },
];

export default function Page() {
  const [activeNav, setActiveNav] = useState("Command center");
  const [tasks, setTasks] = useState(initialTasks);
  const [completed, setCompleted] = useState<Task[]>([]);
  const [archivedTasks, setArchivedTasks] = useState<Task[]>([]);
  const [archivedNotes, setArchivedNotes] = useState<Note[]>([]);
  const [notes, setNotes] = useState(notesSeed);
  const [query, setQuery] = useState("");
  const [taskTitle, setTaskTitle] = useState("");
  const [noteDraft, setNoteDraft] = useState<{
    id?: string;
    title: string;
    content: string;
  } | null>(null);
  const finish = async (task: Task) => {
    setTasks((v) => v.filter((x) => x !== task));
    setCompleted((v) => [task, ...v]);
    if (task.id) await completeTask(task.id).catch(() => undefined);
  };
  const restore = async (task: Task) => {
    setCompleted((v) => v.filter((x) => x !== task));
    setTasks((v) => [{ ...task, status: "Todo" }, ...v]);
    if (task.id) await reopenTask(task.id).catch(() => undefined);
  };
  const addTask = async () => {
    const title = taskTitle.trim();
    if (!title) return;
    try {
      const saved = await createTask({ title });
      setTasks((v) => [
        {
          id: saved.id,
          title,
          project: "Nexus Command Center",
          status: "Todo",
          priority: "Medium",
          due: "Today",
        },
        ...v,
      ]);
    } catch {
      setTasks((v) => [
        {
          title,
          project: "Nexus Command Center",
          status: "Todo",
          priority: "Medium",
          due: "Today",
        },
        ...v,
      ]);
    }
    setTaskTitle("");
  };
  const saveNote = async () => {
    if (!noteDraft?.title.trim() || !noteDraft.content.trim()) return;
    try {
      if (noteDraft.id && !noteDraft.id.startsWith("seed-")) {
        const saved = await updateNote(noteDraft.id, noteDraft);
        setNotes((v) =>
          v.map((n: Note) =>
            n.id === noteDraft.id
              ? { ...n, title: saved.title, content: saved.content }
              : n,
          ),
        );
      } else {
        const saved = await createNote(noteDraft);
        setNotes((v) => [
          { id: saved.id, title: saved.title, content: saved.content },
          ...v,
        ]);
      }
    } catch {
      if (!noteDraft.id)
        setNotes((v) => [
          {
            id: crypto.randomUUID(),
            title: noteDraft.title,
            content: noteDraft.content,
          },
          ...v,
        ]);
    }
    setNoteDraft(null);
  };
  const removeNote = async (note: Note) => {
    setNotes((v) => v.filter((n) => n.id !== note.id));
    if (!note.id.startsWith("seed-"))
      await deleteNote(note.id).catch(() => undefined);
  };
  const archiveTask = (task: Task) => {
    setTasks((v) => v.filter((item) => item !== task));
    setArchivedTasks((v) => [task, ...v]);
  };
  const restoreArchivedTask = (task: Task) => {
    setArchivedTasks((v) => v.filter((item) => item !== task));
    setTasks((v) => [task, ...v]);
  };
  const archiveNote = (note: Note) => {
    setNotes((v) => v.filter((item) => item.id !== note.id));
    setArchivedNotes((v) => [note, ...v]);
  };
  const restoreArchivedNote = (note: Note) => {
    setArchivedNotes((v) => v.filter((item) => item.id !== note.id));
    setNotes((v) => [note, ...v]);
  };
  const filtered = tasks.filter((t) =>
    `${t.title} ${t.project}`.toLowerCase().includes(query.toLowerCase()),
  );
  return (
    <main className="min-h-screen bg-[#09101d] text-slate-100">
      <div className="flex min-h-screen">
        <aside className="hidden w-[252px] shrink-0 border-r border-white/[0.07] bg-[#0b1423] px-4 py-5 lg:flex lg:flex-col">
          <div className="flex items-center gap-3 px-2">
            <div className="grid size-8 place-items-center rounded-lg bg-indigo-500">
              <TerminalSquare className="size-[18px]" />
            </div>
            <b>nexus</b>
          </div>
          <button
            onClick={() => setNoteDraft({ title: "", content: "" })}
            className="mt-8 flex h-10 items-center justify-center gap-2 rounded-lg bg-indigo-500 text-sm"
          >
            <Plus className="size-4" /> New note
          </button>
          <nav className="mt-8 flex flex-col gap-1">
            {[
              { label: "Command center", Icon: LayoutDashboard },
              { label: "Projects", Icon: FolderKanban },
              { label: "Tasks", Icon: Check },
              { label: "Knowledge vault", Icon: BookOpen },
            ].map(({ label, Icon }) => (
              <button
                key={label}
                onClick={() => setActiveNav(label)}
                className={`flex items-center gap-3 rounded-lg px-3 py-2.5 text-left text-[13px] ${activeNav === label ? "bg-white/[0.08] text-white" : "text-slate-400 hover:bg-white/[0.04]"}`}
              >
                <Icon className="size-[17px]" />
                {label}
              </button>
            ))}
          </nav>
          <div className="mt-8 flex flex-col gap-1">
            <button
              onClick={() => setActiveNav("Archived")}
              className="flex items-center gap-3 rounded-lg px-3 py-2.5 text-[13px] text-slate-400"
            >
              <Archive className="size-[17px]" />
              Archived
            </button>
            <button
              onClick={() => setActiveNav("Tags")}
              className="flex items-center gap-3 rounded-lg px-3 py-2.5 text-[13px] text-slate-400"
            >
              <Tag className="size-[17px]" />
              Tags
            </button>
          </div>
        </aside>
        <section className="min-w-0 flex-1">
          <header className="flex h-[72px] items-center justify-between border-b border-white/[0.07] px-5 sm:px-8">
            <div>
              <p className="text-[11px] uppercase tracking-[0.14em] text-slate-500">
                Tuesday, October 27, 2026
              </p>
              <h1 className="mt-1 text-[18px] font-semibold">
                Good morning, Prathik{" "}
                <span className="text-slate-500">/ {activeNav}</span>
              </h1>
            </div>
            <div className="flex items-center gap-2 rounded-lg border border-white/[0.08] px-3 py-2">
              <Search className="size-4 text-slate-500" />
              <input
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search everything..."
                className="w-48 bg-transparent text-xs outline-none"
              />
            </div>
          </header>
          {activeNav === "Command center" ? (
            <Dashboard
              tasks={filtered}
              onComplete={finish}
              onNavigate={setActiveNav}
            />
          ) : (
            <Workspace
              activeNav={activeNav}
              tasks={filtered}
              completed={completed}
              archivedTasks={archivedTasks}
              archivedNotes={archivedNotes}
              notes={notes}
              onComplete={finish}
              onArchiveTask={archiveTask}
              onRestoreArchivedTask={restoreArchivedTask}
              onArchiveNote={archiveNote}
              onRestoreArchivedNote={restoreArchivedNote}
              onRestore={restore}
              onAddTask={() => addTask()}
              taskTitle={taskTitle}
              setTaskTitle={setTaskTitle}
              onNewNote={() => setNoteDraft({ title: "", content: "" })}
              onEditNote={(n: Note) => setNoteDraft(n)}
              onDeleteNote={removeNote}
            />
          )}
        </section>
      </div>
      {noteDraft && (
        <div
          className="fixed inset-0 z-20 grid place-items-center bg-black/60 p-4"
          onClick={() => setNoteDraft(null)}
        >
          <div
            className="w-full max-w-lg rounded-xl border border-white/10 bg-[#111d30] p-5"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between">
              <h2 className="font-semibold">
                {noteDraft.id ? "Edit note" : "Create note"}
              </h2>
              <button onClick={() => setNoteDraft(null)}>
                <X className="size-4" />
              </button>
            </div>
            <input
              autoFocus
              value={noteDraft.title}
              onChange={(e) =>
                setNoteDraft({ ...noteDraft, title: e.target.value })
              }
              placeholder="Note title"
              className="mt-5 w-full rounded-lg border border-white/10 bg-black/20 px-3 py-2 text-sm outline-none"
            />
            <textarea
              value={noteDraft.content}
              onChange={(e) =>
                setNoteDraft({ ...noteDraft, content: e.target.value })
              }
              placeholder="Write your note..."
              rows={8}
              className="mt-3 w-full resize-none rounded-lg border border-white/10 bg-black/20 px-3 py-2 text-sm outline-none"
            />
            <div className="mt-4 flex justify-end gap-2">
              <button
                onClick={() => setNoteDraft(null)}
                className="rounded-lg px-3 py-2 text-xs text-slate-400"
              >
                Cancel
              </button>
              <button
                onClick={() => void saveNote()}
                className="rounded-lg bg-indigo-500 px-3 py-2 text-xs font-medium"
              >
                Save note
              </button>
            </div>
          </div>
        </div>
      )}
    </main>
  );
}

function Dashboard({
  tasks,
  onComplete,
  onNavigate,
}: {
  tasks: Task[];
  onComplete: (t: Task) => void;
  onNavigate: (n: string) => void;
}) {
  return (
    <div className="mx-auto max-w-[1280px] px-5 py-8 sm:px-8">
      <p className="text-xs text-slate-500">
        Here&apos;s the pulse of your workspace.
      </p>
      <h2 className="mt-1 text-2xl font-semibold">
        Make progress, one commit at a time.
      </h2>
      <div className="mt-8 grid gap-5 lg:grid-cols-2">
        <section className="rounded-xl border border-white/[0.08] bg-[#0d1727] p-5">
          <div className="flex justify-between">
            <div>
              <h3 className="font-semibold">Your projects</h3>
              <p className="mt-1 text-xs text-slate-500">Active workspaces</p>
            </div>
            <button
              onClick={() => onNavigate("Projects")}
              className="text-xs text-indigo-300"
            >
              View all <ArrowUpRight className="inline size-3" />
            </button>
          </div>
          {projects.map((p) => (
            <button
              key={p.name}
              onClick={() => onNavigate("Projects")}
              className="mt-5 block w-full text-left"
            >
              <div className="flex justify-between text-xs">
                <span>{p.name}</span>
                <span>{p.progress}%</span>
              </div>
              <div className="mt-2 h-1 rounded bg-white/10">
                <div
                  className={`h-full rounded ${p.color}`}
                  style={{ width: `${p.progress}%` }}
                />
              </div>
            </button>
          ))}
        </section>
        <section className="rounded-xl border border-white/[0.08] bg-[#0d1727] p-5">
          <div className="flex justify-between">
            <h3 className="font-semibold">Focus queue</h3>
            <button
              onClick={() => onNavigate("Tasks")}
              className="text-xs text-indigo-300"
            >
              Open tasks
            </button>
          </div>
          {tasks.slice(0, 4).map((t) => (
            <TaskRow key={t.title} task={t} onComplete={onComplete} />
          ))}
        </section>
      </div>
    </div>
  );
}

function TaskRow({
  task,
  onComplete,
}: {
  task: Task;
  onComplete: (t: Task) => void;
}) {
  return (
    <div className="mt-4 flex items-start gap-3">
      <button
        onClick={() => onComplete(task)}
        className="text-slate-500 hover:text-emerald-400"
      >
        <Circle className="size-4" />
      </button>
      <div>
        <p className="text-xs text-slate-300">{task.title}</p>
        <p className="mt-1 text-[10px] text-slate-600">
          {task.project} · {task.priority}
        </p>
      </div>
    </div>
  );
}

function Workspace({
  activeNav,
  tasks,
  completed,
  archivedTasks,
  archivedNotes,
  notes,
  onComplete,
  onArchiveTask,
  onRestoreArchivedTask,
  onArchiveNote,
  onRestoreArchivedNote,
  onRestore,
  onAddTask,
  taskTitle,
  setTaskTitle,
  onNewNote,
  onEditNote,
  onDeleteNote,
}: any) {
  const [mode, setMode] = useState<"open" | "completed">("open");
  const [archiveMode, setArchiveMode] = useState<"tasks" | "notes">("tasks");
  const [openProject, setOpenProject] = useState<string | null>(null);
  const isTasks = activeNav === "Tasks";
  const isProjects = activeNav === "Projects";
  const isVault = activeNav === "Knowledge vault";
  return (
    <div className="mx-auto max-w-[1280px] px-5 py-8 sm:px-8">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="text-xs text-slate-500">Workspace overview</p>
          <h2 className="mt-1 text-2xl font-semibold">
            {isProjects
              ? "Projects"
              : isTasks
                ? "Tasks"
                : isVault
                  ? "Knowledge vault"
                  : activeNav}
          </h2>
          <p className="mt-2 text-sm text-slate-500">
            {isVault
              ? "Create, edit, and organize your notes."
              : "Every item stays actionable and easy to manage."}
          </p>
        </div>
        {isVault && (
          <button
            onClick={onNewNote}
            className="flex items-center gap-2 rounded-lg bg-indigo-500 px-3 py-2 text-xs"
          >
            <Plus className="size-3.5" /> New note
          </button>
        )}
        {isTasks && mode === "open" && (
          <button
            onClick={onAddTask}
            className="flex items-center gap-2 rounded-lg bg-indigo-500 px-3 py-2 text-xs"
          >
            <Plus className="size-3.5" /> Add task
          </button>
        )}
      </div>
      {isProjects && (
        <div className="mt-8 grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {projects.map((p) => (
            <button
              key={p.name}
              onClick={() =>
                setOpenProject(openProject === p.name ? null : p.name)
              }
              className="rounded-xl border border-white/[0.08] bg-[#0d1727] p-5 text-left"
            >
              <h3 className="font-semibold">{p.name}</h3>
              <p className="mt-2 text-xs text-slate-500">
                {p.tasks} open tasks
              </p>
              {openProject === p.name && (
                <p className="mt-5 border-t border-white/10 pt-4 text-xs text-indigo-200">
                  Project workspace opened. Tasks, notes, and activity are ready
                  here.
                </p>
              )}
            </button>
          ))}
        </div>
      )}
      {isTasks && (
        <div className="mt-8 rounded-xl border border-white/[0.08] bg-[#0d1727] p-4">
          <div className="flex gap-2 border-b border-white/10 pb-3">
            <button
              onClick={() => setMode("open")}
              className={`rounded px-3 py-2 text-xs ${mode === "open" ? "bg-indigo-500/20 text-indigo-200" : "text-slate-500"}`}
            >
              Open ({tasks.length})
            </button>
            <button
              onClick={() => setMode("completed")}
              className={`rounded px-3 py-2 text-xs ${mode === "completed" ? "bg-emerald-500/20 text-emerald-200" : "text-slate-500"}`}
            >
              Completed ({completed.length})
            </button>
          </div>
          {(mode === "open" ? tasks : completed).map((t: Task) => (
            <div
              key={t.title}
              className="flex items-center gap-3 border-b border-white/[0.06] py-4"
            >
              <button
                onClick={() => (mode === "open" ? onComplete(t) : onRestore(t))}
                className={
                  mode === "completed" ? "text-emerald-400" : "text-slate-500"
                }
              >
                <Check className="size-4" />
              </button>
              <div className="min-w-0 flex-1">
                <p className="text-sm">{t.title}</p>
                <p className="text-[11px] text-slate-600">
                  {t.project} · {t.priority}
                </p>
              </div>
              {mode === "open" && (
                <button
                  onClick={() => onArchiveTask(t)}
                  className="text-slate-500 hover:text-indigo-200"
                  aria-label={`Archive ${t.title}`}
                >
                  <Archive className="size-4" />
                </button>
              )}
            </div>
          ))}
        </div>
      )}
      {isVault && (
        <div className="mt-8 grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {notes.map((n: Note) => (
            <article
              key={n.id}
              className="rounded-xl border border-white/[0.08] bg-[#0d1727] p-5"
            >
              <button
                onClick={() => onEditNote(n)}
                className="w-full text-left"
              >
                <h3 className="font-semibold text-indigo-100">{n.title}</h3>
                <p className="mt-3 line-clamp-4 text-xs leading-relaxed text-slate-400">
                  {n.content}
                </p>
              </button>
              <div className="mt-5 flex gap-3 border-t border-white/10 pt-3">
                <button
                  onClick={() => onEditNote(n)}
                  className="flex items-center gap-1 text-xs text-slate-500 hover:text-white"
                >
                  <Pencil className="size-3" /> Edit
                </button>
                <button
                  onClick={() => onArchiveNote(n)}
                  className="flex items-center gap-1 text-xs text-slate-500 hover:text-indigo-200"
                >
                  <Archive className="size-3" /> Archive
                </button>
                <button
                  onClick={() => onDeleteNote(n)}
                  className="flex items-center gap-1 text-xs text-slate-500 hover:text-rose-300"
                >
                  <Trash2 className="size-3" /> Delete
                </button>
              </div>
            </article>
          ))}
        </div>
      )}
      {activeNav === "Archived" && (
        <div className="mt-8 rounded-xl border border-white/[0.08] bg-[#0d1727] p-4">
          <div className="flex gap-2 border-b border-white/10 pb-3">
            <button
              onClick={() => setArchiveMode("tasks")}
              className={`rounded px-3 py-2 text-xs ${archiveMode === "tasks" ? "bg-indigo-500/20 text-indigo-200" : "text-slate-500"}`}
            >
              Tasks ({archivedTasks.length})
            </button>
            <button
              onClick={() => setArchiveMode("notes")}
              className={`rounded px-3 py-2 text-xs ${archiveMode === "notes" ? "bg-indigo-500/20 text-indigo-200" : "text-slate-500"}`}
            >
              Knowledge vault ({archivedNotes.length})
            </button>
          </div>
          {archiveMode === "tasks"
            ? archivedTasks.map((task: Task) => (
                <div
                  key={task.title}
                  className="flex items-center gap-3 border-b border-white/[0.06] py-4"
                >
                  <div className="min-w-0 flex-1">
                    <p className="text-sm">{task.title}</p>
                    <p className="text-[11px] text-slate-600">
                      {task.project} · {task.priority}
                    </p>
                  </div>
                  <button
                    onClick={() => onRestoreArchivedTask(task)}
                    className="rounded-lg border border-white/10 px-3 py-2 text-xs text-indigo-200"
                  >
                    Restore
                  </button>
                </div>
              ))
            : archivedNotes.map((note: Note) => (
                <div
                  key={note.id}
                  className="flex items-center gap-3 border-b border-white/[0.06] py-4"
                >
                  <div className="min-w-0 flex-1">
                    <p className="text-sm">{note.title}</p>
                    <p className="truncate text-[11px] text-slate-600">
                      {note.content}
                    </p>
                  </div>
                  <button
                    onClick={() => onRestoreArchivedNote(note)}
                    className="rounded-lg border border-white/10 px-3 py-2 text-xs text-indigo-200"
                  >
                    Restore
                  </button>
                </div>
              ))}
          {archiveMode === "tasks" && archivedTasks.length === 0 && (
            <p className="py-10 text-center text-sm text-slate-500">
              No archived tasks yet. Use Archive on an open task.
            </p>
          )}
          {archiveMode === "notes" && archivedNotes.length === 0 && (
            <p className="py-10 text-center text-sm text-slate-500">
              No archived notes yet. Use Archive on a knowledge note.
            </p>
          )}
        </div>
      )}
      {activeNav === "Tags" && (
        <div className="mt-8 rounded-xl border border-white/[0.08] bg-[#0d1727] p-5">
          <h3 className="font-semibold">Knowledge vault tags</h3>
          <div className="mt-5 flex flex-wrap gap-2">
            {Array.from(
              new Set(
                notes.flatMap(
                  (note: Note) =>
                    `${note.title} ${note.content}`.match(/#[a-z0-9_-]+/gi) ??
                    [],
                ),
              ),
            ).map((tag) => (
              <button
                key={tag}
                onClick={() => setQuery(tag)}
                className="rounded-full border border-indigo-400/20 bg-indigo-400/10 px-3 py-1.5 text-xs text-indigo-200"
              >
                {tag}
              </button>
            ))}
            {!notes.some((note: Note) =>
              /#[a-z0-9_-]+/i.test(`${note.title} ${note.content}`),
            ) && (
              <p className="text-sm text-slate-500">
                Mention a tag like #research in a note and it will appear here.
              </p>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
