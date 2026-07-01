import type { Metadata } from 'next'
import { sql } from '@/lib/db'
import type { Podcast } from '@/lib/types'
import EntertainmentContent from './EntertainmentContent'

export const dynamic = 'force-dynamic'

export const metadata: Metadata = {
  title: 'Entertainment',
  description: 'What Andrew Roddini is listening to and watching — the podcasts and shows on regular rotation.',
  alternates: { canonical: '/entertainment' },
}

export default async function EntertainmentPage() {
  const podcasts = await sql`SELECT * FROM podcasts WHERE published = true ORDER BY sort_order ASC` as unknown as Podcast[]
  return <EntertainmentContent podcasts={podcasts} />
}
