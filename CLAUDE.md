# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

```bash
npm run dev      # start dev server at localhost:3000 (Turbopack)
npm run build    # production build
npm run lint     # ESLint
npx tsc --noEmit # type-check without building
```

No test suite exists yet.

## Architecture

This is a single-page portfolio site. All resume content lives in **`src/data/resume.ts`** — this is the single source of truth. Editing content (bullet points, tags, job descriptions, projects) should only require touching that file.

**Page composition** (`src/app/page.tsx`): stacks five components in order — `StarField` (fixed canvas), `SideNav` (fixed nav), then `Hero → Timeline → Projects → Education` as the scrollable content.

**StarField** (`src/components/StarField.tsx`): Canvas-based particle system with three depth layers. Uses `window.scrollY` via a ref (not state) to drive parallax without re-renders. Particles drift continuously via requestAnimationFrame; layer parallax factors are 0.06 / 0.18 / 0.35. Layer-1 particles draw constellation lines between neighbors within 115px.

**Timeline** (`src/components/Timeline.tsx` + `TimelineEntry.tsx`): Renders `RESUME.experience` as an alternating left/right layout using CSS grid (`grid-cols-[1fr_40px_1fr]`). Entrance animations use Framer Motion `whileInView` with `once: true`. Each entry has its own `accent` hex color defined in `resume.ts`; a local `hexToRgb` helper converts it for use in rgba strings.

**SideNav** (`src/components/SideNav.tsx`): Fades in 1.2s after scrolling stops (via `setTimeout` on the scroll event). Uses `IntersectionObserver` with `rootMargin: '-10% 0px -60% 0px'` to track the active section. Hidden on mobile (`hidden md:flex`).

## Tailwind

This project uses **Tailwind v4** — there is no `tailwind.config.ts`. All theme extensions go in the `@theme` block inside `src/app/globals.css`. Use `@import "tailwindcss"` (already present) not the v3 directives.

## Framer Motion

Version 12 is installed. Cubic-bezier ease arrays must be typed as `[number, number, number, number]` (tuple, not `number[]`). Spring transition `type` must be `'spring' as const`.

## Deployment

Vercel (Next.js auto-detected). Push to GitHub; Vercel deploys on merge to main.
