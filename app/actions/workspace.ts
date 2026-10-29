'use server'

import { and, desc, eq } from 'drizzle-orm'
import { headers } from 'next/headers'
import { revalidatePath } from 'next/cache'
import { auth } from '@/lib/auth'
import { db } from '@/lib/db'
import { projects, tasks, notes } from '@/lib/db/schema'

async function getUserId() {
  const session = await auth.api.getSession({ headers: await headers() })
  if (!session?.user) throw new Error('Unauthorized')
  return session.user.id
}

export async function createTask(input: { title: string; projectId?: string; priority?: string }) {
  const userId = await getUserId(); const title = input.title.trim()
  if (!title || title.length > 200) throw new Error('Task title is invalid')
  const [task] = await db.insert(tasks).values({ id: crypto.randomUUID(), userId, title, projectId: input.projectId || null, priority: input.priority || 'medium' }).returning()
  revalidatePath('/'); return task
}

export async function completeTask(id: string) {
  const userId = await getUserId()
  await db.update(tasks).set({ status: 'completed', updatedAt: new Date() }).where(and(eq(tasks.id, id), eq(tasks.userId, userId)))
  revalidatePath('/')
}

export async function reopenTask(id: string) {
  const userId = await getUserId()
  await db.update(tasks).set({ status: 'todo', updatedAt: new Date() }).where(and(eq(tasks.id, id), eq(tasks.userId, userId)))
  revalidatePath('/')
}

export async function createNote(input: { title: string; content: string }) {
  const userId = await getUserId(); const title = input.title.trim(); const content = input.content.trim()
  if (!title || !content || title.length > 200) throw new Error('Note is invalid')
  const [note] = await db.insert(notes).values({ id: crypto.randomUUID(), userId, title, content }).returning()
  revalidatePath('/'); return note
}

export async function updateNote(id: string, input: { title: string; content: string }) {
  const userId = await getUserId(); const title = input.title.trim(); const content = input.content.trim()
  if (!title || !content || title.length > 200) throw new Error('Note is invalid')
  const [note] = await db.update(notes).set({ title, content, updatedAt: new Date() }).where(and(eq(notes.id, id), eq(notes.userId, userId))).returning()
  revalidatePath('/'); return note
}

export async function deleteNote(id: string) {
  const userId = await getUserId()
  await db.delete(notes).where(and(eq(notes.id, id), eq(notes.userId, userId)))
  revalidatePath('/')
}

export async function listWorkspace() {
  const userId = await getUserId()
  const [workspaceProjects, workspaceTasks, workspaceNotes] = await Promise.all([
    db.select().from(projects).where(eq(projects.userId, userId)).orderBy(desc(projects.updatedAt)),
    db.select().from(tasks).where(eq(tasks.userId, userId)).orderBy(desc(tasks.updatedAt)),
    db.select().from(notes).where(eq(notes.userId, userId)).orderBy(desc(notes.updatedAt)),
  ])
  return { projects: workspaceProjects, tasks: workspaceTasks, notes: workspaceNotes }
}
