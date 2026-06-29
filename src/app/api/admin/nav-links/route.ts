import { sql } from '@/lib/db'
import { NextRequest, NextResponse } from 'next/server'

export async function GET() {
  const rows = await sql`SELECT * FROM nav_links ORDER BY sort_order ASC`
  return NextResponse.json(rows)
}

export async function POST(request: NextRequest) {
  const { href, label, sort_order } = await request.json()
  const rows = await sql`
    INSERT INTO nav_links (href, label, sort_order)
    VALUES (${href}, ${label}, ${sort_order ?? 0})
    RETURNING *
  `
  return NextResponse.json(rows[0])
}
