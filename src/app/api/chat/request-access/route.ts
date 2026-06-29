import { NextRequest, NextResponse } from 'next/server'
import { Resend } from 'resend'
import { sql } from '@/lib/db'

const resend = new Resend(process.env.RESEND_API_KEY)

export async function POST(req: NextRequest) {
  const { name, email, company, reason } = await req.json()

  if (!name || !email) {
    return NextResponse.json({ error: 'name and email are required' }, { status: 400 })
  }

  const ip =
    req.headers.get('x-forwarded-for')?.split(',')[0].trim() ??
    req.headers.get('x-real-ip') ??
    'unknown'

  await sql`
    INSERT INTO chat_access_requests (ip, name, email, company, reason)
    VALUES (${ip}, ${name}, ${email}, ${company ?? null}, ${reason})
  `

  // Fire-and-forget — don't let email failure block the response
  resend.emails.send({
    from: 'Goose <onboarding@resend.dev>',
    to: 'aroddini@gmail.com',
    subject: `Goose access request from ${name}`,
    text: [
      `Name: ${name}`,
      `Email: ${email}`,
      company ? `Company: ${company}` : null,
      `Reason: ${reason}`,
      `IP: ${ip}`,
      ``,
      `To approve, run:`,
      `UPDATE chat_sessions SET approved = TRUE WHERE ip = '${ip}';`,
    ]
      .filter(Boolean)
      .join('\n'),
  }).catch(() => {})

  return NextResponse.json({ ok: true })
}
