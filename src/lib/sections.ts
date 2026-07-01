// Canonical mapping of homepage sections. This is the single source of truth
// that reconciles the three ways a section is referenced:
//   - `key`: the camelCase `section_key` stored in the DB `site_sections` table
//   - `id`:  the kebab-case DOM id used for scroll anchoring + SideNav dots
//   - `label`: the default SideNav dot label (overridden by nav_label)
//
// Historically `page.tsx`/`SideNav` hardcoded these lists separately, which let
// the camelCase (DB) vs kebab-case (DOM id) keys drift apart — that mismatch is
// why nav-label overrides silently failed for funProjects/careerHighlights/
// lifeHacks. Import from here everywhere instead.

export type SectionDef = { key: string; id: string; label: string }

export const HERO: SectionDef = { key: 'hero', id: 'hero', label: 'Intro' }

// The reorderable content sections, in default order (matches the homepage).
export const CONTENT_SECTIONS: SectionDef[] = [
  { key: 'careerHighlights', id: 'career-highlights', label: 'Highlights' },
  { key: 'experience',       id: 'experience',        label: 'Experience' },
  { key: 'projects',         id: 'projects',          label: 'Projects' },
  { key: 'funProjects',      id: 'fun-projects',       label: 'Fun' },
  { key: 'education',        id: 'education',          label: 'Education' },
  { key: 'contact',          id: 'contact',            label: 'Contact' },
  { key: 'hobbies',          id: 'hobbies',            label: 'Hobbies' },
  { key: 'recommendations',  id: 'recommendations',    label: 'Picks' },
  { key: 'entertainment',    id: 'entertainment',      label: 'Listening' },
  { key: 'lifeHacks',        id: 'life-hacks',         label: 'Life Hacks' },
]

export const sectionByKey: Record<string, SectionDef> = Object.fromEntries(
  [HERO, ...CONTENT_SECTIONS].map((s) => [s.key, s])
)
