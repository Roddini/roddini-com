import { sql } from '@/lib/db'
import { snapshotCurrentExperience, replaceExperience } from '@/lib/experience'
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
// Snapshots the current set into experience_versions first (so it can be reverted),
// then replaces it with the provided entries in order.
export async function PUT(request: NextRequest) {
  const { items } = await request.json()
  if (!Array.isArray(items)) {
    return NextResponse.json({ error: 'items must be an array' }, { status: 400 })
  }

  await snapshotCurrentExperience()
  await replaceExperience(items)

  const rows = await sql`SELECT * FROM experience ORDER BY sort_order ASC`
  return NextResponse.json(rows)
}
