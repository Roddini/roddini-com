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
    CREATE TABLE IF NOT EXISTS projects (
      id SERIAL PRIMARY KEY,
      name TEXT NOT NULL,
      company TEXT,
      year TEXT,
      description TEXT,
      tags TEXT[],
      sort_order INTEGER DEFAULT 0,
      published BOOLEAN DEFAULT true,
      featured_in_carousel BOOLEAN DEFAULT true,
      created_at TIMESTAMPTZ DEFAULT NOW()
    )
  `

  await sql`
    CREATE TABLE IF NOT EXISTS fun_projects (
      id SERIAL PRIMARY KEY,
      name TEXT NOT NULL,
      company TEXT,
      year TEXT,
      description TEXT,
      tags TEXT[],
      sort_order INTEGER DEFAULT 0,
      published BOOLEAN DEFAULT true,
      featured_in_carousel BOOLEAN DEFAULT true,
      created_at TIMESTAMPTZ DEFAULT NOW()
    )
  `

  await sql`
    INSERT INTO site_sections (section_key, visible) VALUES
      ('projects', true),
      ('funProjects', true)
    ON CONFLICT (section_key) DO NOTHING
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

  await sql`
    CREATE TABLE IF NOT EXISTS lookup_values (
      id SERIAL PRIMARY KEY,
      type TEXT NOT NULL,
      value TEXT NOT NULL,
      label TEXT NOT NULL,
      color TEXT DEFAULT '#00d4aa',
      sort_order INT NOT NULL DEFAULT 0,
      UNIQUE(type, value)
    )
  `

  await sql`
    INSERT INTO lookup_values (type, value, label, color, sort_order) VALUES
      ('recommendation_category', 'tech', 'Tech', '#22d3ee', 0),
      ('recommendation_category', 'food', 'Food', '#f59e0b', 1),
      ('recommendation_category', 'costco', 'Costco', '#0ea5e9', 2),
      ('recommendation_category', 'entertainment', 'Entertainment', '#a78bfa', 3),
      ('recommendation_category', 'general', 'General', '#00d4aa', 4)
    ON CONFLICT (type, value) DO NOTHING
  `

  await sql`
    INSERT INTO lookup_values (type, value, label, color, sort_order) VALUES
      ('podcast_frequency', 'always', 'Always On', '#00d4aa', 0),
      ('podcast_frequency', 'sometimes', 'Sometimes', '#22d3ee', 1),
      ('podcast_frequency', 'occasionally', 'Occasionally', '#0ea5e9', 2)
    ON CONFLICT (type, value) DO NOTHING
  `

  // Remove hardcoded CHECK constraints so any value is allowed
  await sql`ALTER TABLE recommendations DROP CONSTRAINT IF EXISTS recommendations_category_check`
  await sql`ALTER TABLE podcasts DROP CONSTRAINT IF EXISTS podcasts_frequency_check`

  console.log('Migrations complete.')
}

migrate().catch((err) => {
  console.error(err)
  process.exit(1)
})
