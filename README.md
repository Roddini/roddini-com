# roddini.com

Andrew Roddini's personal portfolio — a space-themed single-page site with a custom
admin CMS and an AI chat widget ("Goose"). Built with Next.js 16, React 19, Tailwind
v4, Framer Motion, and Neon (serverless Postgres).

## Development

```bash
npm run dev        # dev server at localhost:3000
npm run build      # production build
npm run lint       # ESLint
npx tsc --noEmit   # type-check
npx tsx scripts/migrate.ts   # run idempotent DB migrations (needs .env.local)
```

## How it works

- **Homepage** (`src/app/page.tsx`) is a server component that reads all content from
  Neon and composes the sections (hero, career highlights, experience timeline,
  projects, carousels, contact, chat). Section visibility, headers, and nav labels are
  DB-driven via `site_sections`.
- **Content carousels** all render through one shared template,
  [`src/components/Carousel.tsx`](src/components/Carousel.tsx) — each named carousel
  (Projects, Hobbies, Recommendations, …) just supplies a `renderCard` and config.
- **Admin CMS** lives under `/admin`, password-protected by `src/proxy.ts`. It manages
  the dynamic content, nav links, hero copy, and section toggles.
- **Résumé content** (experience, education, contact) is static in
  [`src/data/resume.ts`](src/data/resume.ts); everything else is in the database.
- **Goose chat** streams from Claude Haiku via `/api/chat`; its knowledge lives in
  [`content/chatbot-context.md`](content/chatbot-context.md).

See [CLAUDE.md](CLAUDE.md) for the full architecture reference.

## Environment

Local dev and production use separate Neon branches of the same project. Required env
vars (see CLAUDE.md for details): `DATABASE_URL`, `ADMIN_PASSWORD`, `ADMIN_SECRET`,
`ANTHROPIC_API_KEY`, `RESEND_API_KEY`, `CRON_SECRET`, optional `CHAT_TOKEN_LIMIT`.

## Deployment

Deploys to Vercel on push to `main`. A Vercel Cron job (`vercel.json`) emails a daily
digest of Goose conversations. Editing `content/chatbot-context.md` or env vars requires
a redeploy to take effect in production.
