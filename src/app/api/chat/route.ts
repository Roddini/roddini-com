import { NextRequest, NextResponse } from 'next/server'
import Anthropic from '@anthropic-ai/sdk'
import { sql } from '@/lib/db'
import fs from 'fs'
import path from 'path'

const anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY })
const TOKEN_LIMIT = parseInt(process.env.CHAT_TOKEN_LIMIT ?? '6000', 10)

let cachedContext: string | null = null
function getContext(): string {
  if (!cachedContext) {
    cachedContext = fs.readFileSync(
      path.join(process.cwd(), 'content', 'chatbot-context.md'),
      'utf-8'
    )
  }
  return cachedContext
}

function getIp(req: NextRequest): string {
  return (
    req.headers.get('x-forwarded-for')?.split(',')[0].trim() ??
    req.headers.get('x-real-ip') ??
    'unknown'
  )
}

export async function POST(req: NextRequest) {
  const ip = getIp(req)
  const { messages } = await req.json()

  // Check token usage
  const rows = await sql`
    SELECT tokens_used, approved FROM chat_sessions WHERE ip = ${ip}
  ` as unknown as { tokens_used: number; approved: boolean }[]

  const session = rows[0]
  if (session && session.tokens_used >= TOKEN_LIMIT && !session.approved) {
    return NextResponse.json({ limitReached: true }, { status: 402 })
  }

  const context = getContext()

  // Stream response from Claude
  const stream = await anthropic.messages.stream({
    model: 'claude-haiku-4-5-20251001',
    max_tokens: 1024,
    system: context,
    messages,
  })

  const encoder = new TextEncoder()

  const readable = new ReadableStream({
    async start(controller) {
      let inputTokens = 0
      let outputTokens = 0

      for await (const event of stream) {
        if (event.type === 'content_block_delta' && event.delta.type === 'text_delta') {
          controller.enqueue(encoder.encode(event.delta.text))
        }
        if (event.type === 'message_delta' && event.usage) {
          outputTokens = event.usage.output_tokens
        }
        if (event.type === 'message_start' && event.message.usage) {
          inputTokens = event.message.usage.input_tokens
        }
      }

      const tokensUsed = inputTokens + outputTokens
      await sql`
        INSERT INTO chat_sessions (ip, tokens_used, updated_at)
        VALUES (${ip}, ${tokensUsed}, NOW())
        ON CONFLICT (ip) DO UPDATE
          SET tokens_used = chat_sessions.tokens_used + ${tokensUsed},
              updated_at = NOW()
      `

      controller.close()
    },
  })

  return new Response(readable, {
    headers: { 'Content-Type': 'text/plain; charset=utf-8' },
  })
}
