'use client'

import { useMemo, useState } from 'react'
import { completeTask as persistCompleteTask, createTask as persistCreateTask } from './actions/workspace'
import {
  Archive,
  ArrowUpRight,
  Bell,
  BookOpen,
  Check,
  ChevronDown,
  Circle,
  CircleDot,
  Clock3,
  Command,
  FolderKanban,
  Inbox,
  LayoutDashboard,
  MoreHorizontal,
  Plus,
  Search,
  Settings2,
  Sparkles,
  Tag,
  TerminalSquare,
  Zap,
} from 'lucide-react'

type Task = { id?: string; title: string; project: string; status: string; priority: string; due?: string }

const initialTasks: Task[] = [
  { title: 'Finalize authentication flow', project: 'Nexus Command Center', status: 'In Progress', priority: 'Critical', due: 'Today' },
  { title: 'Document API error patterns', project: 'Nexus Command Center', status: 'Todo', priority: 'High', due: 'Tomorrow' },
  { title: 'Review deployment checklist', project: 'Marketing site v2', status: 'Todo', priority: 'Medium', due: 'Oct 31' },
  { title: 'Set up analytics events', project: 'Mobile companion', status: 'Backlog', priority: 'Low', due: 'Nov 04' },
]

const projects = [
  { name: 'Nexus Command Center', initials: 'NC', color: 'bg-indigo-500', progress: 68, tasks: 12, updated: '12 min ago' },
  { name: 'Marketing site v2', initials: 'MS', color: 'bg-amber-500', progress: 42, tasks: 8, updated: '2 hrs ago' },
  { name: 'Mobile companion', initials: 'MC', color: 'bg-cyan-500', progress: 24, tasks: 5, updated: 'Yesterday' },
]

const navItems = [
  { label: 'Command center', icon: LayoutDashboard, active: true },
  { label: 'Projects', icon: FolderKanban },
  { label: 'Tasks', icon: Check, count: '25' },
  { label: 'Knowledge vault', icon: BookOpen },
]

function StatusDot({ status }: { status: string }) {
  return <span className={`inline-block size-2 rounded-full ${status === 'In Progress' ? 'bg-indigo-400' : status === 'Todo' ? 'bg-sky-400' : status === 'Backlog' ? 'bg-slate-500' : 'bg-emerald-400'}`} />
}

