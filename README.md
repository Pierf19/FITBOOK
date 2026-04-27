# FitBook — Fitness Trainer Booking System

React 18 + Vite frontend with Convex backend (real-time database + server functions).

## Tech Stack

- Frontend: React 18 + Vite
- Backend: Convex
- Auth: Convex Auth (Email/Password)

## Requirements

- Node.js 20.x (recommended)
- npm 10+

## Quick Start

```bash
# 1. Install dependencies
npm install

# 2. Initialize Convex (creates convex/_generated/ and prompts for project name)
npx convex dev --once

# 3. Copy the deployment URL printed by Convex into .env.local
#    VITE_CONVEX_URL=https://your-deployment.convex.cloud

# 4. Start both dev servers (Convex + Vite) in separate terminals
npx convex dev          # terminal 1 — watches convex/ folder
npm run dev             # terminal 2 — Vite dev server at http://localhost:5173
```

## Share To GitHub (Owner)

Run from project root:

```bash
git init
git add .
git commit -m "Initial commit"
git branch -M main
git remote add origin https://github.com/<username>/<repo>.git
git push -u origin main
```

Before pushing, verify:

- `.env.local` is not committed (already ignored by `.gitignore`)
- `node_modules/` and `dist/` are not committed
- `npm run build` succeeds locally

## Clone & Run (Collaborator)

After cloning from GitHub:

```bash
npm ci
npx convex dev --once
```

Then create `.env.local` at project root with:

```bash
VITE_CONVEX_URL=https://your-deployment.convex.cloud
```

Then run:

```bash
npx convex dev
npm run dev
```

If login/register fails after clone, check `convex/auth.config.js` and ensure `providers[0].domain` matches your current Convex site URL (usually `https://<your-deployment>.convex.site`).

## Collaboration Flow (Admin Page)

For your friend building Admin page:

```bash
git checkout -b feature/admin-page
```

When done:

```bash
git add .
git commit -m "Add admin page"
git push -u origin feature/admin-page
```

Then open Pull Request to `main`.

Recommended team rule:

- Never push directly to `main`
- One feature = one branch
- Review + test before merge

## Project Structure

```
fitbook/
├── convex/
│   ├── schema.js           ← All table definitions
│   ├── auth.config.js      ← Convex Auth configuration
│   ├── users.js            ← User queries & mutations
│   ├── trainers.js         ← Trainer profiles & availability
│   ├── bookings.js         ← Booking logic with double-booking guard
│   └── recommendations.js  ← Habit-based slot suggestions
└── src/
    ├── pages/              ← Full-page route components
    ├── components/         ← Reusable UI components
    └── hooks/              ← useBooking, useRecommendation
```

## Features

- **Auth** — Email/password via Convex Auth with role selection (client / trainer)
- **Trainer Discovery** — Browse and filter trainers by specialization
- **Smart Booking** — Visual calendar slot picker with real-time availability
- **Recommendations** — "Recommended for you" badges based on past booking habits
- **Double-booking Guard** — Atomic server-side conflict check in every `createBooking` mutation
- **Dashboards** — Separate views for clients (upcoming/past sessions) and trainers (incoming bookings + availability editor)

## Security

All mutations verify identity via `ctx.auth.getUserIdentity()`. The `userId` is never trusted from the frontend — it is always resolved from the auth token on the server. Double-booking detection is atomic inside the Convex mutation, making it race-condition safe.

## Notes

Convex Auth is already integrated in this repo (`@convex-dev/auth` is installed and active).
