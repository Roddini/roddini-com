import { sql } from '@/lib/db'
import { NextRequest, NextResponse } from 'next/server'

export async function GET() {
  const rows = await sql`SELECT * FROM life_hacks ORDER BY sort_order ASC, created_at ASC`
  return NextResponse.json(rows)
}

export async function POST(request: NextRequest) {
  const { name, category, description, link, sort_order, published, featured_in_carousel } = await request.json()
  const rows = await sql`
    INSERT INTO life_hacks (name, category, description, link, sort_order, published, featured_in_carousel)
    VALUES (${name}, ${category}, ${description}, ${link ?? ''}, ${sort_order ?? 0}, ${published ?? true}, ${featured_in_carousel ?? false})
    RETURNING *
  `
  return NextResponse.json(rows[0])
}
