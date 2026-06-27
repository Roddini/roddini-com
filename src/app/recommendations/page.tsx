import { sql } from '@/lib/db'
import type { Recommendation } from '@/lib/types'
import RecommendationsContent from './RecommendationsContent'

export default async function RecommendationsPage() {
  const recommendations = await sql`SELECT * FROM recommendations WHERE published = true ORDER BY sort_order ASC` as unknown as Recommendation[]
  return <RecommendationsContent recommendations={recommendations} />
}
