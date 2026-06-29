import { NextRequest, NextResponse } from 'next/server'
import { sql } from '@/lib/db'

export async function POST(req: NextRequest) {
  const { name, email, company, reason } = await req.json()

  if (!name || !email || !reason) {
    return NextResponse.json({ error: 'name, email, and reason are required' }, { status: 400 })
  }

  const ip =
    req.headers.get('x-forwarded-for')?.split(',')[0].trim() ??
    req.headers.get('x-real-ip') ??
    'unknown'

  await sql`
    INSERT INTO chat_access_requests (ip, name, email, company, reason)
    VALUES (${ip}, ${name}, ${email}, ${company ?? null}, ${reason})
  `

  return NextResponse.json({ ok: true })
}
