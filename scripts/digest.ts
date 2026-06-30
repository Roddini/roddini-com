/**
 * Daily digest of new Goose chatbot conversations.
 *
 * Reads the connection string from DIGEST_DATABASE_URL (a read-only, two-table
 * Neon role) — never hardcode a credential here. Prints a plain-text summary of
 * conversations started in the last 24h, intended to be run by a scheduled job
 * which relays the output as a notification.
 *
 *   DIGEST_DATABASE_URL='postgresql://digest_ro:...' npx tsx scripts/digest.ts
 */
import { neon } from '@neondatabase/serverless'

const url = process.env.DIGEST_DATABASE_URL
if (!url) {
  console.error('DIGEST_DATABASE_URL is not set')
  process.exit(1)
}

const sql = neon(url)

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

async function main() {
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

  if (rows.length === 0) {
    console.log('No new Goose conversations in the last 24h.')
    return
  }

  const totalTokens = rows.reduce((s, r) => s + (r.tokens_used || 0), 0)
  console.log(`${rows.length} new Goose conversation(s) in the last 24h (${totalTokens.toLocaleString()} tokens total):\n`)
  for (const r of rows) {
    const loc = [r.city, r.country].filter(Boolean).join(', ') || 'unknown location'
    const q = r.first_q ? `"${r.first_q.slice(0, 120)}"` : '(no question captured)'
    console.log(`• ${loc} — ${r.message_count} msgs, ${r.tokens_used} tokens`)
    console.log(`  first question: ${q}`)
  }
}

main().catch((err) => {
  console.error(err)
  process.exit(1)
})
