import { sql } from '@/lib/db'
import { NextRequest, NextResponse } from 'next/server'

export async function GET(request: NextRequest) {
  const type = request.nextUrl.searchParams.get('type')
  const rows = type
    ? await sql`SELECT * FROM lookup_values WHERE type = ${type} ORDER BY sort_order ASC`
    : await sql`SELECT * FROM lookup_values ORDER BY type ASC, sort_order ASC`
  return NextResponse.json(rows)
}

export async function POST(request: NextRequest) {
  const { type, value, label, color, sort_order } = await request.json()
  const rows = await sql`
    INSERT INTO lookup_values (type, value, label, color, sort_order)
    VALUES (${type}, ${value}, ${label}, ${color ?? '#00d4aa'}, ${sort_order ?? 0})
    RETURNING *
  `
  return NextResponse.json(rows[0])
}
