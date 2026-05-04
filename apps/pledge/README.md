# Pledge

Pledge is the crowdfunding and donation platform for the Orthodox Christian community. 

While the underlying financial primitives (`funds`, `transactions`, `subscriptions`) live in the shared `@orthfx/backend` and can be surfaced anywhere (e.g., embedded widgets on a parish website), this specific `apps/pledge` frontend serves as the dedicated "GoFundMe-style" presentation layer.

## Features

- **Pledge Pages:** Dedicated, shareable landing pages for specific campaigns (e.g., "Roof Repair Fund").
- **Rich Media:** Campaign stories, cover images, and video links.
- **Progress Tracking:** Visual progress bars for fixed-goal campaigns.
- **Ongoing Giving:** Support for recurring subscriptions (weekly, monthly, yearly) to continuous funds like a General Operating Fund.
- **Anonymous Giving:** Options for donors to hide their names from public campaign feeds.

## Tech Stack
- **Vite + React**
- **Tailwind CSS v4** (via `@orthfx/ui`)
- **Convex** (via `@orthfx/backend`)
- **Stripe** (Checkout & Billing)

## Development

```bash
# Start the Vite+ dev server
vp dev
```
Make sure you have your `.env.local` configured with the `VITE_CONVEX_URL` pointing to the shared Convex deployment.