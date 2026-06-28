import { neon } from '@neondatabase/serverless'
import * as dotenv from 'dotenv'
import { RESUME } from '../src/data/resume'

dotenv.config({ path: '.env.local' })

const sql = neon(process.env.DATABASE_URL!)

async function seed() {
  console.log('Seeding career highlights...')

  for (let i = 0; i < RESUME.careerHighlights.length; i++) {
    const ch = RESUME.careerHighlights[i]
    await sql`
      INSERT INTO career_highlights (headline, company, period, description, accent, link, sort_order, published, featured_in_carousel)
      VALUES (
        ${ch.headline},
        ${ch.company},
        ${ch.period},
        ${ch.description},
        ${ch.accent},
        ${'link' in ch ? ch.link as string : null},
        ${i},
        true,
        true
      )
      ON CONFLICT DO NOTHING
    `
  }

  console.log(`Inserted ${RESUME.careerHighlights.length} career highlights.`)
}

seed().catch((err) => {
  console.error(err)
  process.exit(1)
})
