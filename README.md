# orthfx Monorepo

Welcome to the **orthfx** monorepo! This repository contains the core platforms and shared packages that power the digital infrastructure for Orthodox Christian parishes and organizations. 

## Architecture & Stack

This is a **pnpm workspace** monorepo containing multiple decoupled frontends that share a single source of truth (the backend) and a unified design system.

### Core Stack
- **Frameworks:** React 19, Vite 8, React Router v7
- **Styling:** Tailwind CSS v4, shadcn/ui
- **Backend/DB:** [Convex](https://convex.dev) (Serverless functions, database, file storage, auth)
- **Package Manager:** pnpm

### Project Structure

```text
orthfx/
├── apps/
│   ├── pledge/     # The crowdfunding/donation platform wrapper
│   ├── sites/      # The church website builder and directory
│   └── website/    # The main orthfx.com organizational site
│
└── packages/
    ├── backend/    # Single Convex backend (schemas, queries, mutations)
    ├── ui/         # Shared React components (shadcn) and Tailwind config
    └── config/     # Shared ESLint, TSConfig, etc. (future)
```

## Getting Started

1. **Install dependencies** from the root of the monorepo:
   ```bash
   pnpm install
   ```

2. **Run the development servers**:
   You can run all frontends simultaneously from the root:
   ```bash
   pnpm dev
   ```
   Or run a specific app:
   ```bash
   cd apps/pledge
   pnpm dev
   ```

3. **Run the Backend (Convex)**:
   To modify the database schema or write new backend functions, run the Convex dev server in the backend package:
   ```bash
   cd packages/backend
   pnpm dev
   ```

## Development Philosophy

- **Decoupled Backend:** The `@orthfx/backend` package handles all financial primitives (Funds, Transactions, Subscriptions) and structural primitives (Communities, Roles). Frontends simply act as "Presentation Layers" over this shared engine.
- **Shared UI:** To maintain a consistent brand across all Orthfx properties, build new UI components inside `@orthfx/ui`. Do not duplicate standard components (like Buttons or Cards) inside the individual apps.