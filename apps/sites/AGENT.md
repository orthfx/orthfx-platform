# sites — Agent Context

## What This Project Is

Multi-site platform for Orthodox Christian parishes. Handles community management, user auth, personnel directories, and parish maps. Each community (parish) gets its own public-facing page.

## Stack

- **Frontend**: React 19 + Vite 8 + TypeScript + Tailwind CSS 4
- **Backend**: Convex (database, serverless functions, auth)
- **Auth**: `@convex-dev/auth`
- **Email**: Resend
- **Maps**: MapLibre GL
- **Routing**: React Router v7
- **Toolchain**: Vite+ (`vp` CLI) — see `/Users/josh/Projects/project-scaffolding/stacks/vite-react.md`

## Running Locally

```bash
vp dev                  # Vite frontend
vp dlx convex dev       # Convex backend (run in separate terminal)
```

## Key Files & Directories

```
src/
  pages/           — route-level components
  components/      — shared UI
  lib/             — utilities
convex/
  schema.ts        — data model (read this first)
  *.ts             — queries, mutations, actions per domain
```

## Convex Domains

- `communities` — parish/community records
- `personnel` — directory of people per community
- `moderators` — admin roles
- `invites` — invite flow
- `files` — image uploads
- `userProfiles` — user data
- `auth` — Convex Auth config

## Current Focus

_Update this as work shifts._

## Gotchas

- Convex functions run in a sandboxed JS runtime — no Node.js APIs in queries/mutations, only in actions
- Auth is handled by `@convex-dev/auth` — check `auth.config.ts` before touching anything auth-related
- `convex/_generated/` is auto-generated — do not edit

## Skills

To install skills for all agents:

```bash
vp dlx skills add vercel-labs/agent-skills --skill vercel-react-best-practices -y
vp dlx skills add vercel-labs/agent-skills --skill vercel-composition-patterns -y
```

Installed project skills:

- `vercel-react-best-practices`
- `vercel-composition-patterns`
- `web-design-guidelines`
- `convex` (waynesutton/convexskills)

## Agent Responsibilities

- Keep this file current. If you change the stack, commands, or major features, update AGENT.md and README.md as part of the same task — not as an afterthought.
- Update `## Current Focus` at the start of each session to reflect what's actually being worked on.
- SPEC.md is the feature source of truth. If a feature ships, remove it from Planned or update its status.

## Memory

Read `.memory/MEMORY.md` first. Load only relevant files — do not load all memory files at once.
Write learnings back to `.memory/` as you discover them. For global context, see `~/.pemguin/memory/MEMORY.md`.

## Spec

See SPEC.md.
