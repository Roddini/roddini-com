import { neon } from '@neondatabase/serverless'
import * as dotenv from 'dotenv'
import { RESUME } from '../src/data/resume'

dotenv.config({ path: '.env.local' })

const sql = neon(process.env.DATABASE_URL!)

async function seed() {
  console.log('Seeding projects...')

  for (let i = 0; i < RESUME.projects.length; i++) {
    const p = RESUME.projects[i]
    await sql`
      INSERT INTO projects (name, company, year, description, tags, sort_order, published, featured_in_carousel)
      VALUES (${p.name}, ${p.company}, ${p.year}, ${p.description}, ${p.tags}, ${i}, true, true)
      ON CONFLICT DO NOTHING
    `
  }

  console.log(`Inserted ${RESUME.projects.length} projects.`)

  console.log('Seeding fun projects...')

  for (let i = 0; i < RESUME.funProjects.length; i++) {
    const p = RESUME.funProjects[i]
    await sql`
      INSERT INTO fun_projects (name, company, year, description, tags, sort_order, published, featured_in_carousel)
      VALUES (${p.name}, ${p.company}, ${p.year}, ${p.description}, ${p.tags}, ${i}, true, true)
      ON CONFLICT DO NOTHING
    `
  }

  console.log(`Inserted ${RESUME.funProjects.length} fun projects.`)
}

seed().catch((err) => {
  console.error(err)
  process.exit(1)
})
