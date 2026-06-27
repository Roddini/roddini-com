import { sql } from '@/lib/db'
import type { Hobby } from '@/lib/types'
import HobbiesContent from './HobbiesContent'

export default async function HobbiesPage() {
  const hobbies = await sql`SELECT * FROM hobbies WHERE published = true ORDER BY sort_order ASC` as unknown as Hobby[]
  return <HobbiesContent hobbies={hobbies} />
}
