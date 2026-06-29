import { sql } from '@/lib/db'
import { NextRequest, NextResponse } from 'next/server'

export async function GET() {
  const rows = await sql`SELECT key, value FROM site_config` as unknown as { key: string; value: string }[]
  const config = Object.fromEntries(rows.map((r) => [r.key, r.value]))
  return NextResponse.json(config)
}

export async function PATCH(request: NextRequest) {
  const { key, value } = await request.json()
  const rows = await sql`
    UPDATE site_config SET value = ${value} WHERE key = ${key} RETURNING *
  `
  return NextResponse.json(rows[0])
}