export default function Page() {
  const [tasks, setTasks] = useState(initialTasks)
  const [activeNav, setActiveNav] = useState('Command center')
  const [query, setQuery] = useState('')
  const [showComposer, setShowComposer] = useState(false)
  const [newTaskTitle, setNewTaskTitle] = useState('')
  const [saving, setSaving] = useState(false)

  const filteredTasks = useMemo(() => tasks.filter((task) => `${task.title} ${task.project}`.toLowerCase().includes(query.toLowerCase())), [tasks, query])

  async function completeTask(index: number) {
    const task = filteredTasks[index]
    setTasks((current) => current.filter((item) => item !== task))
    if (task?.id) await persistCompleteTask(task.id).catch(() => undefined)
  }

  async function handleCreateTask() {
    const title = newTaskTitle.trim()
    if (!title || saving) return
    setSaving(true)
    try {
      const saved = await persistCreateTask({ title })
      setTasks((current) => [{ id: saved.id, title, project: 'Nexus Command Center', status: 'Todo', priority: 'Medium', due: 'Today' }, ...current])
    } catch {
      setTasks((current) => [{ title, project: 'Nexus Command Center', status: 'Todo', priority: 'Medium', due: 'Today' }, ...current])
    } finally {
      setNewTaskTitle('')
      setSaving(false)
      setShowComposer(false)
    }
  }

  return (
    <main className="min-h-screen bg-[#09101d] text-slate-100 selection:bg-indigo-500/30">
      <div className="flex min-h-screen overflow-x-hidden">
        <aside className="hidden w-[252px] shrink-0 border-r border-white/[0.07] bg-[#0b1423] px-4 py-5 lg:flex lg:flex-col">
          <div className="flex items-center gap-3 px-2">
            <div className="grid size-8 place-items-center rounded-lg bg-indigo-500 shadow-lg shadow-indigo-500/20"><TerminalSquare className="size-[18px] text-white" /></div>
            <span className="text-[15px] font-semibold tracking-tight">nexus</span>
            <span className="ml-auto rounded-md border border-white/10 px-1.5 py-0.5 font-mono text-[9px] text-slate-500">v0.1</span>
          </div>

          <button onClick={() => setShowComposer(true)} className="mt-8 flex h-10 items-center justify-center gap-2 rounded-lg bg-indigo-500 text-sm font-medium text-white transition hover:bg-indigo-400"><Plus className="size-4" /> New item <span className="ml-2 rounded border border-white/20 px-1.5 py-0.5 font-mono text-[10px]">N</span></button>

          <nav className="mt-8 flex flex-col gap-1">
            <p className="mb-2 px-2 text-[10px] font-semibold uppercase tracking-[0.16em] text-slate-600">Workspace</p>
            {navItems.map(({ label, icon: Icon, active, count }) => <button key={label} onClick={() => setActiveNav(label)} className={`flex items-center gap-3 rounded-lg px-3 py-2.5 text-left text-[13px] transition ${activeNav === label || active && activeNav === 'Command center' ? 'bg-white/[0.08] text-white' : 'text-slate-400 hover:bg-white/[0.04] hover:text-slate-200'}`}><Icon className={`size-[17px] ${activeNav === label ? 'text-indigo-300' : 'text-slate-500'}`} /><span>{label}</span>{count && <span className="ml-auto font-mono text-[11px] text-slate-600">{count}</span>}</button>)}
          </nav>

          <div className="mt-8 flex flex-col gap-1">
            <p className="mb-2 px-2 text-[10px] font-semibold uppercase tracking-[0.16em] text-slate-600">Views</p>
            <button className="flex items-center gap-3 rounded-lg px-3 py-2.5 text-[13px] text-slate-400 hover:bg-white/[0.04]"><Archive className="size-[17px] text-slate-500" />Archived</button>
            <button className="flex items-center gap-3 rounded-lg px-3 py-2.5 text-[13px] text-slate-400 hover:bg-white/[0.04]"><Tag className="size-[17px] text-slate-500" />Tags</button>
          </div>

          <div className="mt-auto rounded-xl border border-indigo-400/15 bg-indigo-500/[0.07] p-3.5"><div className="mb-2 flex items-center gap-2 text-xs font-medium text-indigo-200"><Sparkles className="size-3.5" /> Your workspace</div><p className="text-[11px] leading-relaxed text-slate-500">Build momentum by keeping your next action visible.</p><div className="mt-3 h-1 overflow-hidden rounded-full bg-white/10"><div className="h-full w-[68%] rounded-full bg-indigo-400" /></div><p className="mt-2 text-[10px] text-slate-500">68% of weekly goals complete</p></div>
        </aside>

        <section className="min-w-0 flex-1">
          <header className="flex h-[72px] items-center justify-between border-b border-white/[0.07] px-5 sm:px-8"><div className="flex items-center gap-3"><div className="grid size-8 place-items-center rounded-lg bg-indigo-500 lg:hidden"><TerminalSquare className="size-4" /></div><div><p className="text-[11px] font-medium uppercase tracking-[0.14em] text-slate-500">Tuesday, October 27, 2026</p><h1 className="mt-0.5 text-[18px] font-semibold tracking-tight text-slate-100">Good morning, Prathik <span className="text-slate-500">/</span> <span className="text-slate-400">{activeNav}</span></h1></div></div><div className="flex items-center gap-2 sm:gap-4"><div className="hidden h-9 w-64 items-center gap-2 rounded-lg border border-white/[0.08] bg-white/[0.025] px-3 sm:flex"><Search className="size-4 text-slate-500" /><input value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Search everything..." className="min-w-0 flex-1 bg-transparent text-xs text-slate-200 outline-none placeholder:text-slate-600" /><kbd className="font-mono text-[10px] text-slate-600">⌘ K</kbd></div><button className="grid size-9 place-items-center rounded-lg text-slate-500 hover:bg-white/[0.06] hover:text-slate-200"><Bell className="size-[17px]" /></button><div className="grid size-8 place-items-center rounded-full bg-gradient-to-br from-indigo-400 to-violet-600 text-[11px] font-bold text-white">PK</div></div></header>

          {activeNav !== 'Command center' ? <WorkspaceView activeNav={activeNav} tasks={tasks} onComplete={completeTask} onAddTask={() => setShowComposer(true)} /> : <div className="mx-auto max-w-[1280px] px-5 py-7 sm:px-8 lg:px-10">
            <div className="mb-8 flex flex-wrap items-end justify-between gap-4"><div><p className="mb-1 text-xs text-slate-500">Here&apos;s the pulse of your workspace.</p><h2 className="text-2xl font-semibold tracking-tight text-white">Make progress, one commit at a time.</h2></div><button onClick={() => setShowComposer(true)} className="flex items-center gap-2 rounded-lg border border-white/10 bg-white/[0.04] px-3.5 py-2 text-xs font-medium text-slate-200 transition hover:bg-white/[0.08]"><Plus className="size-3.5" /> Add task</button></div>

            <div className="grid grid-cols-2 gap-3 lg:grid-cols-4"><StatCard label="Active projects" value="3" hint="All systems moving" icon={<FolderKanban />} accent="indigo" /><StatCard label="Open tasks" value="25" hint="4 due this week" icon={<CircleDot />} /><StatCard label="Overdue" value="2" hint="Needs your attention" icon={<Clock3 />} accent="rose" /><StatCard label="Notes added" value="8" hint="This month" icon={<BookOpen />} /></div>

            <div className="mt-8 grid gap-5 xl:grid-cols-[1.35fr_1fr]"><div className="rounded-xl border border-white/[0.08] bg-[#0d1727]"><div className="flex items-center justify-between border-b border-white/[0.07] px-5 py-4"><div><h3 className="text-sm font-semibold text-slate-100">Your projects</h3><p className="mt-1 text-[11px] text-slate-500">Active workspaces and their momentum</p></div><button className="flex items-center gap-1 text-[11px] font-medium text-indigo-300 hover:text-indigo-200">View all <ArrowUpRight className="size-3" /></button></div><div className="divide-y divide-white/[0.06]">{projects.map((project) => <div key={project.name} className="group flex items-center gap-4 px-5 py-4 transition hover:bg-white/[0.025]"><div className={`grid size-9 shrink-0 place-items-center rounded-lg ${project.color}/15 text-[11px] font-bold ${project.color.replace('bg-', 'text-')}`}>{project.initials}</div><div className="min-w-0 flex-1"><div className="flex items-center justify-between gap-3"><p className="truncate text-[13px] font-medium text-slate-200">{project.name}</p><span className="shrink-0 font-mono text-[11px] text-slate-500">{project.progress}%</span></div><div className="mt-2 h-1 overflow-hidden rounded-full bg-white/[0.07]"><div className={`h-full rounded-full ${project.color}`} style={{ width: `${project.progress}%` }} /></div><div className="mt-2 flex items-center gap-3 text-[10px] text-slate-600"><span>{project.tasks} open tasks</span><span>Updated {project.updated}</span></div></div><button className="hidden text-slate-600 group-hover:block"><MoreHorizontal className="size-4" /></button></div>)}</div></div>

              <div className="rounded-xl border border-white/[0.08] bg-[#0d1727]"><div className="flex items-center justify-between border-b border-white/[0.07] px-5 py-4"><div><h3 className="text-sm font-semibold text-slate-100">Focus queue</h3><p className="mt-1 text-[11px] text-slate-500">The next things worth your attention</p></div><button className="grid size-7 place-items-center rounded-md text-slate-500 hover:bg-white/[0.06]"><MoreHorizontal className="size-4" /></button></div><div className="flex flex-col gap-1 p-2">{filteredTasks.slice(0, 4).map((task, index) => <div key={task.title} className="group flex items-start gap-3 rounded-lg p-3 transition hover:bg-white/[0.04]"><button onClick={() => completeTask(index)} aria-label={`Complete ${task.title}`} className="mt-0.5 text-slate-600 transition hover:text-emerald-400"><Circle className="size-4" /></button><div className="min-w-0 flex-1"><p className="text-[12px] leading-snug text-slate-300">{task.title}</p><div className="mt-2 flex flex-wrap items-center gap-x-2 gap-y-1 text-[10px] text-slate-600"><span className="flex items-center gap-1"><StatusDot status={task.status} />{task.status}</span><span>·</span><span className={task.priority === 'Critical' ? 'text-rose-400' : task.priority === 'High' ? 'text-amber-400' : ''}>{task.priority}</span>{task.due && <><span>·</span><span>{task.due}</span></>}</div></div></div>)}{filteredTasks.length === 0 && <div className="px-3 py-8 text-center text-xs text-slate-500">No tasks match your search.</div>}</div><div className="border-t border-white/[0.07] px-5 py-3"><button className="text-[11px] font-medium text-indigo-300 hover:text-indigo-200">Open task manager <ArrowUpRight className="ml-1 inline size-3" /></button></div></div></div>

            <div className="mt-5 grid gap-5 lg:grid-cols-[1fr_1fr_1fr]"><ActivityCard title="Recently updated" icon={<Zap className="size-4 text-amber-300" />}><ActivityRow icon={<Check />} title="Completed task" detail="Create database schema" time="12 min ago" color="text-emerald-400" /><ActivityRow icon={<BookOpen />} title="Updated note" detail="Better Auth patterns" time="48 min ago" color="text-indigo-300" /></ActivityCard><ActivityCard title="Knowledge vault" icon={<BookOpen className="size-4 text-cyan-300" />}><div className="flex flex-wrap gap-2 py-1"><span className="rounded-md bg-indigo-400/10 px-2.5 py-1.5 text-[11px] text-indigo-200">#architecture <b className="ml-1 text-indigo-400">12</b></span><span className="rounded-md bg-cyan-400/10 px-2.5 py-1.5 text-[11px] text-cyan-200">#debugging <b className="ml-1 text-cyan-400">8</b></span><span className="rounded-md bg-amber-400/10 px-2.5 py-1.5 text-[11px] text-amber-200">#research <b className="ml-1 text-amber-400">5</b></span></div><p className="mt-3 text-[11px] text-slate-500">25 notes organized across 6 tags.</p></ActivityCard><ActivityCard title="Quick actions" icon={<Command className="size-4 text-violet-300" />}><div className="grid grid-cols-2 gap-2"><QuickAction icon={<Plus />} label="New project" /><QuickAction icon={<BookOpen />} label="Write a note" /><QuickAction icon={<Search />} label="Search vault" /><QuickAction icon={<Settings2 />} label="Workspace" /></div></ActivityCard></div>
          </div>}
        </section>
      </div>

      {showComposer && <div className="fixed inset-0 z-20 grid place-items-center bg-black/60 p-4 backdrop-blur-sm" onClick={() => setShowComposer(false)}><div className="w-full max-w-md rounded-xl border border-white/10 bg-[#111d30] p-5 shadow-2xl" onClick={(e) => e.stopPropagation()}><div className="flex items-center justify-between"><div><h2 className="text-sm font-semibold text-white">Create a new task</h2><p className="mt-1 text-xs text-slate-500">Capture the next action while it&apos;s fresh.</p></div><button onClick={() => setShowComposer(false)} className="text-slate-500 hover:text-white" aria-label="Close composer">×</button></div><label className="mt-5 block text-xs font-medium text-slate-400">Task title<input autoFocus value={newTaskTitle} onChange={(event) => setNewTaskTitle(event.target.value)} onKeyDown={(event) => { if (event.key === 'Enter' && !event.nativeEvent.isComposing && event.keyCode !== 229) void handleCreateTask() }} className="mt-2 w-full rounded-lg border border-white/10 bg-black/20 px-3 py-2.5 text-sm text-white outline-none ring-indigo-400 focus:ring-2" placeholder="What needs to happen?" /></label><div className="mt-5 flex justify-end gap-2"><button onClick={() => setShowComposer(false)} className="rounded-lg px-3 py-2 text-xs text-slate-400 hover:bg-white/[0.05]">Cancel</button><button onClick={() => void handleCreateTask()} disabled={!newTaskTitle.trim() || saving} className="rounded-lg bg-indigo-500 px-3 py-2 text-xs font-medium text-white hover:bg-indigo-400 disabled:cursor-not-allowed disabled:opacity-50">{saving ? 'Saving…' : 'Create task'}</button></div></div></div>}
    </main>
  )
}

