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
  try {
    const ip = getIp(req)
    const { messages, conversationId, visitorId } = await req.json()
    const country = req.headers.get('x-vercel-ip-country')
    const city = req.headers.get('x-vercel-ip-city')

    // Check token usage
    const rows = await sql`
      SELECT tokens_used, approved, token_limit_override FROM chat_sessions WHERE ip = ${ip}
    ` as unknown as { tokens_used: number; approved: boolean; token_limit_override: number | null }[]

    const session = rows[0]
    const effectiveLimit = session?.approved
      ? (session.token_limit_override ?? Infinity)
      : TOKEN_LIMIT
    if (session && session.tokens_used >= effectiveLimit) {
      return NextResponse.json({ limitReached: true }, { status: 402 })
    }

    // Log the conversation + the incoming user message (best-effort)
    if (conversationId) {
      await sql`
        INSERT INTO chat_conversations (id, visitor_id, ip, country, city)
        VALUES (${conversationId}, ${visitorId ?? null}, ${ip}, ${country}, ${city})
        ON CONFLICT (id) DO UPDATE SET updated_at = NOW()
      `
      const lastUser = messages[messages.length - 1]
      if (lastUser?.role === 'user') {
        await sql`
          INSERT INTO chat_messages (conversation_id, role, content)
          VALUES (${conversationId}, 'user', ${lastUser.content})
        `
      }
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
        let assistantText = ''

        try {
          for await (const event of stream) {
            if (event.type === 'content_block_delta' && event.delta.type === 'text_delta') {
              assistantText += event.delta.text
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

          // Persist the assistant reply + roll up conversation counts
          if (conversationId) {
            if (assistantText) {
              await sql`
                INSERT INTO chat_messages (conversation_id, role, content)
                VALUES (${conversationId}, 'assistant', ${assistantText})
              `
            }
            await sql`
              UPDATE chat_conversations
              SET message_count = message_count + 2,
                  tokens_used = tokens_used + ${tokensUsed},
                  updated_at = NOW()
              WHERE id = ${conversationId}
            `
          }
        } catch (streamErr) {
          controller.enqueue(encoder.encode(`Error: ${(streamErr as Error).message}`))
        }

        controller.close()
      },
    })

    return new Response(readable, {
      headers: { 'Content-Type': 'text/plain; charset=utf-8' },
    })
  } catch (err) {
    return NextResponse.json(
      { error: (err as Error).message ?? 'Internal server error' },
      { status: 500 }
    )
  }
}
