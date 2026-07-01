import { sql } from '@/lib/db'
import { reorderContiguous } from '@/lib/sortOrder'
import { NextRequest, NextResponse } from 'next/server'

export async function GET() {
  const rows = await sql`SELECT * FROM projects ORDER BY sort_order ASC, created_at ASC`
  return NextResponse.json(rows)
}

export async function POST(request: NextRequest) {
  const { name, company, year, description, tags, sort_order, published, featured_in_carousel } = await request.json()
  const inserted = await sql`
    INSERT INTO projects (name, company, year, description, tags, sort_order, published, featured_in_carousel)
    VALUES (${name}, ${company}, ${year}, ${description}, ${tags ?? []}, ${sort_order ?? 0}, ${published ?? true}, ${featured_in_carousel ?? true})
    RETURNING *
  `
  await reorderContiguous('projects', inserted[0].id, sort_order ?? Number.MAX_SAFE_INTEGER)
  const rows = await sql`SELECT * FROM projects WHERE id = ${inserted[0].id}`
  return NextResponse.json(rows[0])
}
