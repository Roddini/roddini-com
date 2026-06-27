import { sql } from '@/lib/db'
import { NextRequest, NextResponse } from 'next/server'

export async function PATCH(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const body = await request.json()
  const { name, company, year, description, tags, sort_order, published, featured_in_carousel } = body
  const rows = await sql`
    UPDATE fun_projects SET
      name = COALESCE(${name}, name),
      company = COALESCE(${company}, company),
      year = COALESCE(${year}, year),
      description = COALESCE(${description}, description),
      tags = COALESCE(${tags}, tags),
      sort_order = COALESCE(${sort_order}, sort_order),
      published = COALESCE(${published}, published),
      featured_in_carousel = COALESCE(${featured_in_carousel}, featured_in_carousel)
    WHERE id = ${id}
    RETURNING *
  `
  return NextResponse.json(rows[0])
}

export async function DELETE(_request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  await sql`DELETE FROM fun_projects WHERE id = ${id}`
  return NextResponse.json({ ok: true })
}
