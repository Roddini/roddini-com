import { sql } from './db'

// Tables whose rows carry a `sort_order` the admin can reorder. The table name
// is interpolated into the SQL below, so it must ONLY ever come from this
// allowlist — never from user input — to stay injection-safe.
const REORDERABLE = new Set([
  'recommendations',
  'hobbies',
  'life_hacks',
  'podcasts',
  'projects',
  'fun_projects',
  'career_highlights',
])

// Place `movedId` at the 0-based `desiredOrder`, then renumber every row to a
// contiguous 0..N-1 sequence (ordered by current sort_order, then created_at).
// This is what makes "save a card at position 2" push everything at/after 2 down
// by one and leaves no gaps or duplicate order numbers.
export async function reorderContiguous(table: string, movedId: number, desiredOrder: number) {
  if (!REORDERABLE.has(table)) throw new Error(`not reorderable: ${table}`)

  const rows = (await sql.query(
    `SELECT id FROM ${table} ORDER BY sort_order ASC, created_at ASC`
  )) as { id: number }[]

  const ids = rows.map((r) => r.id).filter((id) => id !== movedId)
  const idx = Math.max(0, Math.min(desiredOrder, ids.length))
  ids.splice(idx, 0, movedId)

  if (ids.length === 0) return
  await sql.transaction(
    ids.map((id, i) => sql.query(`UPDATE ${table} SET sort_order = $1 WHERE id = $2`, [i, id]))
  )
}
