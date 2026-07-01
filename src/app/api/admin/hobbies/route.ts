import { sql } from '@/lib/db'
import { reorderContiguous } from '@/lib/sortOrder'
import { NextRequest, NextResponse } from 'next/server'

export async function GET() {
  const rows = await sql`SELECT * FROM hobbies ORDER BY sort_order ASC, created_at ASC`
  return NextResponse.json(rows)
}

export async function POST(request: NextRequest) {
  const { name, tagline, description, details, link, link_label, promo_code, status, sort_order, published, featured_in_carousel } = await request.json()
  const inserted = await sql`
    INSERT INTO hobbies (name, tagline, description, details, link, link_label, promo_code, status, sort_order, published, featured_in_carousel)
    VALUES (${name}, ${tagline}, ${description}, ${details ?? []}, ${link}, ${link_label}, ${promo_code}, ${status ?? 'active'}, ${sort_order ?? 0}, ${published ?? true}, ${featured_in_carousel ?? false})
    RETURNING *
  `
  await reorderContiguous('hobbies', inserted[0].id, sort_order ?? Number.MAX_SAFE_INTEGER)
  const rows = await sql`SELECT * FROM hobbies WHERE id = ${inserted[0].id}`
  return NextResponse.json(rows[0])
}
