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

This is a portfolio site (roddini.com) with a custom admin CMS backed by Neon (serverless Postgres). It has a homepage plus dedicated pages at `/hobbies`, `/recommendations`, and `/entertainment`.

### Data sources

There are **two** content sources — don't confuse them:

- **`src/data/resume.ts`** — static source of truth for resume content (experience, projects, education). Edit this file directly to change that content.
- **Neon database** — source of truth for dynamic content: podcasts, recommendations, hobbies, career highlights, and section visibility toggles. Managed via `/admin`. Connection via `DATABASE_URL` env var in `.env.local`.

`src/lib/types.ts` defines the TypeScript types for all DB-backed content (`Podcast`, `Recommendation`, `Hobby`, `CareerHighlight`). The files in `src/data/entertainment.ts`, `src/data/hobbies.ts`, and `src/data/recommendations.ts` are legacy stubs — the live pages do not use them.

### Database

`src/lib/db.ts` exports a `sql` tagged-template function via `@neondatabase/serverless`. Pages query it directly in server components — no ORM, no abstraction layer. Cast results with `as unknown as Type[]` since Neon returns `Record<string, any>[]`.

Tables: `podcasts`, `recommendations`, `hobbies`, `career_highlights`, `site_sections`, `chat_sessions`, `chat_access_requests`. Each content table has `published` (show anywhere) and `featured_in_carousel` (show on homepage carousel). `site_sections` has one row per section with a `visible` boolean.

### Admin CMS

Password-protected at `/admin/*` via `src/proxy.ts` (Next.js 16 proxy convention — export named `proxy`, not `middleware`). Session stored as `admin_session` cookie checked against `ADMIN_SECRET` env var. Login API at `/api/admin/login` checks against `ADMIN_PASSWORD` env var.

Admin UI pages live in `src/app/admin/`. API routes follow the pattern `src/app/api/admin/[type]/route.ts` (GET + POST) and `src/app/api/admin/[type]/[id]/route.ts` (PATCH + DELETE).

### Page composition

**Homepage** (`src/app/page.tsx`): fetches all carousel content (`published = true AND featured_in_carousel = true`) and site section visibility from DB, then stacks: `StarField` → `SideNav` → `ChatWidget` → `Hero` → `CareerHighlights` → `Timeline` → `Projects` → `FunProjects` → `Education` → `Contact` → `ConstellationDog` → `HobbiesCarousel` → `RecommendationsCarousel` → `EntertainmentPreview`. Sections hidden via `site_sections` are omitted entirely.

**Dedicated pages** (`/entertainment`, `/recommendations`, `/hobbies`): fetch all items where `published = true` — includes items not in the carousel. Each page has a server component (`page.tsx`) that queries the DB and passes data to a client component (`*Content.tsx`) for interactivity.

**StarField** (`src/components/StarField.tsx`): Canvas-based particle system with three depth layers. Uses `window.scrollY` via a ref (not state) to drive parallax without re-renders. Layer-1 particles draw constellation lines between neighbors within 115px. Layer parallax factors are 0.06 / 0.18 / 0.35. `scrollY` is clamped to `Math.max(0, ...)` to prevent iOS Safari rubber-band jitter. Canvas uses `translateZ(0)` + `will-change: transform` to stay on its own GPU compositing layer.

**Timeline** (`src/components/Timeline.tsx` + `TimelineEntry.tsx`): Renders `RESUME.experience` as an alternating left/right layout using CSS grid (`grid-cols-[1fr_40px_1fr]`). Entrance animations use Framer Motion `whileInView` with `once: true`. Each entry has its own `accent` hex color defined in `resume.ts`; a local `hexToRgb` helper converts it for use in rgba strings.

**SideNav** (`src/components/SideNav.tsx`): Fades in 1.2s after scrolling stops via `useScrollVisibility` hook. Uses a scroll-event listener with `getBoundingClientRect()` to track the active section — picks whichever section has the most overlap with the 10–70% viewport zone. Hidden on mobile (`hidden md:flex`). Dots for sections with no DB data are hidden via `hiddenSectionIds` prop.

