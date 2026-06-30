import { NextRequest, NextResponse } from 'next/server'
import { Resend } from 'resend'
import { sql } from '@/lib/db'

type Row = {
  id: string
  visitor_id: string | null
  country: string | null
  city: string | null
  message_count: number
  tokens_used: number
  started_at: string
  first_q: string | null
}

// GET /api/cron/digest — invoked daily by Vercel Cron (see vercel.json).
// Vercel sends `Authorization: Bearer ${CRON_SECRET}` when CRON_SECRET is set,
// which is what gates this route. Add `?dry=1` to preview the email without sending.
export async function GET(req: NextRequest) {
  const auth = req.headers.get('authorization')
  if (!process.env.CRON_SECRET || auth !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const rows = (await sql`
    SELECT
      c.id, c.visitor_id, c.country, c.city, c.message_count, c.tokens_used, c.started_at,
      (
        SELECT m.content FROM chat_messages m
        WHERE m.conversation_id = c.id AND m.role = 'user'
        ORDER BY m.created_at ASC LIMIT 1
      ) AS first_q
    FROM chat_conversations c
    WHERE c.started_at > now() - interval '24 hours'
    ORDER BY c.started_at DESC
  `) as unknown as Row[]

  // No new activity → don't send a daily "nothing happened" email.
  if (rows.length === 0) {
    return NextResponse.json({ sent: false, reason: 'no new conversations' })
  }

  const totalTokens = rows.reduce((s, r) => s + (r.tokens_used || 0), 0)
  const text = [
    `${rows.length} new Goose conversation(s) in the last 24h (${totalTokens.toLocaleString()} tokens total):`,
    '',
    ...rows.flatMap((r) => {
      const loc = [r.city, r.country].filter(Boolean).join(', ') || 'unknown location'
      const q = r.first_q ? `"${r.first_q.slice(0, 200)}"` : '(no question captured)'
      return [`• ${loc} — ${r.message_count} msgs, ${r.tokens_used} tokens`, `    ${q}`]
    }),
    '',
    'View all: https://roddini.com/admin/conversations',
  ].join('\n')

  // Preview mode for testing — returns the email body without sending.
  if (req.nextUrl.searchParams.get('dry') === '1') {
    return NextResponse.json({ sent: false, dryRun: true, count: rows.length, text })
  }

  const resend = new Resend(process.env.RESEND_API_KEY)
  await resend.emails.send({
    from: 'Goose <onboarding@resend.dev>',
    to: 'aroddini@gmail.com',
    subject: `Goose: ${rows.length} new conversation${rows.length === 1 ? '' : 's'} in the last 24h`,
    text,
  })

  return NextResponse.json({ sent: true, count: rows.length })
}
