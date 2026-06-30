import { sql } from '@/lib/db'
import { NextRequest, NextResponse } from 'next/server'
import type { ChatConversation, ChatMessage } from '@/lib/types'

// GET /api/admin/conversations/[id] — one conversation + its messages in order
export async function GET(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params

  const convRows = await sql`
    SELECT * FROM chat_conversations WHERE id = ${id}
  ` as unknown as ChatConversation[]

  if (!convRows[0]) {
    return NextResponse.json({ error: 'Not found' }, { status: 404 })
  }

  const messages = await sql`
    SELECT * FROM chat_messages WHERE conversation_id = ${id} ORDER BY created_at ASC, id ASC
  ` as unknown as ChatMessage[]

  return NextResponse.json({ conversation: convRows[0], messages })
}

// DELETE /api/admin/conversations/[id] — removes the conversation (messages cascade)
export async function DELETE(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  await sql`DELETE FROM chat_conversations WHERE id = ${id}`
  return NextResponse.json({ ok: true })
}
