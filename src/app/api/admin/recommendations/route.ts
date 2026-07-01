import { sql } from '@/lib/db'
import { reorderContiguous } from '@/lib/sortOrder'
import { NextRequest, NextResponse } from 'next/server'

export async function GET() {
  const rows = await sql`SELECT * FROM recommendations ORDER BY sort_order ASC, created_at ASC`
  return NextResponse.json(rows)
}

export async function POST(request: NextRequest) {
  const { name, category, description, link, sort_order, published, featured_in_carousel } = await request.json()
  const inserted = await sql`
    INSERT INTO recommendations (name, category, description, link, sort_order, published, featured_in_carousel)
    VALUES (${name}, ${category}, ${description}, ${link}, ${sort_order ?? 0}, ${published ?? true}, ${featured_in_carousel ?? false})
    RETURNING *
  `
  await reorderContiguous('recommendations', inserted[0].id, sort_order ?? Number.MAX_SAFE_INTEGER)
  const rows = await sql`SELECT * FROM recommendations WHERE id = ${inserted[0].id}`
  return NextResponse.json(rows[0])
}
