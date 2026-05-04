# @orthfx/backend

This package is the single source of truth for the Orthfx ecosystem. It houses the [Convex](https://convex.dev) database schema, serverless queries, mutations, and file storage logic.

## Architecture

The backend is intentionally decoupled from any specific frontend UI. It operates on "primitives":

1. **Financial Primitives:** `funds`, `transactions`, and `subscriptions`. These handle the core routing of money regardless of where the donation occurred.
2. **Presentation Primitives:** `pledgePages` and `givingForms`. These store the UI configurations for how funds are displayed on different frontends (e.g., a GoFundMe-style page vs. a generic church donation widget).
3. **Organizational Primitives:** `communities`, `personnel`, `roles`, and `invites`. These handle the structure and access control for parishes and monasteries.

## Development

To develop against the backend, open a terminal in this directory and run:

```bash
vp dlx convex dev
```

This will sync your local `convex/` directory with your cloud deployment. All frontends in the monorepo import their generated types and API routes directly from this package using `import { api } from "@orthfx/backend/api"`.