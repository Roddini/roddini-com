import type { Metadata } from 'next'
import { sql } from '@/lib/db'
import type { Hobby } from '@/lib/types'
import HobbiesContent from './HobbiesContent'

export const dynamic = 'force-dynamic'

export const metadata: Metadata = {
  title: 'Hobbies',
  description: 'Things Andrew Roddini does outside of work — the hobbies, projects, and obsessions he keeps coming back to.',
  alternates: { canonical: '/hobbies' },
}

export default async function HobbiesPage() {
  const hobbies = await sql`SELECT * FROM hobbies WHERE published = true ORDER BY sort_order ASC` as unknown as Hobby[]
  return <HobbiesContent hobbies={hobbies} />
}
