import type { Metadata } from 'next'
import { sql } from '@/lib/db'
import type { Recommendation } from '@/lib/types'
import RecommendationsContent from './RecommendationsContent'

export const metadata: Metadata = {
  title: 'Recommendations',
  description: 'Andrew Roddini’s running list of things worth your money and time — products, food, deals, and picks he actually recommends.',
  alternates: { canonical: '/recommendations' },
}

export default async function RecommendationsPage() {
  const recommendations = await sql`SELECT * FROM recommendations WHERE published = true ORDER BY sort_order ASC` as unknown as Recommendation[]
  return <RecommendationsContent recommendations={recommendations} />
}
