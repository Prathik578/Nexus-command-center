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
  const userId = await getUserId()
  const title = input.title.trim()
  if (!title || title.length > 200) throw new Error('Task title is invalid')
  const [task] = await db.insert(tasks).values({
    id: crypto.randomUUID(),
    userId,
    title,
    projectId: input.projectId || null,
    priority: input.priority || 'medium',
  }).returning()
  revalidatePath('/')
  return task
}

export async function completeTask(id: string) {
  const userId = await getUserId()
  await db.delete(tasks).where(and(eq(tasks.id, id), eq(tasks.userId, userId)))
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
