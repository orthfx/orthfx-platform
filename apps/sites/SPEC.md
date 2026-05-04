# sites Spec

> Free website hosting platform for Orthodox Christian parishes. Communities get a public web presence; admins manage them via an invite-gated dashboard.

## What This Is

Invitation-only platform. Users are issued invite tokens which grant access and optionally pre-assign communities. Each community (parish, mission, monastery, chapel, cathedral) gets a public page at `*.orthdx.site` or `/parish/:slug`.

---

## Features

### Public

- Landing page lists all published communities
- Each community has a public page: name, type, address, services, personnel, map
- Public pages load via subdomain (`slug.orthdx.site`) or explicit route (`/parish/:slug`)
- No login required to view any public content

### Auth

- Signup requires a valid invite token — no open registration
- Login supports invite token via `?token=` query param (redeems after auth)
- Forgot password sends a reset code via email (Resend)
- Invite redemption creates a user profile, assigns pre-allocated community roles, and redirects to onboarding or admin

### Onboarding

- First-time users with a creation quota can search unclaimed communities to claim, or create new ones
- Users with pre-assigned communities skip onboarding and go directly to admin

### Admin Dashboard

- **My Communities** — edit community details (name, address, coordinates, services, avatar, banner), manage personnel (add/edit/remove/reorder), manage roles
- **Invites** (moderator+) — create invites with label, email-lock, pre-assigned communities, creation quota; view all invites; revoke unredeemed invites
- **All Communities** (system_admin) — search and edit any community
- **Pending Claims** (system_admin) — approve or reject community claims from non-invited users
- **Moderators** (system_admin) — add/remove moderators by email

### Account

- User can change email and request a password reset link

---

## Roles

| Role               | Scope        | Key Permissions                                    |
| ------------------ | ------------ | -------------------------------------------------- |
| system_admin       | Platform     | Everything                                         |
| moderator          | Platform     | Create invites, manage users, edit all communities |
| jurisdiction_admin | Jurisdiction | Approve claims, edit communities in jurisdiction   |
| admin              | Community    | Edit community, personnel, roles                   |
| editor             | Community    | Edit community, personnel                          |

---

## Data

- All data in Convex (reactive, no polling needed)
- Images in Convex file storage (avatars, banners, personnel photos)
- Auth sessions persist across refreshes

---

## Partially Implemented (Known)

- Jurisdiction admin role exists but no UI to create or manage jurisdictions
- Custom domain field exists in schema but no UI to assign or manage it

---

## Out of Scope

- Open registration
- Email verification on signup
- Bulk operations, import/export tools
- Analytics

---

## Tracking

Requirements tracked as GitHub Issues on `orthfx/orthfx-platform`.
