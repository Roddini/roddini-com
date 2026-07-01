import { sql } from '@/lib/db'
import { NextResponse } from 'next/server'
import fs from 'fs'
import path from 'path'

export const dynamic = 'force-dynamic'

// Public route: serves the resume PDF. Prefers the admin-uploaded copy stored in
// the DB (so uploads take effect without a redeploy); falls back to the static
// file bundled in public/ if nothing has been uploaded yet.
export async function GET() {
  try {
    const rows = (await sql`
      SELECT data_base64, content_type, filename FROM assets WHERE key = 'resume_pdf'
    `) as unknown as { data_base64: string; content_type: string; filename: string | null }[]

    if (rows.length > 0 && rows[0].data_base64) {
      const buf = Buffer.from(rows[0].data_base64, 'base64')
      return new NextResponse(new Uint8Array(buf), {
        headers: {
          'Content-Type': rows[0].content_type || 'application/pdf',
          'Content-Disposition': `inline; filename="${rows[0].filename ?? 'andrew-roddini-resume.pdf'}"`,
          'Cache-Control': 'public, max-age=0, must-revalidate',
        },
      })
    }
  } catch {
    // fall through to the static file
  }

  try {
    const buf = fs.readFileSync(path.join(process.cwd(), 'public', 'andrew-roddini-resume.pdf'))
    return new NextResponse(new Uint8Array(buf), {
      headers: {
        'Content-Type': 'application/pdf',
        'Content-Disposition': 'inline; filename="andrew-roddini-resume.pdf"',
      },
    })
  } catch {
    return NextResponse.json({ error: 'Resume not found' }, { status: 404 })
  }
}
