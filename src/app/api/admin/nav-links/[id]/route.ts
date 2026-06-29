import { sql } from '@/lib/db'
import { NextRequest, NextResponse } from 'next/server'

export async function PATCH(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const { href, label, sort_order } = await request.json()
  const rows = await sql`
    UPDATE nav_links SET
      href       = COALESCE(${href},       href),
      label      = COALESCE(${label},      label),
      sort_order = COALESCE(${sort_order}, sort_order)
    WHERE id = ${id} RETURNING *
  `
  return NextResponse.json(rows[0])
}

export async function DELETE(_request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  await sql`DELETE FROM nav_links WHERE id = ${id}`
  return NextResponse.json({ ok: true })
}
