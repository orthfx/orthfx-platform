# orthfx-platform Monorepo

Welcome to the **orthfx-platform** monorepo! This repository contains the core platforms and shared packages that power the digital infrastructure for Orthodox Christian parishes and organizations. 

## Architecture & Stack

This is a **Vite+** monorepo using **pnpm workspaces**. It provides a unified toolchain for multiple decoupled frontends that share a single source of truth (the backend) and a unified design system.

### Core Stack
- **Toolchain:** Vite+ (`vp` CLI)
- **Frameworks:** React 19, Vite 8, React Router v7
- **Styling:** Tailwind CSS v4, shadcn/ui
- **Backend/DB:** [Convex](https://convex.dev) (Serverless functions, database, file storage, auth)
- **Package Manager:** pnpm (wrapped by `vp`)

### Project Structure

```text
orthfx-platform/
├── apps/
│   ├── website/            # The main orthfx.com organizational site
│   ├── sites/              # The church website builder and directory
│   ├── pledge/             # The crowdfunding/donation platform wrapper
│   └── orthodox-registry/  # Directory and mapping of Orthodox communities
│
└── packages/
    ├── backend/    # Single Convex backend (schemas, queries, mutations)
    ├── ui/         # Shared React components (shadcn) and Tailwind config
    └── config/     # Shared configuration (future)
```

## Getting Started

1. **Install dependencies** from the root of the monorepo:
   ```bash
   vp install
   ```

2. **Run the development servers**:
   You can run all frontends simultaneously from the root:
   ```bash
   vp run dev
   ```
   Or run a specific app:
   ```bash
   vp run -C apps/pledge dev
   ```

3. **Run the Backend (Convex)**:
   To modify the database schema or write new backend functions, run the Convex dev server in the backend package:
   ```bash
   vp dlx convex dev --path packages/backend/convex
   ```

## Development Philosophy

- **Unified Toolchain:** Always use the `vp` CLI for dev, build, lint, and package management.
- **Decoupled Backend:** The `@orthfx/backend` package handles all financial and structural primitives. Frontends act as presentation layers over this shared engine.
- **Shared UI:** Build generic UI components inside `@orthfx/ui` to maintain consistency.
- **Pre-commit Checks:** All commits are automatically verified using `vp check --fix` on staged files.