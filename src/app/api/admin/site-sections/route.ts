import { sql } from '@/lib/db'
import { NextRequest, NextResponse } from 'next/server'

export async function GET() {
  // Ordered by the draft order so the dashboard list mirrors what Publish will
  // produce. Returns both live and draft_* columns.
  const rows = await sql`
    SELECT * FROM site_sections
    ORDER BY COALESCE(draft_sort_order, sort_order, 0), section_key
  `
  return NextResponse.json(rows)
}

// Writes to the draft_* columns only — nothing here touches the live homepage.
// Only fields present in the body are updated (empty string is a real value,
// e.g. a blanked nav label = "no side-nav dot").
export async function PATCH(request: NextRequest) {
  const body = await request.json()
  const { section_key, visible, section_header, nav_label, sort_order } = body

  if (visible !== undefined) {
    await sql`UPDATE site_sections SET draft_visible = ${visible} WHERE section_key = ${section_key}`
  }
  if (section_header !== undefined) {
    await sql`UPDATE site_sections SET draft_section_header = ${section_header} WHERE section_key = ${section_key}`
  }
  if (nav_label !== undefined) {
    await sql`UPDATE site_sections SET draft_nav_label = ${nav_label} WHERE section_key = ${section_key}`
  }
  if (sort_order !== undefined) {
    await sql`UPDATE site_sections SET draft_sort_order = ${sort_order} WHERE section_key = ${section_key}`
  }

  const rows = await sql`SELECT * FROM site_sections WHERE section_key = ${section_key}`
  return NextResponse.json(rows[0])
}
