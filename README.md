# Nexus Software Command Center

Nexus is a personal software command center for turning scattered project work into a clear operating system. It combines projects, tasks, and a knowledge vault in one focused workspace, with secure account-based persistence through Neon Postgres.

## Table of Contents

- [What This App Does](#what-this-app-does)
- [Core Workflows](#core-workflows)
- [Tech Stack Decisions](#tech-stack-decisions)
- [Project Structure](#project-structure)
- [Architecture Decisions](#architecture-decisions)
- [Data Model](#data-model)
- [Security Model](#security-model)
- [Getting Started](#getting-started)
- [Validation](#validation)
- [What Comes Next](#what-comes-next)

## What This App Does

Nexus gives developers one place to plan, execute, and remember their work:

- Create and organize software projects.
- Track tasks by status, priority, due date, and project.
- Complete tasks and reopen them when priorities change.
- Create, edit, search, and remove knowledge-vault notes.
- Discover tags from note content and use them to filter knowledge.
- Review archived tasks and notes separately from active work.
- Search across projects, tasks, and notes from the command-center interface.
- Keep every user's workspace isolated behind Better Auth sessions.

The interface is intentionally dense but calm: a dark navy canvas, restrained borders, indigo action states, and readable information hierarchy make the workspace useful for daily execution rather than presentation alone.

## Core Workflows

### Projects

Projects are the top-level containers for initiatives. A project has a name, description, status, priority, and timestamps. Projects can be opened from the Projects view to inspect related work and provide context for tasks and notes.

### Tasks

Tasks represent the next actionable unit of work. They can be created with a title, project association, and priority, then marked completed or reopened. The Tasks view separates active work from completed work so the main queue stays focused.

### Knowledge Vault

The Knowledge Vault is a working note system, not a static reference page. Users can create a note, open it, edit its title or content, and delete it. Hashtags mentioned in note titles or content are extracted into the tag index, allowing related notes to be found without manually maintaining a second list.

### Archive

Archive is split into two areas:

- **Tasks** — completed or archived task records.
- **Knowledge Vault** — archived notes kept out of the active note list.

Archived records can be opened, restored, or permanently deleted according to the action presented by the UI.

## Tech Stack Decisions

- **Next.js 16 App Router** — provides server components, route handlers, server actions, and a production-ready React application structure.
- **React 19** — powers the interactive workspace views and client-side form state.
- **TypeScript** — keeps the data contracts between server actions, database rows, and UI components explicit.
- **Neon Postgres** — provides durable relational storage for users and workspace records.
- **Drizzle ORM** — supplies typed SQL queries while keeping the schema close to PostgreSQL.
- **Better Auth** — handles email/password authentication, sessions, password hashing, and protected server access.
- **Tailwind CSS 4** — provides the responsive visual system and semantic design tokens.
- **Lucide React** — provides consistent accessible interface icons.
- **Vercel Analytics** — provides lightweight product analytics without changing the core data model.

## Project Structure

```text
app/
  actions/
    workspace.ts       # Authenticated workspace mutations and reads
  api/auth/[...all]/    # Better Auth route handler
  sign-in/             # Sign-in page
  sign-up/             # Sign-up page
  globals.css          # Global tokens and application styles
  layout.tsx           # Root metadata and application shell
  page.tsx             # Workspace dashboard and interactive views
components/
  auth-form.tsx        # Shared sign-in/sign-up form
lib/
  auth.ts              # Server-side Better Auth configuration
  auth-client.ts       # Client-side auth helpers
  db/
    index.ts           # Shared PostgreSQL pool and Drizzle client
    schema.ts          # Auth and workspace tables
next.config.mjs        # Security headers and Next.js configuration
package.json           # Scripts and dependencies
```

## Architecture Decisions

### 1. Neon is the persistence layer

Workspace data must survive reloads, devices, and deployments, so Nexus uses Neon Postgres rather than browser-only state. The database is the source of truth; client state is used only for immediate interaction and optimistic presentation.

### 2. Drizzle and Better Auth share one pool

`lib/db/index.ts` creates a single `pg` pool and exposes it to Drizzle. Better Auth uses the same PostgreSQL connection strategy, avoiding multiple competing database clients and keeping deployment configuration simple.

### 3. Server actions are the workspace API

Workspace reads and mutations live in `app/actions/workspace.ts`. This keeps database credentials and authorization on the server while allowing the client workspace to call typed functions directly.

### 4. Every user-owned query is scoped by session user ID

Neon does not provide Supabase-style row-level security for this application. Each action first resolves the authenticated user with `auth.api.getSession`, then includes that user's ID in every read, update, and delete condition.

### 5. Status is explicit, not inferred from UI visibility

Task completion is represented by the task `status` column. A task is reopened by changing its status back to `todo`, rather than relying on a client-only checkbox. Projects also retain explicit status and priority values.

### 6. Notes are first-class CRUD records

The vault is backed by a notes table with create, read, update, and delete operations. Editing a note updates its timestamp so recently changed knowledge remains discoverable.

### 7. Tags are derived from note text and stored for future indexing

A hashtag such as `#typescript` in a note title or body is a meaningful piece of metadata. The UI extracts those mentions for the tag view while the schema also provides `tag` and `note_tag` tables for durable tag relationships and future faceted search.

### 8. Search is a shared workspace capability

Search is applied across the current workspace data rather than creating separate search implementations per screen. This keeps the command-center experience consistent and makes it easy to extend with database-backed full-text search later.

### 9. Responsive layouts preserve task context

The desktop layout uses a persistent navigation rail and a multi-column content area. Smaller screens collapse secondary content into stacked sections so the active task, note, or project remains readable without horizontal scrolling.

### 10. Security headers are defense in depth

The Next.js configuration adds baseline response headers such as content-type sniffing protection, a strict referrer policy, and transport security for deployed HTTPS environments. Authentication and authorization remain enforced on the server.

## Data Model

### Better Auth tables

- `user` — account identity and profile information.
- `session` — active authenticated sessions and expiry data.
- `account` — email/password credential records.
- `verification` — verification tokens used by Better Auth flows.

### Workspace tables

- `project` — project name, description, status, priority, owner, and timestamps.
- `task` — task title, description, project relationship, status, priority, due date, owner, and timestamps.
- `note` — knowledge-vault title, content, project relationship, owner, and timestamps.
- `tag` — user-owned tag names.
- `note_tag` — the many-to-many relationship between notes and tags.

All workspace tables include a plain `userId` column. Application queries use that value for tenant isolation.

## Security Model

- Email/password authentication is handled by Better Auth; passwords are never stored in plaintext.
- Protected pages and mutations validate the server session, not merely the presence of a browser cookie.
- Workspace reads and writes are scoped to the authenticated user's ID.
- User-provided titles and note content are trimmed and validated before insertion or update.
- Database operations use Drizzle's parameterized query builders.
- Authentication secrets and database URLs are supplied through environment variables and are never committed.
- Development cookies use the secure cross-site settings required by the v0 preview iframe without weakening production defaults.

## Getting Started

### Prerequisites

- Node.js 20 or newer.
- pnpm 12 or newer.
- A Neon Postgres integration or compatible PostgreSQL database.
- A Better Auth secret with at least 32 characters.

### Install dependencies

```bash
pnpm install
```

### Configure environment variables

Create `.env.development.local` for local development:

```env
DATABASE_URL=postgresql://...
BETTER_AUTH_SECRET=replace-with-a-random-secret-at-least-32-characters
```

In v0 and Vercel, configure these through the project's integration and environment-variable settings rather than committing a local environment file.

### Start development

```bash
pnpm dev
```

Then open `http://localhost:3000`.

### Production build

```bash
pnpm build
pnpm start
```

## Validation

The project should be checked with:

```bash
pnpm exec tsc --noEmit
pnpm build
```

For the authenticated workspace, manually verify:

1. Sign up with an email and password.
2. Reload the protected workspace and confirm the session remains active.
3. Create a project and task.
4. Complete and reopen a task.
5. Create, edit, search, tag, archive, restore, and delete a note.
6. Sign out and confirm protected routes redirect to sign-in.

## What Comes Next

- Add full project CRUD mutations and project detail routes.
- Persist archive state as explicit task and note fields with server actions.
- Add database-backed full-text search and pagination for larger workspaces.
- Add note-tag mutations so derived hashtag mentions stay synchronized with the `tag` and `note_tag` tables.
- Add task activity history and project-level progress summaries.
- Add automated integration tests for authorization boundaries and CRUD workflows.
