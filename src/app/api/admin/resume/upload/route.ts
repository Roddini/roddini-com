import { sql } from '@/lib/db'
import { NextRequest, NextResponse } from 'next/server'

// Reports whether a resume PDF is currently stored (for the admin UI status line).
export async function GET() {
  const rows = (await sql`
    SELECT filename, updated_at FROM assets WHERE key = 'resume_pdf'
  `) as unknown as { filename: string | null; updated_at: string }[]
  if (rows.length === 0) return NextResponse.json({ hasResume: false })
  return NextResponse.json({ hasResume: true, filename: rows[0].filename, updated_at: rows[0].updated_at })
}

// Stores/replaces the downloadable resume PDF (base64) in the DB.
export async function POST(req: NextRequest) {
  const { pdfBase64, filename } = await req.json()
  if (!pdfBase64) {
    return NextResponse.json({ error: 'pdfBase64 is required' }, { status: 400 })
  }
  await sql`
    INSERT INTO assets (key, data_base64, content_type, filename, updated_at)
    VALUES ('resume_pdf', ${pdfBase64}, 'application/pdf', ${filename ?? 'andrew-roddini-resume.pdf'}, NOW())
    ON CONFLICT (key) DO UPDATE SET
      data_base64 = EXCLUDED.data_base64,
      content_type = EXCLUDED.content_type,
      filename = EXCLUDED.filename,
      updated_at = NOW()
  `
  return NextResponse.json({ ok: true })
}
