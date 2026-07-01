import { NextRequest, NextResponse } from 'next/server'
import Anthropic from '@anthropic-ai/sdk'

const anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY })

const SYSTEM = `You extract work experience from a résumé into structured JSON for a personal website's timeline.
Return ONLY a JSON object — no prose, no markdown fences — of exactly this shape:

{
  "experience": [
    {
      "role": "string — job title",
      "company": "string — employer name",
      "period": "string — full date range, e.g. '2017 — 2021'",
      "year": "string — short end label shown on the timeline, e.g. '2021' or 'Present'",
      "description": "string — a 1-2 sentence blurb about the company/context; empty string if none",
      "highlights": ["string — each a full-sentence accomplishment bullet, verbatim from the résumé where possible"],
      "tags": ["string — 2-3 short punchy labels summarizing the role, e.g. 'Series A → National Bank'"]
    }
  ]
}

Rules:
- Order entries most-recent first.
- Keep each recent, substantial role as its own entry.
- Consolidate early-career and junior roles into ONE combined entry titled "Earlier Roles" — the earliest cluster of shorter sales, operations, assistant, IT, production, or internship-type positions. Put those employers in the "company" field joined by " · ", give it an appropriate early date range (period) and end "year", and include 3-5 representative highlights spanning them. Do NOT give those early jobs separate entries.
- Keep highlight wording faithful to the résumé; do not invent metrics, titles, or dates.
- Do not include education, skills, or contact info — work experience only.`

// Pull the JSON object out of the model's reply, tolerating stray prose or code fences.
function extractJson(raw: string): { experience?: unknown[] } {
  const fenced = raw.match(/```(?:json)?\s*([\s\S]*?)```/)
  const candidate = fenced ? fenced[1] : raw
  try {
    return JSON.parse(candidate)
  } catch {
    const start = candidate.indexOf('{')
    const end = candidate.lastIndexOf('}')
    if (start !== -1 && end > start) {
      return JSON.parse(candidate.slice(start, end + 1))
    }
    throw new Error('Could not parse structured experience from the model response.')
  }
}

export async function POST(req: NextRequest) {
  try {
    const { pdfBase64, text } = await req.json()
    if (!pdfBase64 && !text?.trim()) {
      return NextResponse.json({ error: 'Provide a PDF or résumé text.' }, { status: 400 })
    }

    const content: Anthropic.ContentBlockParam[] = []
    if (pdfBase64) {
      content.push({
        type: 'document',
        source: { type: 'base64', media_type: 'application/pdf', data: pdfBase64 },
      })
    }
    content.push({
      type: 'text',
      text: text?.trim()
        ? `Extract the work experience from this résumé text:\n\n${text.trim()}`
        : 'Extract the work experience from the attached résumé PDF.',
    })

    const msg = await anthropic.messages.create({
      model: 'claude-opus-4-8',
      max_tokens: 8000,
      system: SYSTEM,
      messages: [{ role: 'user', content }],
    })

    const raw = msg.content
      .filter((b): b is Anthropic.TextBlock => b.type === 'text')
      .map((b) => b.text)
      .join('')

    const parsed = extractJson(raw)
    const items = Array.isArray(parsed.experience) ? parsed.experience : []
    return NextResponse.json({ items })
  } catch (err) {
    return NextResponse.json(
      { error: (err as Error).message ?? 'Failed to parse résumé.' },
      { status: 500 }
    )
  }
}
