import { sql } from '@/lib/db'
import { NextRequest, NextResponse } from 'next/server'

export async function GET() {
  const rows = await sql`SELECT * FROM fun_projects ORDER BY sort_order ASC, created_at ASC`
  return NextResponse.json(rows)
}

export async function POST(request: NextRequest) {
  const { name, company, year, description, tags, sort_order, published, featured_in_carousel } = await request.json()
  const rows = await sql`
    INSERT INTO fun_projects (name, company, year, description, tags, sort_order, published, featured_in_carousel)
    VALUES (${name}, ${company}, ${year}, ${description}, ${tags ?? []}, ${sort_order ?? 0}, ${published ?? true}, ${featured_in_carousel ?? true})
    RETURNING *
  `
  return NextResponse.json(rows[0])
}
