import { sql } from '@/lib/db'
import { NextRequest, NextResponse } from 'next/server'

// POST { action: 'publish' } (default) copies every draft_* value onto its live
// column — the single point at which dashboard edits reach the homepage.
// POST { action: 'discard' } throws away the draft by resetting it to live.
export async function POST(request: NextRequest) {
  const { action } = await request.json().catch(() => ({ action: 'publish' }))

  if (action === 'discard') {
    await sql`
      UPDATE site_sections SET
        draft_visible        = visible,
        draft_section_header = section_header,
        draft_nav_label      = nav_label,
        draft_sort_order     = sort_order
    `
  } else {
    await sql`
      UPDATE site_sections SET
        visible        = COALESCE(draft_visible, visible),
        section_header = draft_section_header,
        nav_label      = draft_nav_label,
        sort_order     = COALESCE(draft_sort_order, sort_order)
    `
  }

  const rows = await sql`
    SELECT * FROM site_sections
    ORDER BY COALESCE(draft_sort_order, sort_order, 0), section_key
  `
  return NextResponse.json(rows)
}
