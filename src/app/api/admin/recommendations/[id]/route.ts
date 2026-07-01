import { sql } from '@/lib/db'
import { reorderContiguous } from '@/lib/sortOrder'
import { NextRequest, NextResponse } from 'next/server'

export async function PATCH(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const body = await request.json()
  const { name, category, description, link, sort_order, published, featured_in_carousel } = body
  const rows = await sql`
    UPDATE recommendations SET
      name = COALESCE(${name}, name),
      category = COALESCE(${category}, category),
      description = COALESCE(${description}, description),
      link = COALESCE(${link}, link),
      sort_order = COALESCE(${sort_order}, sort_order),
      published = COALESCE(${published}, published),
      featured_in_carousel = COALESCE(${featured_in_carousel}, featured_in_carousel)
    WHERE id = ${id}
    RETURNING *
  `
  if (sort_order !== undefined && sort_order !== null) {
    await reorderContiguous('recommendations', Number(id), sort_order)
    const refreshed = await sql`SELECT * FROM recommendations WHERE id = ${id}`
    return NextResponse.json(refreshed[0])
  }
  return NextResponse.json(rows[0])
}

export async function DELETE(_request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  await sql`DELETE FROM recommendations WHERE id = ${id}`
  return NextResponse.json({ ok: true })
}
