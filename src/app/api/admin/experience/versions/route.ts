import { sql } from '@/lib/db'
import { snapshotCurrentExperience, replaceExperience, type ExperienceInput } from '@/lib/experience'
import { NextRequest, NextResponse } from 'next/server'

// Lists saved snapshots (newest first) with their timestamp and entry count.
export async function GET() {
  const rows = await sql`
    SELECT id, created_at, jsonb_array_length(snapshot) AS entry_count
    FROM experience_versions
    ORDER BY created_at DESC, id DESC
  `
  return NextResponse.json(rows)
}

// Restores a snapshot by id. Snapshots the current set first so the restore is
// itself undoable, then replaces experience with the chosen version.
export async function POST(req: NextRequest) {
  const { restoreId } = await req.json()
  const rows = (await sql`
    SELECT snapshot FROM experience_versions WHERE id = ${restoreId}
  `) as unknown as { snapshot: ExperienceInput[] }[]

  if (rows.length === 0) {
    return NextResponse.json({ error: 'Version not found' }, { status: 404 })
  }

  await snapshotCurrentExperience()
  await replaceExperience(rows[0].snapshot)

  const exp = await sql`SELECT * FROM experience ORDER BY sort_order ASC`
  return NextResponse.json(exp)
}
