import { sql } from '@/lib/db'
import { NextRequest, NextResponse } from 'next/server'

export async function PATCH(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const { role, company, period, year, description, highlights, tags, accent, sort_order, published } = await request.json()
  const rows = await sql`
    UPDATE experience SET
      role = COALESCE(${role}, role),
      company = COALESCE(${company}, company),
      period = COALESCE(${period}, period),
      year = COALESCE(${year}, year),
      description = COALESCE(${description}, description),
      highlights = COALESCE(${highlights}, highlights),
      tags = COALESCE(${tags}, tags),
      accent = COALESCE(${accent}, accent),
      sort_order = COALESCE(${sort_order}, sort_order),
      published = COALESCE(${published}, published)
    WHERE id = ${id}
    RETURNING *
  `
  return NextResponse.json(rows[0])
}

export async function DELETE(_request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  await sql`DELETE FROM experience WHERE id = ${id}`
  return NextResponse.json({ ok: true })
}
