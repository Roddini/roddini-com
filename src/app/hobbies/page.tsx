import { client } from '@/sanity/client'
import type { SanityHobby } from '@/sanity/types'
import HobbiesContent from './HobbiesContent'

export const revalidate = 60

export default async function HobbiesPage() {
  const hobbies = await client.fetch<SanityHobby[]>(`*[_type == "hobby"] | order(order asc)`)
  return <HobbiesContent hobbies={hobbies} />
}
