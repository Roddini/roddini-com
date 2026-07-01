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

- **`src/data/resume.ts`** — static source of truth for **education and contact** only. It is also the one-time **seed source** for the DB `experience` table (imported by `scripts/migrate.ts`), so don't delete it. Edit education/contact here; edit experience via **`/admin/resume`** (see Résumé import below).
- **Neon database** — source of truth for dynamic content: experience, podcasts, recommendations, hobbies, career highlights, projects, fun projects, life hacks, and section visibility toggles. Managed via `/admin`. Connection via `DATABASE_URL` env var in `.env.local`.

`src/lib/types.ts` defines the TypeScript types for all DB-backed content (`Experience`, `Podcast`, `Recommendation`, `Hobby`, `CareerHighlight`, `Project`, `FunProject`, `LifeHack`, `LookupValue`, `SiteSection`, `NavLink`, `SiteConfig`, `ChatConversation`, `ChatMessage`, `ChatConversationSummary`). (The legacy `src/data/{entertainment,hobbies,recommendations}.ts` stubs have been removed.)

### Database

`src/lib/db.ts` exports a `sql` tagged-template function via `@neondatabase/serverless`. Pages query it directly in server components — no ORM, no abstraction layer. Cast results with `as unknown as Type[]` since Neon returns `Record<string, any>[]`.

Tables: `experience`, `experience_versions`, `podcasts`, `recommendations`, `hobbies`, `career_highlights`, `projects`, `fun_projects`, `life_hacks`, `lookup_values`, `site_sections`, `chat_sessions`, `chat_access_requests`, `chat_conversations`, `chat_messages`, `nav_links`, `site_config`, `assets`.

