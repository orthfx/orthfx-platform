<!--VITE PLUS START-->

# Using Vite+, the Unified Toolchain for the Web

This project is using Vite+, a unified toolchain built on top of Vite, Rolldown, Vitest, tsdown, Oxlint, Oxfmt, and Vite Task. Vite+ wraps runtime management, package management, and frontend tooling in a single global CLI called `vp`. Vite+ is distinct from Vite, but it invokes Vite through `vp dev` and `vp build`.

## Vite+ Workflow

`vp` is a global binary that handles the full development lifecycle. Run `vp help` to print a list of commands and `vp <command> --help` for information about a specific command.

### Start

- create - Create a new project from a template
- migrate - Migrate an existing project to Vite+
- config - Configure hooks and agent integration
- staged - Run linters on staged files
- install (`i`) - Install dependencies
- env - Manage Node.js versions

### Develop

- dev - Run the development server
- check - Run format, lint, and TypeScript type checks
- lint - Lint code
- fmt - Format code
- test - Run tests

### Execute

- run - Run monorepo tasks
- exec - Execute a command from local `node_modules/.bin`
- dlx - Execute a package binary without installing it as a dependency
- cache - Manage the task cache

### Build

- build - Build for production
- pack - Build libraries
- preview - Preview production build

### Manage Dependencies

Vite+ automatically detects and wraps the underlying package manager such as pnpm, npm, or Yarn through the `packageManager` field in `package.json` or package manager-specific lockfiles.

- add - Add packages to dependencies
- remove (`rm`, `un`, `uninstall`) - Remove packages from dependencies
- update (`up`) - Update packages to latest versions
- dedupe - Deduplicate dependencies
- outdated - Check for outdated packages
- list (`ls`) - List installed packages
- why (`explain`) - Show why a package is installed
- info (`view`, `show`) - View package information from the registry
- link (`ln`) / unlink - Manage local package links
- pm - Forward a command to the package manager

### Maintain

- upgrade - Update `vp` itself to the latest version

These commands map to their corresponding tools. For example, `vp dev --port 3000` runs Vite's dev server and works the same as Vite. `vp test` runs JavaScript tests through the bundled Vitest. The version of all tools can be checked using `vp --version`. This is useful when researching documentation, features, and bugs.

## Common Pitfalls

- **Using the package manager directly:** Do not use pnpm, npm, or Yarn directly. Vite+ can handle all package manager operations.
- **Always use Vite commands to run tools:** Don't attempt to run `vp vitest` or `vp oxlint`. They do not exist. Use `vp test` and `vp lint` instead.
- **Running scripts:** Vite+ commands take precedence over `package.json` scripts. If there is a `test` script defined in `scripts` that conflicts with the built-in `vp test` command, run it using `vp run test`.
- **Do not install Vitest, Oxlint, Oxfmt, or tsdown directly:** Vite+ wraps these tools. They must not be installed directly. You cannot upgrade these tools by installing their latest versions. Always use Vite+ commands.
- **Use Vite+ wrappers for one-off binaries:** Use `vp dlx` instead of package-manager-specific `dlx`/`npx` commands.
- **Import JavaScript modules from `vite-plus`:** Instead of importing from `vite` or `vitest`, all modules should be imported from the project's `vite-plus` dependency. For example, `import { defineConfig } from 'vite-plus';` or `import { expect, test, vi } from 'vite-plus/test';`. You must not install `vitest` to import test utilities.
- **Type-Aware Linting:** There is no need to install `oxlint-tsgolint`, `vp lint --type-aware` works out of the box.

## Review Checklist for Agents

- [ ] Run `vp install` after pulling remote changes and before getting started.
- [ ] Run `vp check` and `vp test` to validate changes.
<!--VITE PLUS END-->

# Project Overview

This monorepo powers the orthfx platform — digital tools for Orthodox Christian parishes.

```
orthfx-platform/
├── apps/
│   ├── website/            # orthfx.com organizational site (package: orthfx)
│   ├── sites/              # Church website builder at orthdx.site (package: sites)
│   ├── pledge/             # Crowdfunding/donation platform (package: pledge)
│   └── orthodox-registry/  # Parish directory and map (package: orthodox-registry)
└── packages/
    ├── backend/    # Convex backend — schemas, queries, mutations (@orthfx/backend)
    ├── ui/         # Shared shadcn/Radix/Tailwind components (@orthfx/ui)
    └── config/     # Shared config (future)
```

## Tech Stack

- **Toolchain:** Vite+ (`vp` CLI)
- **Frontend:** React 19, Vite 8, React Router v7
- **Styling:** Tailwind CSS v4, shadcn/ui
- **Backend/DB:** Convex (serverless functions, database, file storage, auth)
- **Package manager:** pnpm workspaces (via `vp`)

## Deployment

All four apps deploy to Netlify. Builds trigger automatically on push to `main`. Each app has a `netlify.toml` that Netlify reads from the app's base directory.

**Critical:** Netlify runs the build command from the **repo root**, not the app directory. The `netlify.toml` build commands use `pnpm --filter <name> run build` — do not add `cd` navigation.

| App | Netlify site | URL | Env vars |
|-----|-------------|-----|----------|
| `apps/website` | orthfx-platform-website | https://orthfx-platform-website.netlify.app | — |
| `apps/sites` | orthfx-platform-sites | https://orthfx-platform-sites.netlify.app | `VITE_CONVEX_URL` |
| `apps/pledge` | orthfx-platform-pledge | https://orthfx-platform-pledge.netlify.app | `VITE_CONVEX_URL` |
| `apps/orthodox-registry` | orthfx-platform-registry | https://orthfx-platform-registry.netlify.app | — |

Each app directory has a `.netlify/state.json` (gitignored) linking it to its site ID. Use `netlify` CLI commands from within an app directory to target that site (e.g. `netlify deploy --trigger`, `netlify env:set`).

### Convex

`pledge` and `sites` share a single Convex deployment: `https://acrobatic-whale-81.convex.cloud`. The `VITE_CONVEX_URL` env var is set in Netlify for both sites. Locally, set it in `.env.local` in each app.

## tsconfig conventions

Apps using `tsc -b` (orthodox-registry, pledge, sites) have a root `tsconfig.json` with project references to `tsconfig.app.json` and `tsconfig.node.json`. The `tsconfig.app.json` is the source of truth for compiler options — always use `moduleResolution: "bundler"` and include `"vite/client"` in `types`.

The `website` app uses a flat `tsconfig.json` (no project references).
