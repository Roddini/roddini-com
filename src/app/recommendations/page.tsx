import type { Metadata } from 'next'
import { sql } from '@/lib/db'
import type { Recommendation, LookupValue } from '@/lib/types'
import RecommendationsContent from './RecommendationsContent'

export const dynamic = 'force-dynamic'

export const metadata: Metadata = {
  title: 'Recommendations',
  description: 'Andrew Roddini’s running list of things worth your money and time — products, food, deals, and picks he actually recommends.',
  alternates: { canonical: '/recommendations' },
}

export default async function RecommendationsPage() {
  const [recommendations, categories] = await Promise.all([
    sql`SELECT * FROM recommendations WHERE published = true ORDER BY sort_order ASC` as unknown as Recommendation[],
    sql`SELECT value, label, color FROM lookup_values WHERE type = 'recommendation_category' ORDER BY sort_order ASC` as unknown as LookupValue[],
  ])
  return <RecommendationsContent recommendations={recommendations} categories={categories} />
}
