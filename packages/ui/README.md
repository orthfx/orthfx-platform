# @orthfx/ui

A shared UI component library and design system for all orthfx frontends.

This package provides a unified set of React components built with **shadcn/ui**, **Radix UI**, and **Tailwind CSS v4**. By sharing these components, we ensure that `sites`, `pledge`, and `website` all maintain a cohesive brand identity and styling.

## Usage

In any of the frontend apps, import components directly from this package:

```tsx
import { Button } from "@orthfx/ui/components/ui/button";
import { Card } from "@orthfx/ui/components/ui/card";
```

The consumer apps use Vite and `@tailwindcss/vite`. They must import the base CSS from this package into their own `index.css`:

```css
/* apps/your-app/src/index.css */
@import "tailwindcss";
@import "@orthfx/ui/index.css";
```

## Adding Components

When you need a new generic UI component (like a Dialog, Select, or Tooltip), add it to `src/components/ui/` in this package rather than duplicating it across multiple apps.