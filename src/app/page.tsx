import { Fragment, type ReactNode } from 'react'
import StarField from '@/components/StarField'
import Hero from '@/components/Hero'
import CareerHighlights from '@/components/CareerHighlights'
import Timeline from '@/components/Timeline'
import Projects from '@/components/Projects'
import FunProjects from '@/components/FunProjects'
import Education from '@/components/Education'
import SideNav from '@/components/SideNav'
import SectionReveal from '@/components/SectionReveal'
import HobbiesCarousel from '@/components/HobbiesCarousel'
import RecommendationsCarousel from '@/components/RecommendationsCarousel'
import EntertainmentPreview from '@/components/EntertainmentPreview'
import Contact from '@/components/Contact'
import ConstellationDog from '@/components/ConstellationDog'
import ChatWidget from '@/components/ChatWidget'
export const dynamic = 'force-dynamic'

import LifeHacksCarousel from '@/components/LifeHacksCarousel'
import { sql } from '@/lib/db'
import { HERO, CONTENT_SECTIONS, sectionByKey } from '@/lib/sections'
import type { Hobby, Recommendation, Podcast, CareerHighlight, Project, FunProject, LookupValue, SiteSection, LifeHack, Experience } from '@/lib/types'

export default async function Home() {
  const [hobbies, recommendations, podcasts, careerHighlights, projects, funProjects, siteSections, recCategories, podFrequencies, siteConfigRows, lifeHacks, experience] = await Promise.all([
    sql`SELECT * FROM hobbies WHERE published = true AND featured_in_carousel = true ORDER BY sort_order ASC` as unknown as Hobby[],
    sql`SELECT * FROM recommendations WHERE published = true AND featured_in_carousel = true ORDER BY sort_order ASC` as unknown as Recommendation[],
    sql`SELECT * FROM podcasts WHERE published = true AND featured_in_carousel = true ORDER BY sort_order ASC` as unknown as Podcast[],
    sql`SELECT * FROM career_highlights WHERE published = true AND featured_in_carousel = true ORDER BY sort_order ASC` as unknown as CareerHighlight[],
    sql`SELECT * FROM projects WHERE published = true AND featured_in_carousel = true ORDER BY sort_order ASC` as unknown as Project[],
    sql`SELECT * FROM fun_projects WHERE published = true AND featured_in_carousel = true ORDER BY sort_order ASC` as unknown as FunProject[],
    sql`SELECT section_key, visible, section_header, nav_label, sort_order FROM site_sections` as unknown as SiteSection[],
    sql`SELECT value, color FROM lookup_values WHERE type = 'recommendation_category'` as unknown as LookupValue[],
    sql`SELECT value, label, color FROM lookup_values WHERE type = 'podcast_frequency' ORDER BY sort_order ASC` as unknown as LookupValue[],
    sql`SELECT key, value FROM site_config` as unknown as { key: string; value: string }[],
    sql`SELECT * FROM life_hacks WHERE published = true AND featured_in_carousel = true ORDER BY sort_order ASC` as unknown as LifeHack[],
    sql`SELECT * FROM experience WHERE published = true ORDER BY sort_order ASC` as unknown as Experience[],
  ])

  const categoryColors = Object.fromEntries(recCategories.map((c) => [c.value, c.color]))
  const siteConfig = Object.fromEntries(siteConfigRows.map((r) => [r.key, r.value]))

  const sections = Object.fromEntries(siteSections.map((s) => [s.section_key, s.visible]))
  // Raw live nav label per section: null = use default label, '' = blanked (no
  // side-nav dot, section still renders), any string = that label.
  const navLabelRaw = Object.fromEntries(siteSections.map((s) => [s.section_key, s.nav_label]))
  const sectionHeaders = Object.fromEntries(
    siteSections
      .filter((s) => s.section_header)
      .map((s) => [s.section_key, s.section_header as string])
  )
  const liveOrder = Object.fromEntries(siteSections.map((s) => [s.section_key, s.sort_order ?? 0]))

  // Each content section: whether it renders + its node. Order is driven by the
  // live `sort_order` column (editable/publishable from the dashboard).
  const sectionNodes: Record<string, { show: boolean; node: ReactNode }> = {
    careerHighlights: {
      show: sections.careerHighlights !== false && careerHighlights.length > 0,
      node: <SectionReveal><CareerHighlights items={careerHighlights} sectionHeader={sectionHeaders.careerHighlights} /></SectionReveal>,
    },
    experience: {
      show: sections.experience !== false && experience.length > 0,
      node: <Timeline items={experience} sectionHeader={sectionHeaders.experience} />,
    },
    projects: {
      show: sections.projects !== false && projects.length > 0,
      node: <SectionReveal><Projects items={projects} sectionHeader={sectionHeaders.projects} /></SectionReveal>,
    },
    funProjects: {
      show: sections.funProjects !== false && funProjects.length > 0,
      node: <SectionReveal><FunProjects items={funProjects} sectionHeader={sectionHeaders.funProjects} /></SectionReveal>,
    },
    education: {
      show: sections.education !== false,
      node: <SectionReveal><Education sectionHeader={sectionHeaders.education} /></SectionReveal>,
    },
    contact: {
      show: sections.contact !== false,
      node: <SectionReveal><Contact sectionHeader={sectionHeaders.contact} /></SectionReveal>,
    },
    hobbies: {
      show: sections.hobbies !== false && hobbies.length > 0,
      node: <SectionReveal><HobbiesCarousel items={hobbies} sectionHeader={sectionHeaders.hobbies} /></SectionReveal>,
    },
    recommendations: {
      show: sections.recommendations !== false && recommendations.length > 0,
      node: <SectionReveal><RecommendationsCarousel items={recommendations} categoryColors={categoryColors} sectionHeader={sectionHeaders.recommendations} /></SectionReveal>,
    },
    entertainment: {
      show: sections.entertainment !== false && podcasts.length > 0,
      node: <SectionReveal><EntertainmentPreview items={podcasts} frequencyOptions={podFrequencies} sectionHeader={sectionHeaders.entertainment} /></SectionReveal>,
    },
    lifeHacks: {
      show: sections.lifeHacks !== false && lifeHacks.length > 0,
      node: <SectionReveal><LifeHacksCarousel items={lifeHacks} sectionHeader={sectionHeaders.lifeHacks} /></SectionReveal>,
    },
  }

  const orderedKeys = CONTENT_SECTIONS.map((s) => s.key).sort((a, b) => liveOrder[a] - liveOrder[b])

  // SideNav gets every rendered section in order (so active-dot tracking can
  // fall through dot-less sections). Hero is pinned first.
  const navSections = [
    { id: HERO.id, label: HERO.label, showDot: true },
    ...orderedKeys
      .filter((key) => sectionNodes[key].show)
      .map((key) => {
        const raw = navLabelRaw[key]
        return {
          id: sectionByKey[key].id,
          label: raw && raw.length > 0 ? raw : sectionByKey[key].label,
          showDot: raw !== '',
        }
      }),
  ]

  const showConstellation = hobbies.length > 0 || recommendations.length > 0 || podcasts.length > 0

  const heroTaglines: [string, string] = [
    siteConfig.hero_tagline_1 ?? 'Building talent functions from zero.',
    siteConfig.hero_tagline_2 ?? 'Scaling them through hypergrowth.',
  ]

  const personLd = {
    '@context': 'https://schema.org',
    '@type': 'Person',
    name: siteConfig.hero_name ?? 'Andrew Roddini',
    jobTitle: siteConfig.hero_title ?? 'Head of Talent',
    description:
      'People & Talent leader who builds recruiting and HR functions from zero and scales them through hypergrowth.',
    url: 'https://roddini.com',
    sameAs: ['https://www.linkedin.com/in/roddini'],
  }

  return (
    <main className="relative min-h-screen" style={{ background: '#060a13' }}>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(personLd) }}
      />
      <StarField />
      <SideNav sections={navSections} />
      <ChatWidget />

      <div className="relative" style={{ zIndex: 1 }}>
        <Hero
          name={siteConfig.hero_name}
          heroTitle={siteConfig.hero_title}
          taglines={heroTaglines}
        />
        {orderedKeys.map((key) => {
          if (!sectionNodes[key].show) return null
          return (
            <Fragment key={key}>
              {sectionNodes[key].node}
              {/* Goose divides professional (above) from personal (below) — pin it under Contact. */}
              {key === 'contact' && showConstellation && <ConstellationDog />}
            </Fragment>
          )
        })}
        {/* Fallback if Contact is hidden: keep the divider before the personal carousels. */}
        {showConstellation && !sectionNodes.contact.show && <ConstellationDog />}
      </div>
    </main>
  )
}
