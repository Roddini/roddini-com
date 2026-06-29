import { sql } from '@/lib/db'
import { NextRequest, NextResponse } from 'next/server'

export async function GET() {
  const rows = await sql`SELECT * FROM site_sections ORDER BY section_key`
  return NextResponse.json(rows)
}

export async function PATCH(request: NextRequest) {
  const { section_key, visible, section_header, nav_label } = await request.json()
  const rows = await sql`
    UPDATE site_sections SET
      visible        = COALESCE(${visible},        visible),
      section_header = COALESCE(${section_header}, section_header),
      nav_label      = COALESCE(${nav_label},      nav_label)
    WHERE section_key = ${section_key} RETURNING *
  `
  return NextResponse.json(rows[0])
}
