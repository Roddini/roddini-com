import { sql } from '@/lib/db'
import { NextRequest, NextResponse } from 'next/server'

export async function PATCH(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const { value, label, color, sort_order } = await request.json()
  const rows = await sql`
    UPDATE lookup_values SET
      value = COALESCE(${value}, value),
      label = COALESCE(${label}, label),
      color = COALESCE(${color}, color),
      sort_order = COALESCE(${sort_order}, sort_order)
    WHERE id = ${id}
    RETURNING *
  `
  return NextResponse.json(rows[0])
}

export async function DELETE(_request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  await sql`DELETE FROM lookup_values WHERE id = ${id}`
  return NextResponse.json({ ok: true })
}
