import { sql } from '@/lib/db'
import { NextRequest, NextResponse } from 'next/server'

export async function PATCH(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const body = await request.json()
  const { name, tagline, description, details, link, link_label, promo_code, status, sort_order, published, featured_in_carousel } = body
  const rows = await sql`
    UPDATE hobbies SET
      name = COALESCE(${name}, name),
      tagline = COALESCE(${tagline}, tagline),
      description = COALESCE(${description}, description),
      details = COALESCE(${details}, details),
      link = COALESCE(${link}, link),
      link_label = COALESCE(${link_label}, link_label),
      promo_code = COALESCE(${promo_code}, promo_code),
      status = COALESCE(${status}, status),
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
  await sql`DELETE FROM hobbies WHERE id = ${id}`
  return NextResponse.json({ ok: true })
}
