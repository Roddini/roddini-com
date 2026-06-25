import { client } from '@/sanity/client'
import type { SanityPodcast } from '@/sanity/types'
import EntertainmentContent from './EntertainmentContent'

export const revalidate = 60

export default async function EntertainmentPage() {
  const podcasts = await client.fetch<SanityPodcast[]>(`*[_type == "podcast"] | order(order asc)`)
  return <EntertainmentContent podcasts={podcasts} />
}
