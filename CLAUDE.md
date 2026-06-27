# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

```bash
npm run dev      # start dev server at localhost:3000 (Turbopack)
npm run build    # production build
npm run lint     # ESLint
npx tsc --noEmit # type-check without building
npx tsx scripts/migrate.ts  # run DB schema migrations (requires .env.local)
```

No test suite exists yet.

## Architecture

This is a single-page portfolio site with a custom admin CMS backed by Neon (serverless Postgres).

### Data sources

There are **two** content sources — don't confuse them:

- **`src/data/resume.ts`** — static source of truth for resume content (experience, projects, education). Edit this file directly to change that content.
- **Neon database** — source of truth for dynamic content: podcasts, recommendations, hobbies, career highlights, and section visibility toggles. Managed via `/admin`. Connection via `DATABASE_URL` env var in `.env.local`.

`src/lib/types.ts` defines the TypeScript types for all DB-backed content (`Podcast`, `Recommendation`, `Hobby`, `CareerHighlight`). The files in `src/data/entertainment.ts`, `src/data/hobbies.ts`, and `src/data/recommendations.ts` are legacy stubs — the live pages do not use them.

### Database

`src/lib/db.ts` exports a `sql` tagged-template function via `@neondatabase/serverless`. Pages query it directly in server components — no ORM, no abstraction layer. Cast results with `as unknown as Type[]` since Neon returns `Record<string, any>[]`.

Tables: `podcasts`, `recommendations`, `hobbies`, `career_highlights`, `site_sections`. Each content table has `published` (show anywhere) and `featured_in_carousel` (show on homepage carousel). `site_sections` has one row per section with a `visible` boolean.

### Admin CMS

Password-protected at `/admin/*` via `src/proxy.ts` (Next.js 16 proxy convention — export named `proxy`, not `middleware`). Session stored as `admin_session` cookie checked against `ADMIN_SECRET` env var. Login API at `/api/admin/login` checks against `ADMIN_PASSWORD` env var.

Admin UI pages live in `src/app/admin/`. API routes follow the pattern `src/app/api/admin/[type]/route.ts` (GET + POST) and `src/app/api/admin/[type]/[id]/route.ts` (PATCH + DELETE).

### Page composition

**Homepage** (`src/app/page.tsx`): fetches all carousel content (`published = true AND featured_in_carousel = true`) and site section visibility from DB, then stacks: `StarField` → `SideNav` → `Hero` → `CareerHighlights` → `Timeline` → `Projects` → `FunProjects` → `Education` → `Contact` → `HobbiesCarousel` → `RecommendationsCarousel` → `EntertainmentPreview`. Sections hidden via `site_sections` are omitted entirely.

**Dedicated pages** (`/entertainment`, `/recommendations`, `/hobbies`): fetch all items where `published = true` — includes items not in the carousel. Each page has a server component (`page.tsx`) that queries the DB and passes data to a client component (`*Content.tsx`) for interactivity.

**StarField** (`src/components/StarField.tsx`): Canvas-based particle system with three depth layers. Uses `window.scrollY` via a ref (not state) to drive parallax without re-renders. Layer-1 particles draw constellation lines between neighbors within 115px. Layer parallax factors are 0.06 / 0.18 / 0.35.

**Timeline** (`src/components/Timeline.tsx` + `TimelineEntry.tsx`): Renders `RESUME.experience` as an alternating left/right layout using CSS grid (`grid-cols-[1fr_40px_1fr]`). Entrance animations use Framer Motion `whileInView` with `once: true`. Each entry has its own `accent` hex color defined in `resume.ts`; a local `hexToRgb` helper converts it for use in rgba strings.

**SideNav** (`src/components/SideNav.tsx`): Fades in 1.2s after scrolling stops. Uses `IntersectionObserver` with `rootMargin: '-10% 0px -60% 0px'` to track active section. Hidden on mobile (`hidden md:flex`).

## Tailwind

This project uses **Tailwind v4** — there is no `tailwind.config.ts`. All theme extensions go in the `@theme` block inside `src/app/globals.css`. Use `@import "tailwindcss"` (already present), not the v3 directives. The `.input` utility class for admin form inputs is also defined in `globals.css`.

## Framer Motion

Version 12 is installed. Cubic-bezier ease arrays must be typed as `[number, number, number, number]` (tuple, not `number[]`). Spring transition `type` must be `'spring' as const`.

## Required env vars

```
DATABASE_URL=       # Neon connection string
ADMIN_PASSWORD=     # password for /admin/login
ADMIN_SECRET=       # used to sign the admin_session cookie
```

## Deployment

Vercel (Next.js auto-detected). Push to GitHub; Vercel deploys on merge to main. All three env vars must also be set in the Vercel dashboard.