- Each content table has `published` (show anywhere) and `featured_in_carousel` (show on homepage carousel).
- `experience` — one row per role: `role`, `company`, `period`, `year`, `description`, `highlights TEXT[]`, `tags TEXT[]`, `accent`, `sort_order`, `published`. Seeded once from `RESUME.experience` (guarded by an emptiness check); drives the homepage Timeline. Edited via `/admin/resume`.
- `experience_versions` — `id`, `snapshot JSONB`, `created_at`. A snapshot of the whole `experience` set is saved here before every Publish/restore (see `src/lib/experience.ts` → `snapshotCurrentExperience` / `replaceExperience`), pruned to the newest 10. Powers the "Restore" buttons on `/admin/resume`.
- `assets` — blob store: `key` (PK), `data_base64`, `content_type`, `filename`. Holds the downloadable résumé PDF under key `resume_pdf`, served by `/api/resume/download`. Stored base64-in-DB so admin uploads take effect without a redeploy (Vercel's runtime filesystem is read-only).
- `chat_conversations` — one row per chat widget session: `id` (client-generated UUID), `visitor_id` (persistent localStorage id), `ip`, `country`/`city` (from Vercel geo headers, null locally), `message_count`, `tokens_used`, `started_at`, `updated_at`.
- `chat_messages` — `conversation_id` (FK → `chat_conversations`, `ON DELETE CASCADE`), `role` (`user`/`assistant`), `content`, `created_at`. Index on `conversation_id`.

**`scripts/migrate.ts` is idempotent — safe to re-run anytime.** Schema statements use `CREATE/ALTER ... IF NOT EXISTS`, seed inserts use `ON CONFLICT DO NOTHING`, and the `site_sections` label seed `UPDATE`s are guarded by `WHERE ... section_header IS NULL` so they never overwrite admin-customized headers/labels.
- `site_sections` has one row per section with: `section_key` (string), `visible` (boolean), `section_header` (text — overrides the hardcoded heading in the component), `nav_label` (text — overrides the SideNav dot label). Keys: `hero`, `careerHighlights`, `experience`, `education`, `projects`, `funProjects`, `hobbies`, `recommendations`, `entertainment`, `contact`.
- `nav_links` — rows with `id`, `href`, `label`, `sort_order`. Controls the hamburger menu. Managed at `/admin/nav-links`. `href` has a **UNIQUE index** (`nav_links_href_key`) so the default-link seed (`ON CONFLICT (href) DO NOTHING`) is idempotent — an earlier version lacked it and re-seeded the four defaults on every migrate, so the migration also de-dupes existing rows (keep lowest `id` per `href`).
- `site_config` — key/value table. Current keys: `hero_name`, `hero_title`, `hero_tagline_1`, `hero_tagline_2`. Managed at `/admin/hero`.

### Admin CMS

Password-protected via `src/proxy.ts` (Next.js 16 proxy convention — export named `proxy`, not `middleware`). The matcher covers **both** `/admin/:path*` (pages) and `/api/admin/:path*` (API). Session stored as `admin_session` cookie checked against `ADMIN_SECRET` env var. Unauthenticated **page** requests redirect to `/admin/login`; unauthenticated **API** requests get a `401` JSON. `/admin/login` and `/api/admin/login` are exempt. Login API at `/api/admin/login` checks against `ADMIN_PASSWORD` env var.

Admin UI pages live in `src/app/admin/`. API routes follow the pattern `src/app/api/admin/[type]/route.ts` (GET + POST) and `src/app/api/admin/[type]/[id]/route.ts` (PATCH + DELETE).

**Admin pages:**
- `/admin` (dashboard) — toggle visibility + edit `section_header` / `nav_label` for all homepage sections, including `experience` and `education`. All sections are fully toggleable. Fields auto-save 600ms after typing stops.
- `/admin/resume` — upload a résumé PDF (or paste text) → Claude parses it into structured experience entries → review/edit each (role, company, period, year, description, highlights, tags, accent, order) → **Publish** (replace-all into `experience`). Nothing changes until Publish — which also stores the uploaded PDF as the downloadable résumé. Includes a version-history "Restore". See Résumé import below.
- `/admin/hero` — edit `hero_name`, `hero_title`, `hero_tagline_1`, `hero_tagline_2` via `site_config`. Auto-saves 600ms after typing.
- `/admin/nav-links` — full CRUD for hamburger menu links (`nav_links` table). "Add Link" pre-populates `sort_order` as `max(existing) + 1`.
- `/admin/conversations` — read-only viewer for logged Goose chat conversations. Master/detail: filterable list (keyword + date range) on the left, full transcript on the right. Per-conversation delete (cascades to messages), and an "access request" badge when the visitor's IP also submitted the token-limit form.

**Admin API routes (beyond the standard CRUD pattern):**
- `GET /api/admin/site-sections` — returns all `site_sections` rows including `section_header` and `nav_label`
- `PATCH /api/admin/site-sections` — accepts `{ section_key, visible?, section_header?, nav_label? }` with COALESCE (only updates fields provided)
- `GET /api/admin/site-config` — returns `{ key: value }` object for all rows
- `PATCH /api/admin/site-config` — accepts `{ key, value }` to update a single config entry
- `GET /api/admin/experience` — returns all experience rows ordered by `sort_order`
- `POST /api/admin/experience` — inserts one experience row
- `PUT /api/admin/experience` — **replace-all**: `{ items: [...] }` deletes existing rows and re-inserts in list order (used by `/admin/resume` Publish)
- `PATCH /api/admin/experience/[id]` — partial update (COALESCE); `DELETE /api/admin/experience/[id]`
- `POST /api/admin/resume/parse` — `{ pdfBase64? , text? }` → sends the PDF (base64 `document` block) or text to `claude-opus-4-8`, returns `{ items: [...] }` structured experience for review (does **not** save)
- `GET /api/admin/resume/upload` — reports `{ hasResume, filename, updated_at }`; `POST` stores `{ pdfBase64, filename }` as the downloadable résumé (`assets` key `resume_pdf`)
- `GET /api/resume/download` — **public** (not under `/api/admin`, so not gated): streams the résumé PDF from `assets`, falling back to the bundled `public/andrew-roddini-resume.pdf`. `force-dynamic`.
- `GET /api/admin/nav-links` — returns rows ordered by `sort_order`
- `POST /api/admin/nav-links` — inserts a new link
- `PATCH /api/admin/nav-links/[id]` — partial update (COALESCE)
- `DELETE /api/admin/nav-links/[id]`
- `GET /api/admin/conversations?q=&from=&to=` — lists conversations (newest first), `LEFT JOIN` to any access request from the same IP; `q` keyword-matches message content, `from`/`to` bound `started_at`
- `GET /api/admin/conversations/[id]` — one conversation + its messages in order
- `DELETE /api/admin/conversations/[id]` — deletes the conversation (messages cascade)

### Page composition

**Homepage** (`src/app/page.tsx`): fetches all carousel content (`published = true AND featured_in_carousel = true`), site section data, and `site_config` from DB, then stacks: `StarField` → `SideNav` → `ChatWidget` → `Hero` → `CareerHighlights` → `Timeline` → `Projects` → `FunProjects` → `Education` → `Contact` → `ConstellationDog` → `HobbiesCarousel` → `RecommendationsCarousel` → `EntertainmentPreview`. Sections hidden via `site_sections` are omitted entirely — this includes `experience` and `education`. Builds `navLabels` and `sectionHeaders` maps from `site_sections`, and `heroTaglines` from `site_config`, and passes them as props to the relevant components.

**Dedicated pages** (`/entertainment`, `/recommendations`, `/hobbies`): fetch all items where `published = true` — includes items not in the carousel. Each page has a server component (`page.tsx`) that queries the DB and passes data to a client component (`*Content.tsx`) for interactivity.

**StarField** (`src/components/StarField.tsx`): Canvas-based particle system with three depth layers. Uses `window.scrollY` via a ref (not state) to drive parallax without re-renders. Layer-1 particles draw constellation lines between neighbors within 115px. Layer parallax factors are 0.06 / 0.18 / 0.35. `scrollY` is clamped to `Math.max(0, ...)` to prevent iOS Safari rubber-band jitter. Canvas uses `translateZ(0)` + `will-change: transform` to stay on its own GPU compositing layer.

**Timeline** (`src/components/Timeline.tsx` + `TimelineEntry.tsx`): Renders the DB `experience` rows (passed as an `items: Experience[]` prop from `page.tsx`) as an alternating left/right layout using CSS grid (`grid-cols-[1fr_40px_1fr]`). Entrance animations use Framer Motion `whileInView` with `once: true`. Each entry has its own `accent` hex color; the shared `hexToRgb` helper (`src/lib/color.ts`) converts it for use in rgba strings.

**SideNav** (`src/components/SideNav.tsx`): Fades in 1.2s after scrolling stops via `useScrollVisibility` hook. Uses a scroll-event listener with `getBoundingClientRect()` to track the active section — picks whichever section has the most overlap with the 10–70% viewport zone. Hidden on mobile (`hidden md:flex`). Dots for sections with no DB data are hidden via `hiddenSectionIds` prop. Accepts `navLabels?: Record<string, string>` prop — values override the hardcoded dot labels for each section id.

**ConstellationDog** (`src/components/ConstellationDog.tsx`): Canvas animation that samples non-white pixels from `/goose-constellation.png` (Goose the dog, pre-cut from white background) and renders them as twinkling teal stars with constellation lines. Placed between Contact and HobbiesCarousel on the homepage.

**Section headers**: All nine homepage section components (`CareerHighlights`, `Timeline`, `Projects`, `FunProjects`, `Education`, `Contact`, `HobbiesCarousel`, `RecommendationsCarousel`, `EntertainmentPreview`) accept a `sectionHeader?: string` prop that overrides the hardcoded heading text. The homepage passes values from the `section_header` column in `site_sections`.

**NavMenu** (`src/components/NavMenu.tsx`): Accepts a `links?: { href: string; label: string }[]` prop. If provided (and non-empty), uses those links; otherwise falls back to `DEFAULT_NAV_LINKS` (the hardcoded array). `src/app/layout.tsx` is an async server component that fetches `nav_links` from the DB and passes them as `links` to `<NavMenu />`.

**Hero** (`src/components/Hero.tsx`): Accepts `name`, `heroTitle`, and `taglines: [string, string]` props sourced from `site_config` at the homepage level. Has a CSS 3D tilt effect on the name: mouse hover (or finger drag on mobile) tilts the element using `rotateX`/`rotateY`, with stacked `text-shadow` layers for depth that fade in from zero at rest via a `tiltAmount` scalar. Spring-back on mouse leave / touch end uses a `requestAnimationFrame` lerp (factor 0.83/frame). "Roddini" uses a two-span technique (shadow copy + gradient face) to work around the CSS paint-order issue where `text-shadow` renders on top of `background-clip: text` gradient. Touch drag uses native DOM listeners with `{ passive: false }` on `touchmove` so `e.preventDefault()` blocks page scroll on iOS Safari.

**Carousels — one shared template.** All seven content carousels (`CareerHighlights`, `Projects`, `FunProjects`, `HobbiesCarousel`, `RecommendationsCarousel`, `EntertainmentPreview`, `LifeHacksCarousel`) are thin wrappers that render through **`src/components/Carousel.tsx`** — a generic component that owns the motion/drag/auto-advance/dot-nav/arrows/edge-fades/drift. Each wrapper just supplies a `renderCard(item, ctx)` and config (`cardWidth`/`cardHeight`/`trackHeight`, optional `footerLink`, optional per-item `cardBorder`). To add or change a carousel, edit its wrapper's `renderCard`; to change shared behavior, edit `Carousel.tsx`. The template also exports `CardDescription` (the expand-on-hover + "···" body used by every card). All hooks run before the `items.length === 0 → null` guard, so an unfilled carousel renders nothing without breaking the rules of hooks. Card positioning uses `left: 50% / marginLeft: -cardWidth/2 / top: 50% / marginTop: -cardHeight/2` for **all** carousels — do NOT use `flex items-center justify-center`, as Safari mobile mis-aligns absolutely-positioned flex children.

`src/components/SectionHeader.tsx` is the shared `── LABEL ──` divider (used by the carousel template, Timeline, Education, Contact, and the dedicated pages). Reduced-motion is respected app-wide via `<MotionProvider>` (`MotionConfig reducedMotion="user"` in `layout.tsx`) plus per-component checks in the canvas components and `Carousel`.

### Résumé import

The Experience section is DB-driven and editable end-to-end from **`/admin/resume`** (`src/app/admin/resume/page.tsx`):

- **Upload a PDF** (Google Docs → File → Download → PDF): the file is sent to `POST /api/admin/resume/parse`, which passes it to `claude-opus-4-8` as a base64 `document` block and returns structured experience entries. Parsing uses a prompt-based JSON extraction (tolerant parser strips code fences) — model-version-agnostic, and every result goes through a human review step. **Nothing is stored on upload** — the PDF is held client-side and only written as the download (`POST /api/admin/resume/upload`) when you Publish, so neither the timeline nor the download changes until you confirm.
- **Review & publish**: the parsed entries populate an editable list (role/company/period/year/description/highlights/tags/accent/order, all editable; highlights edited as one-per-line text, tags comma-separated). **Publish** calls `PUT /api/admin/experience` (replace-all) → the homepage Timeline updates with no redeploy. You can also paste text or hand-edit instead of uploading.
- **Version history / undo**: every Publish (and every restore) first snapshots the current set into `experience_versions`. The page lists the last 10 versions with a **Restore** button — `POST /api/admin/experience/versions { restoreId }` snapshots the current state (so the restore itself is undoable) then replaces experience with that version. The parser also folds early-career/junior roles into a single "Earlier Roles" entry.
- **Downloadable résumé**: the Contact button and Goose both link to `/api/resume/download`, which serves the uploaded PDF from `assets` (or the bundled file as fallback). `linkify()` in `ChatWidget.tsx` renders any `.pdf` / `/api/resume/download` link as a "Download résumé ↓" pill; `content/chatbot-context.md` tells Goose to offer it.

### Chatbot — Goose

A floating chat widget in the bottom-left corner powered by Claude Haiku. The bot persona is named Goose (after Andrew's dog).

**Files:**
- `src/components/ChatWidget.tsx` — client component, fixed bottom-left, fades in/out with `useScrollVisibility`. Opens a panel with streaming chat, clickable question chips, and a token-limit access request form. Clicking outside the panel closes it. On mount it generates a per-session `conversationId` (`crypto.randomUUID()`) and reads/creates a persistent `visitorId` in `localStorage`; both are sent in every `/api/chat` POST so conversations can be logged.
- `src/components/GooseIcon.tsx` — small canvas constellation of Goose's face (cropped from `/goose-constellation.png`), used as the chat button icon.
- `src/hooks/useScrollVisibility.ts` — shared hook used by both `SideNav` and `ChatWidget`. Fades in after 1800ms initial delay; hides on scroll, re-shows 1200ms after scroll stops.
- `content/chatbot-context.md` — **the only file to edit** to change what Goose knows or says. Contains AI instructions, tone, persona, experience, hobbies, sample Q&A (also drives clickable chips), and AI disclosure text. Read at runtime by the API route — save the file and send a new message to pick up changes in dev. In production, requires a redeploy.

**API routes:**
- `POST /api/chat` — streams a response from Claude Haiku. Reads `content/chatbot-context.md` as the system prompt. Tracks token usage per IP in the `chat_sessions` DB table. Returns HTTP 402 when IP exceeds `CHAT_TOKEN_LIMIT` (default 6,000) and is not approved. Also **logs the conversation**: upserts `chat_conversations` (with IP + Vercel geo headers) and inserts the user message before streaming, then inserts the assistant message and rolls up `message_count`/`tokens_used` after. All logging is **best-effort** — wrapped in try/catch so a DB failure can never break the chat response.
- `GET /api/chat/questions` — parses `Q:` lines from `## Sample Q&A` section of the MD and returns them as chip button labels. Also returns the `## AI Disclosure` text.
- `POST /api/chat/request-access` — saves name/email/company/reason to `chat_access_requests` table when a user hits the token limit.

**Token limit:** tracked per IP in `chat_sessions`. To approve a user for unlimited access, set `chat_sessions.approved = TRUE` for their IP.

**Thinking phrase:** "Whatever your expectations are for what's about to happen, lower them. This is some dude's glorified resume website." — shown as italic teal text before the first response, stays on screen above it permanently. Hardcoded in `ChatWidget.tsx` as `THINKING_PHRASE`.

### Daily conversation digest

`src/app/api/cron/digest/route.ts` (`GET`) — emails a summary of `chat_conversations` started in the last 24h, run daily by **Vercel Cron** (configured in `vercel.json`, schedule `0 15 * * *` = 8am Pacific). Gated by `CRON_SECRET`: Vercel automatically sends `Authorization: Bearer ${CRON_SECRET}` when the env var is set, and the route rejects anything else with `401`. Queries the DB server-side via `sql`, emails via Resend (`onboarding@resend.dev` → `aroddini@gmail.com`, matching `request-access`). Sends **nothing** on days with no new conversations. Append `?dry=1` (still authenticated) to preview the email body without sending.

## Environments — Neon branches

Local dev and production use **separate Neon branches of the same project**, so local work never touches live data:

- **Production** = the `main`/`production` branch (endpoint `ep-autumn-boat`). Its connection string is set as `DATABASE_URL` in the **Vercel dashboard** — never in the repo.
- **Local dev** = the `dev` branch (endpoint `ep-dawn-mode`). Its connection string is the single active `DATABASE_URL` in `.env.local`. The prod string is kept commented in `.env.local` for occasional deliberate prod migrations only.

Refresh the dev branch with current prod data via Neon's **Reset from parent**; afterward re-run `npx tsx scripts/migrate.ts` (idempotent) to restore schema. Schema changes flow code → dev → prod (run the migration against each); data flows prod → dev (branch reset). Local data edits stay local.

## Tailwind

This project uses **Tailwind v4** — there is no `tailwind.config.ts`. All theme extensions go in the `@theme` block inside `src/app/globals.css`. Use `@import "tailwindcss"` (already present), not the v3 directives. The `.input` utility class for admin form inputs and `.no-scrollbar` utility (used in chat chip row) are also defined in `globals.css`.

## Framer Motion

Version 12 is installed. Cubic-bezier ease arrays must be typed as `[number, number, number, number]` (tuple, not `number[]`). Spring transition `type` must be `'spring' as const`.

## Required env vars

```
DATABASE_URL=         # Neon connection string (dev branch locally, main branch in Vercel)
ADMIN_PASSWORD=       # password for /admin/login
ADMIN_SECRET=         # used to sign the admin_session cookie
ANTHROPIC_API_KEY=    # Claude API key for the Goose chatbot
CHAT_TOKEN_LIMIT=     # optional, defaults to 6000 tokens per IP
RESEND_API_KEY=       # Resend API key — chat access-request + daily digest emails
CRON_SECRET=          # auth for /api/cron/* — Vercel sends it as a Bearer token to cron jobs
```

## Deployment

Vercel (Next.js auto-detected). Push to GitHub; Vercel deploys on merge to main. All env vars must also be set in the Vercel dashboard — note adding/changing an env var only takes effect on the **next** deployment, not existing ones. Vercel Cron jobs (`vercel.json`) run only against production deployments.

`content/chatbot-context.md` is read from the filesystem at runtime — it is bundled at build time on Vercel, so editing it requires a redeploy to take effect in production.

`.claude/settings.local.json` is gitignored (machine-local Claude Code permissions); the shared `.claude/settings.json` is committed.
