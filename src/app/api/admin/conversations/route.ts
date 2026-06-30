import { sql } from '@/lib/db'
import { NextRequest, NextResponse } from 'next/server'
import type { ChatConversationSummary } from '@/lib/types'

// GET /api/admin/conversations?q=&from=&to=
// Lists conversations (newest first), joined to any access request from the same IP.
// q  — keyword match against message content
// from/to — ISO date bounds on started_at
export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url)
  const q = searchParams.get('q')?.trim() || null
  const from = searchParams.get('from') || null
  const to = searchParams.get('to') || null

  const rows = await sql`
    SELECT
      c.*,
      r.name  AS request_name,
      r.email AS request_email
    FROM chat_conversations c
    LEFT JOIN LATERAL (
      SELECT name, email FROM chat_access_requests
      WHERE ip = c.ip ORDER BY created_at DESC LIMIT 1
    ) r ON TRUE
    WHERE
      (${q}::text IS NULL OR EXISTS (
        SELECT 1 FROM chat_messages m
        WHERE m.conversation_id = c.id AND m.content ILIKE '%' || ${q} || '%'
      ))
      AND (${from}::timestamptz IS NULL OR c.started_at >= ${from}::timestamptz)
      AND (${to}::timestamptz IS NULL OR c.started_at <= ${to}::timestamptz)
    ORDER BY c.updated_at DESC
  ` as unknown as ChatConversationSummary[]

  return NextResponse.json(rows)
}
