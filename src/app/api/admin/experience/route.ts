import { sql } from '@/lib/db'
import { NextRequest, NextResponse } from 'next/server'

export async function GET() {
  const rows = await sql`SELECT * FROM experience ORDER BY sort_order ASC, created_at ASC`
  return NextResponse.json(rows)
}

export async function POST(request: NextRequest) {
  const { role, company, period, year, description, highlights, tags, accent, sort_order, published } = await request.json()
  const rows = await sql`
    INSERT INTO experience (role, company, period, year, description, highlights, tags, accent, sort_order, published)
    VALUES (
      ${role}, ${company ?? ''}, ${period ?? ''}, ${year ?? ''}, ${description ?? ''},
      ${highlights ?? []}, ${tags ?? []}, ${accent ?? '#00d4aa'}, ${sort_order ?? 0}, ${published ?? true}
    )
    RETURNING *
  `
  return NextResponse.json(rows[0])
}

// Replace-all: publishes a full set of parsed/edited entries at once.
// Deletes existing rows, then inserts the provided ones in order.
export async function PUT(request: NextRequest) {
  const { items } = await request.json()
  if (!Array.isArray(items)) {
    return NextResponse.json({ error: 'items must be an array' }, { status: 400 })
  }

  await sql`DELETE FROM experience`
  for (let i = 0; i < items.length; i++) {
    const e = items[i]
    await sql`
      INSERT INTO experience (role, company, period, year, description, highlights, tags, accent, sort_order, published)
      VALUES (
        ${e.role ?? ''}, ${e.company ?? ''}, ${e.period ?? ''}, ${e.year ?? ''}, ${e.description ?? ''},
        ${e.highlights ?? []}, ${e.tags ?? []}, ${e.accent ?? '#00d4aa'}, ${i}, ${e.published ?? true}
      )
    `
  }

  const rows = await sql`SELECT * FROM experience ORDER BY sort_order ASC`
  return NextResponse.json(rows)
}
