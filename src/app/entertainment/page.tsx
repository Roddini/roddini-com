import { sql } from '@/lib/db'
import type { Podcast } from '@/lib/types'
import EntertainmentContent from './EntertainmentContent'

export default async function EntertainmentPage() {
  const podcasts = await sql`SELECT * FROM podcasts WHERE published = true ORDER BY sort_order ASC` as unknown as Podcast[]
  return <EntertainmentContent podcasts={podcasts} />
}
