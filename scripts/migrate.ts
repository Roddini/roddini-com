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

  await sql`
    CREATE TABLE IF NOT EXISTS chat_sessions (
      ip TEXT PRIMARY KEY,
      tokens_used INT DEFAULT 0,
      approved BOOLEAN DEFAULT FALSE,
      updated_at TIMESTAMPTZ DEFAULT NOW()
    )
  `

  await sql`
    CREATE TABLE IF NOT EXISTS chat_access_requests (
      id SERIAL PRIMARY KEY,
      ip TEXT NOT NULL,
      name TEXT NOT NULL,
      email TEXT NOT NULL,
      company TEXT,
      reason TEXT NOT NULL,
      approved BOOLEAN DEFAULT FALSE,
      created_at TIMESTAMPTZ DEFAULT NOW()
    )
  `

  await sql`
    ALTER TABLE chat_sessions
    ADD COLUMN IF NOT EXISTS token_limit_override INT DEFAULT NULL
  `

  // Remove hardcoded CHECK constraints so any value is allowed
  await sql`ALTER TABLE recommendations DROP CONSTRAINT IF EXISTS recommendations_category_check`
  await sql`ALTER TABLE podcasts DROP CONSTRAINT IF EXISTS podcasts_frequency_check`

  // Extend site_sections with editable label columns
  await sql`ALTER TABLE site_sections ADD COLUMN IF NOT EXISTS section_header TEXT`
  await sql`ALTER TABLE site_sections ADD COLUMN IF NOT EXISTS nav_label TEXT`

  // Seed defaults for existing rows
  await sql`UPDATE site_sections SET section_header = 'Career Highlights', nav_label = 'Highlights' WHERE section_key = 'careerHighlights'`
  await sql`UPDATE site_sections SET section_header = 'Notable Projects', nav_label = 'Projects' WHERE section_key = 'projects'`
  await sql`UPDATE site_sections SET section_header = 'Projects That Delighted…the fun ones', nav_label = 'Fun' WHERE section_key = 'funProjects'`
  await sql`UPDATE site_sections SET section_header = 'Hobbies', nav_label = 'Hobbies' WHERE section_key = 'hobbies'`
  await sql`UPDATE site_sections SET section_header = 'Things I Recommend', nav_label = 'Picks' WHERE section_key = 'recommendations'`
  await sql`UPDATE site_sections SET section_header = 'What I''m Into', nav_label = 'Listening' WHERE section_key = 'entertainment'`
  await sql`UPDATE site_sections SET section_header = 'Get in Touch', nav_label = 'Contact' WHERE section_key = 'contact'`

  // Add rows for always-visible sections (hero, experience, education) — label storage only
  await sql`
    INSERT INTO site_sections (section_key, visible, section_header, nav_label) VALUES
      ('hero',       true, null,         'Intro'),
      ('experience', true, 'Experience', 'Experience'),
      ('education',  true, 'Education',  'Education')
    ON CONFLICT (section_key) DO NOTHING
  `

  // nav_links table for hamburger menu
  await sql`
    CREATE TABLE IF NOT EXISTS nav_links (
      id         SERIAL PRIMARY KEY,
      href       TEXT NOT NULL,
      label      TEXT NOT NULL,
      sort_order INT  DEFAULT 0
    )
  `
  await sql`
    INSERT INTO nav_links (href, label, sort_order) VALUES
      ('/', 'Home', 0),
      ('/hobbies', 'Hobbies', 1),
      ('/recommendations', 'Recommendations', 2),
      ('/entertainment', 'Entertainment', 3)
    ON CONFLICT DO NOTHING
  `

  // site_config table for hero content
  await sql`
    CREATE TABLE IF NOT EXISTS site_config (
      key   TEXT PRIMARY KEY,
      value TEXT NOT NULL
    )
  `
  await sql`
    INSERT INTO site_config (key, value) VALUES
      ('hero_name',     'Andrew Roddini'),
      ('hero_title',    'People & Talent Leadership'),
      ('hero_tagline_1','Building talent functions from zero.'),
      ('hero_tagline_2','Scaling them through hypergrowth.')
    ON CONFLICT (key) DO NOTHING
  `

  // Life Hacks section
  await sql`
    CREATE TABLE IF NOT EXISTS life_hacks (
      id SERIAL PRIMARY KEY,
      name TEXT NOT NULL,
      category TEXT,
      description TEXT,
      link TEXT,
      sort_order INTEGER DEFAULT 0,
      published BOOLEAN DEFAULT true,
      featured_in_carousel BOOLEAN DEFAULT false,
      created_at TIMESTAMPTZ DEFAULT NOW()
    )
  `
  await sql`
    INSERT INTO site_sections (section_key, visible, section_header, nav_label)
    VALUES ('lifeHacks', true, 'Life Hacks', 'Life Hacks')
    ON CONFLICT (section_key) DO NOTHING
  `

  console.log('Migrations complete.')
}

migrate().catch((err) => {
  console.error(err)
  process.exit(1)
})
