import { client } from '@/sanity/client'
import type { SanityRecommendation } from '@/sanity/types'
import RecommendationsContent from './RecommendationsContent'

export const revalidate = 60

export default async function RecommendationsPage() {
  const recommendations = await client.fetch<SanityRecommendation[]>(`*[_type == "recommendation"] | order(order asc)`)
  return <RecommendationsContent recommendations={recommendations} />
}
