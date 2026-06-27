import { neon } from '@neondatabase/serverless'
import * as dotenv from 'dotenv'

dotenv.config({ path: '.env.local' })

const sql = neon(process.env.DATABASE_URL!)

async function migrate() {
  console.log('Running migrations...')

  await sql`
    CREATE TABLE IF NOT EXISTS podcasts (
      id SERIAL PRIMARY KEY,
      name TEXT NOT NULL,
      description TEXT,
      category TEXT,
      frequency TEXT CHECK (frequency IN ('always', 'sometimes', 'occasionally')),
      link TEXT,
      sort_order INTEGER DEFAULT 0,
      published BOOLEAN DEFAULT true,
      featured_in_carousel BOOLEAN DEFAULT false,
      created_at TIMESTAMPTZ DEFAULT NOW()
    )
  `

  await sql`
    CREATE TABLE IF NOT EXISTS recommendations (
      id SERIAL PRIMARY KEY,
      name TEXT NOT NULL,
      category TEXT CHECK (category IN ('tech', 'food', 'costco', 'entertainment', 'general')),
      description TEXT,
      link TEXT,
      sort_order INTEGER DEFAULT 0,
      published BOOLEAN DEFAULT true,
      featured_in_carousel BOOLEAN DEFAULT false,
      created_at TIMESTAMPTZ DEFAULT NOW()
    )
  `

  await sql`
    CREATE TABLE IF NOT EXISTS hobbies (
      id SERIAL PRIMARY KEY,
      name TEXT NOT NULL,
      tagline TEXT,
      description TEXT,
      details TEXT[],
      link TEXT,
      link_label TEXT,
      promo_code TEXT,
      status TEXT DEFAULT 'active' CHECK (status IN ('active', 'placeholder')),
      sort_order INTEGER DEFAULT 0,
      published BOOLEAN DEFAULT true,
      featured_in_carousel BOOLEAN DEFAULT false,
      created_at TIMESTAMPTZ DEFAULT NOW()
    )
  `

  await sql`
    CREATE TABLE IF NOT EXISTS career_highlights (
      id SERIAL PRIMARY KEY,
      headline TEXT NOT NULL,
      company TEXT,
      period TEXT,
      description TEXT,
      accent TEXT,
      link TEXT,
      sort_order INTEGER DEFAULT 0,
      published BOOLEAN DEFAULT true,
      featured_in_carousel BOOLEAN DEFAULT false,
      created_at TIMESTAMPTZ DEFAULT NOW()
    )
  `

  await sql`
    CREATE TABLE IF NOT EXISTS site_sections (
      section_key TEXT PRIMARY KEY,
      visible BOOLEAN DEFAULT true
    )
  `

  await sql`
    INSERT INTO site_sections (section_key, visible) VALUES
      ('careerHighlights', true),
      ('hobbies', true),
      ('recommendations', true),
      ('entertainment', true),
      ('contact', true)
    ON CONFLICT (section_key) DO NOTHING
  `

  console.log('Migrations complete.')
}

migrate().catch((err) => {
  console.error(err)
  process.exit(1)
})