function WorkspaceView({ activeNav, tasks, onComplete, onAddTask }: { activeNav: string; tasks: Task[]; onComplete: (index: number) => void; onAddTask: () => void }) {
  const isProjects = activeNav === 'Projects'
  const isTasks = activeNav === 'Tasks'
  return <div className="mx-auto max-w-[1280px] px-5 py-7 sm:px-8 lg:px-10">
    <div className="mb-8 flex flex-wrap items-end justify-between gap-4"><div><p className="mb-1 text-xs text-slate-500">Workspace overview</p><h2 className="text-2xl font-semibold tracking-tight text-white">{isProjects ? 'Projects' : isTasks ? 'Tasks' : 'Knowledge vault'}</h2><p className="mt-2 text-sm text-slate-500">{isProjects ? 'Track momentum across every active initiative.' : isTasks ? 'Keep the next action visible and moving.' : 'Your notes, patterns, and research in one place.'}</p></div>{isTasks && <button onClick={onAddTask} className="flex items-center gap-2 rounded-lg bg-indigo-500 px-3.5 py-2 text-xs font-medium text-white hover:bg-indigo-400"><Plus className="size-3.5" /> Add task</button>}</div>
    {isProjects ? <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">{projects.map((project) => <div key={project.name} className="rounded-xl border border-white/[0.08] bg-[#0d1727] p-5"><div className="flex items-center gap-3"><div className={`grid size-10 place-items-center rounded-lg ${project.color}/15 text-xs font-bold ${project.color.replace('bg-', 'text-')}`}>{project.initials}</div><div><h3 className="text-sm font-semibold text-slate-200">{project.name}</h3><p className="mt-1 text-[11px] text-slate-500">{project.tasks} open tasks · Updated {project.updated}</p></div></div><div className="mt-6 flex items-center justify-between text-[11px] text-slate-500"><span>Progress</span><span className="font-mono text-slate-300">{project.progress}%</span></div><div className="mt-2 h-1.5 overflow-hidden rounded-full bg-white/[0.07]"><div className={`h-full rounded-full ${project.color}`} style={{ width: `${project.progress}%` }} /></div></div>)}</div> : isTasks ? <div className="rounded-xl border border-white/[0.08] bg-[#0d1727] p-2">{tasks.map((task, index) => <div key={task.id ?? task.title} className="flex items-center gap-3 rounded-lg p-4 hover:bg-white/[0.03]"><button onClick={() => onComplete(index)} aria-label={`Complete ${task.title}`} className="text-slate-600 hover:text-emerald-400"><Circle className="size-4" /></button><div className="min-w-0 flex-1"><p className="text-sm text-slate-200">{task.title}</p><p className="mt-1 text-[11px] text-slate-500">{task.project} · {task.status} · {task.priority}{task.due ? ` · Due ${task.due}` : ''}</p></div></div>)}{tasks.length === 0 && <p className="p-8 text-center text-sm text-slate-500">No open tasks.</p>}</div> : <div className="grid gap-4 md:grid-cols-2"><div className="rounded-xl border border-white/[0.08] bg-[#0d1727] p-5"><div className="flex items-center gap-2"><BookOpen className="size-4 text-cyan-300" /><h3 className="text-sm font-semibold text-slate-200">Recent notes</h3></div><div className="mt-5 flex flex-col gap-3">{['Better Auth patterns', 'Database schema decisions', 'Deployment checklist'].map((note) => <button key={note} className="rounded-lg border border-white/[0.06] p-3 text-left hover:border-indigo-400/30"><p className="text-sm text-slate-300">{note}</p><p className="mt-1 text-[11px] text-slate-600">Updated recently</p></button>)}</div></div><div className="rounded-xl border border-white/[0.08] bg-[#0d1727] p-5"><h3 className="text-sm font-semibold text-slate-200">Browse by tag</h3><div className="mt-5 flex flex-wrap gap-2">{['#architecture', '#debugging', '#research', '#auth'].map((tag) => <span key={tag} className="rounded-md bg-indigo-400/10 px-2.5 py-1.5 text-[11px] text-indigo-200">{tag}</span>)}</div><p className="mt-5 text-xs text-slate-500">25 notes organized across 6 tags.</p></div></div>}
  </div>
}

function StatCard({ label, value, hint, icon, accent }: { label: string; value: string; hint: string; icon: React.ReactNode; accent?: string }) { return <div className="rounded-xl border border-white/[0.08] bg-[#0d1727] p-4"><div className="flex items-start justify-between"><p className="text-[11px] text-slate-500">{label}</p><span className={`text-slate-600 ${accent === 'rose' ? 'text-rose-400/70' : accent === 'indigo' ? 'text-indigo-300/70' : ''}`}>{icon}</span></div><p className="mt-3 text-2xl font-semibold tracking-tight text-white">{value}</p><p className="mt-1 text-[10px] text-slate-600">{hint}</p></div> }
function ActivityCard({ title, icon, children }: { title: string; icon: React.ReactNode; children: React.ReactNode }) { return <div className="rounded-xl border border-white/[0.08] bg-[#0d1727] p-5"><div className="mb-4 flex items-center gap-2"><span>{icon}</span><h3 className="text-sm font-semibold text-slate-200">{title}</h3></div>{children}</div> }
function ActivityRow({ icon, title, detail, time, color }: { icon: React.ReactNode; title: string; detail: string; time: string; color: string }) { return <div className="flex items-center gap-3 border-b border-white/[0.06] py-2.5 last:border-0"><span className={color}>{icon}</span><div className="min-w-0 flex-1"><p className="text-[11px] text-slate-400">{title}</p><p className="truncate text-[11px] text-slate-600">{detail}</p></div><span className="text-[10px] text-slate-600">{time}</span></div> }
function QuickAction({ icon, label }: { icon: React.ReactNode; label: string }) { return <button className="flex items-center gap-2 rounded-lg border border-white/[0.07] bg-white/[0.02] px-2.5 py-2 text-left text-[10px] text-slate-400 hover:border-indigo-400/30 hover:text-indigo-200"><span className="text-slate-600">{icon}</span>{label}</button> }
