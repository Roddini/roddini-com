import { NextRequest, NextResponse } from 'next/server'
import { sql } from '@/lib/db'

type AccessRequest = {
  id: number
  ip: string
  name: string
  email: string
  company: string | null
  reason: string
  approved: boolean
  created_at: string
  tokens_used: number | null
  session_approved: boolean | null
  token_limit_override: number | null
}

export async function GET() {
  const rows = await sql`
    SELECT
      r.id, r.ip, r.name, r.email, r.company, r.reason, r.approved, r.created_at,
      s.tokens_used, s.approved AS session_approved, s.token_limit_override
    FROM chat_access_requests r
    LEFT JOIN chat_sessions s ON s.ip = r.ip
    ORDER BY r.created_at DESC
  ` as unknown as AccessRequest[]

  return NextResponse.json(rows)
}

export async function POST(req: NextRequest) {
  const { ip, tokenLimit } = await req.json() as { ip: string; tokenLimit?: number | null }

  await sql`
    INSERT INTO chat_sessions (ip, tokens_used, approved, token_limit_override, updated_at)
    VALUES (${ip}, 0, TRUE, ${tokenLimit ?? null}, NOW())
    ON CONFLICT (ip) DO UPDATE
      SET approved = TRUE,
          token_limit_override = ${tokenLimit ?? null},
          updated_at = NOW()
  `

  await sql`
    UPDATE chat_access_requests SET approved = TRUE WHERE ip = ${ip}
  `

  return NextResponse.json({ ok: true })
}