**ConstellationDog** (`src/components/ConstellationDog.tsx`): Canvas animation that samples non-white pixels from `/goose-constellation.png` (Goose the dog, pre-cut from white background) and renders them as twinkling teal stars with constellation lines. Placed between Contact and HobbiesCarousel on the homepage.

**Carousels** (`CareerHighlights`, `HobbiesCarousel`, `RecommendationsCarousel`, `EntertainmentPreview`): All four use `left: 50% / marginLeft: -CARD_W/2 / top: 50% / marginTop: -CARD_H/2` for absolute card positioning — do NOT use `flex items-center justify-center` on the card container, as Safari mobile does not apply flex alignment to absolutely positioned children correctly.

### Chatbot — Goose

A floating chat widget in the bottom-left corner powered by Claude Haiku. The bot persona is named Goose (after Andrew's dog).

**Files:**
- `src/components/ChatWidget.tsx` — client component, fixed bottom-left, fades in/out with `useScrollVisibility`. Opens a panel with streaming chat, clickable question chips, and a token-limit access request form. Clicking outside the panel closes it.
- `src/components/GooseIcon.tsx` — small canvas constellation of Goose's face (cropped from `/goose-constellation.png`), used as the chat button icon.
- `src/hooks/useScrollVisibility.ts` — shared hook used by both `SideNav` and `ChatWidget`. Fades in after 1800ms initial delay; hides on scroll, re-shows 1200ms after scroll stops.
- `content/chatbot-context.md` — **the only file to edit** to change what Goose knows or says. Contains AI instructions, tone, persona, experience, hobbies, sample Q&A (also drives clickable chips), and AI disclosure text. Read at runtime by the API route — save the file and send a new message to pick up changes in dev. In production, requires a redeploy.

**API routes:**
- `POST /api/chat` — streams a response from Claude Haiku. Reads `content/chatbot-context.md` as the system prompt. Tracks token usage per IP in the `chat_sessions` DB table. Returns HTTP 402 when IP exceeds `CHAT_TOKEN_LIMIT` (default 6,000) and is not approved.
- `GET /api/chat/questions` — parses `Q:` lines from `## Sample Q&A` section of the MD and returns them as chip button labels. Also returns the `## AI Disclosure` text.
- `POST /api/chat/request-access` — saves name/email/company/reason to `chat_access_requests` table when a user hits the token limit.

**Token limit:** tracked per IP in `chat_sessions`. To approve a user for unlimited access, set `chat_sessions.approved = TRUE` for their IP.

**Thinking phrase:** "Whatever your expectations are for what's about to happen, lower them. This is some dude's glorified resume website." — shown as italic teal text before the first response, stays on screen above it permanently. Hardcoded in `ChatWidget.tsx` as `THINKING_PHRASE`.

## Tailwind

This project uses **Tailwind v4** — there is no `tailwind.config.ts`. All theme extensions go in the `@theme` block inside `src/app/globals.css`. Use `@import "tailwindcss"` (already present), not the v3 directives. The `.input` utility class for admin form inputs and `.no-scrollbar` utility (used in chat chip row) are also defined in `globals.css`.

## Framer Motion

Version 12 is installed. Cubic-bezier ease arrays must be typed as `[number, number, number, number]` (tuple, not `number[]`). Spring transition `type` must be `'spring' as const`.

## Required env vars

```
DATABASE_URL=         # Neon connection string
ADMIN_PASSWORD=       # password for /admin/login
ADMIN_SECRET=         # used to sign the admin_session cookie
ANTHROPIC_API_KEY=    # Claude API key for the Goose chatbot
CHAT_TOKEN_LIMIT=     # optional, defaults to 6000 tokens per IP
```

## Deployment

Vercel (Next.js auto-detected). Push to GitHub; Vercel deploys on merge to main. All env vars must also be set in the Vercel dashboard.

`content/chatbot-context.md` is read from the filesystem at runtime — it is bundled at build time on Vercel, so editing it requires a redeploy to take effect in production.
