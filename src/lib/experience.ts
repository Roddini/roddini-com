import { sql } from './db'

// Keep the last N snapshots for revert; older ones are pruned on each new snapshot.
const MAX_VERSIONS = 10

export type ExperienceInput = {
  role?: string
  company?: string
  period?: string
  year?: string
  description?: string
  highlights?: string[]
  tags?: string[]
  accent?: string
  published?: boolean
}

// Replace the entire experience set with `items`, in list order (sort_order = index).
export async function replaceExperience(items: ExperienceInput[]) {
  await sql`DELETE FROM experience`
  for (let i = 0; i < items.length; i++) {
    const e = items[i]
    await sql`
      INSERT INTO experience (role, company, period, year, description, highlights, tags, accent, sort_order, published)
      VALUES (
        ${e.role ?? ''}, ${e.company ?? ''}, ${e.period ?? ''}, ${e.year ?? ''}, ${e.description ?? ''},
        ${e.highlights ?? []}, ${e.tags ?? []}, ${e.accent ?? '#00d4aa'}, ${i}, ${e.published ?? true}
      )
    `
  }
}

// Snapshot the current experience set into experience_versions (a no-op if empty),
// then prune to the newest MAX_VERSIONS. Call this before any replace/restore so the
// prior published state is recoverable.
export async function snapshotCurrentExperience() {
  const rows = (await sql`
    SELECT role, company, period, year, description, highlights, tags, accent, sort_order, published
    FROM experience ORDER BY sort_order ASC
  `) as unknown as ExperienceInput[]
  if (rows.length === 0) return
  await sql`INSERT INTO experience_versions (snapshot) VALUES (${JSON.stringify(rows)}::jsonb)`
  await sql`
    DELETE FROM experience_versions
    WHERE id NOT IN (
      SELECT id FROM experience_versions ORDER BY created_at DESC, id DESC LIMIT ${MAX_VERSIONS}
    )
  `
}
