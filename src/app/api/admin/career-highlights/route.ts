import { sql } from '@/lib/db'
import { NextRequest, NextResponse } from 'next/server'

export async function GET() {
  const rows = await sql`SELECT * FROM career_highlights ORDER BY sort_order ASC, created_at ASC`
  return NextResponse.json(rows)
}

export async function POST(request: NextRequest) {
  const { headline, company, period, description, accent, link, sort_order, published, featured_in_carousel } = await request.json()
  const rows = await sql`
    INSERT INTO career_highlights (headline, company, period, description, accent, link, sort_order, published, featured_in_carousel)
    VALUES (${headline}, ${company}, ${period}, ${description}, ${accent}, ${link}, ${sort_order ?? 0}, ${published ?? true}, ${featured_in_carousel ?? false})
    RETURNING *
  `
  return NextResponse.json(rows[0])
}
