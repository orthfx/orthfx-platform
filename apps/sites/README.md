# orthdx.site (Sites)

Many Orthodox parishes — especially smaller or newer ones — have no web presence at all. Building even a basic website requires technical knowledge or money that a small parish may not have. orthdx.site gives every Orthodox community a free, clean single page at `parish.orthdx.site` with just the essentials.

As part of the **orthfx monorepo**, this application integrates deeply with `@orthfx/backend` and `@orthfx/ui`. This allows parishes on `sites` to easily toggle on embedded donation widgets powered by the exact same financial engine that runs the `pledge` app.

## Features

- Public-facing pages per community at `{slug}.orthdx.site`
- Community info: name, jurisdiction, type, address, service schedules
- Clergy listings and Role-Based Access Control (Admin, Editor, Moderator)
- Invite-only claim system for parishes
- Embedded "Giving Forms" (powered by the shared backend's `funds` primitive)

## Development

```bash
# Run the Vite+ dev server
vp dev

# Run the Convex backend
vp dlx convex dev
```

For local development involving subdomain routing, use `*.localhost` (e.g., `stmichael.localhost:5173`).

All API calls to the database should import from `@orthfx/backend/api`.

## Deployment

Deploys automatically to Netlify on push to `main`.

- **Site:** orthfx-platform-sites
- **URL:** https://orthfx-platform-sites.netlify.app
- **Env vars:** `VITE_CONVEX_URL` (set in Netlify dashboard)