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
import type { Hobby, Recommendation, Podcast, CareerHighlight, Project, FunProject, LookupValue, SiteSection, LifeHack } from '@/lib/types'

export default async function Home() {
  const [hobbies, recommendations, podcasts, careerHighlights, projects, funProjects, siteSections, recCategories, podFrequencies, siteConfigRows, lifeHacks] = await Promise.all([
    sql`SELECT * FROM hobbies WHERE published = true AND featured_in_carousel = true ORDER BY sort_order ASC` as unknown as Hobby[],
    sql`SELECT * FROM recommendations WHERE published = true AND featured_in_carousel = true ORDER BY sort_order ASC` as unknown as Recommendation[],
    sql`SELECT * FROM podcasts WHERE published = true AND featured_in_carousel = true ORDER BY sort_order ASC` as unknown as Podcast[],
    sql`SELECT * FROM career_highlights WHERE published = true AND featured_in_carousel = true ORDER BY sort_order ASC` as unknown as CareerHighlight[],
    sql`SELECT * FROM projects WHERE published = true AND featured_in_carousel = true ORDER BY sort_order ASC` as unknown as Project[],
    sql`SELECT * FROM fun_projects WHERE published = true AND featured_in_carousel = true ORDER BY sort_order ASC` as unknown as FunProject[],
    sql`SELECT section_key, visible, section_header, nav_label FROM site_sections` as unknown as SiteSection[],
    sql`SELECT value, color FROM lookup_values WHERE type = 'recommendation_category'` as unknown as LookupValue[],
    sql`SELECT value, label, color FROM lookup_values WHERE type = 'podcast_frequency' ORDER BY sort_order ASC` as unknown as LookupValue[],
    sql`SELECT key, value FROM site_config` as unknown as { key: string; value: string }[],
    sql`SELECT * FROM life_hacks WHERE published = true AND featured_in_carousel = true ORDER BY sort_order ASC` as unknown as LifeHack[],
  ])

  const categoryColors = Object.fromEntries(recCategories.map((c) => [c.value, c.color]))
  const siteConfig = Object.fromEntries(siteConfigRows.map((r) => [r.key, r.value]))

  const sections = Object.fromEntries(siteSections.map((s) => [s.section_key, s.visible]))
  const navLabels = Object.fromEntries(
    siteSections
      .filter((s) => s.nav_label)
      .map((s) => [s.section_key, s.nav_label as string])
  )
  const sectionHeaders = Object.fromEntries(
    siteSections
      .filter((s) => s.section_header)
      .map((s) => [s.section_key, s.section_header as string])
  )

  const hiddenSectionIds = [
    (sections.careerHighlights === false || careerHighlights.length === 0) && 'career-highlights',
    sections.experience === false && 'experience',
    sections.education === false && 'education',
    projects.length === 0 && 'projects',
    funProjects.length === 0 && 'fun-projects',
    (sections.hobbies === false || hobbies.length === 0) && 'hobbies',
    (sections.recommendations === false || recommendations.length === 0) && 'recommendations',
    (sections.entertainment === false || podcasts.length === 0) && 'entertainment',
    (sections.lifeHacks === false || lifeHacks.length === 0) && 'life-hacks',
    sections.contact === false && 'contact',
  ].filter(Boolean) as string[]

  const heroTaglines: [string, string] = [
    siteConfig.hero_tagline_1 ?? 'Building talent functions from zero.',
    siteConfig.hero_tagline_2 ?? 'Scaling them through hypergrowth.',
  ]

  return (
    <main className="relative min-h-screen" style={{ background: '#060a13' }}>
      <StarField />
      <SideNav hiddenSectionIds={hiddenSectionIds} navLabels={navLabels} />
      <ChatWidget />

      <div className="relative" style={{ zIndex: 1 }}>
        <Hero
          name={siteConfig.hero_name}
          heroTitle={siteConfig.hero_title}
          taglines={heroTaglines}
        />
        {sections.careerHighlights !== false && careerHighlights.length > 0 && (
          <SectionReveal>
            <CareerHighlights items={careerHighlights} sectionHeader={sectionHeaders.careerHighlights} />
          </SectionReveal>
        )}
        {sections.experience !== false && (
          <Timeline sectionHeader={sectionHeaders.experience} />
        )}
        {sections.projects !== false && projects.length > 0 && (
          <SectionReveal>
            <Projects items={projects} sectionHeader={sectionHeaders.projects} />
          </SectionReveal>
        )}
        {sections.funProjects !== false && funProjects.length > 0 && (
          <SectionReveal>
            <FunProjects items={funProjects} sectionHeader={sectionHeaders.funProjects} />
          </SectionReveal>
        )}
        {sections.education !== false && (
          <SectionReveal>
            <Education sectionHeader={sectionHeaders.education} />
          </SectionReveal>
        )}
        {sections.contact !== false && (
          <SectionReveal>
            <Contact sectionHeader={sectionHeaders.contact} />
          </SectionReveal>
        )}
        {(hobbies.length > 0 || recommendations.length > 0 || podcasts.length > 0) && (
          <ConstellationDog />
        )}
        {sections.hobbies !== false && hobbies.length > 0 && (
          <SectionReveal>
            <HobbiesCarousel items={hobbies} sectionHeader={sectionHeaders.hobbies} />
          </SectionReveal>
        )}
        {sections.recommendations !== false && recommendations.length > 0 && (
          <SectionReveal>
            <RecommendationsCarousel items={recommendations} categoryColors={categoryColors} sectionHeader={sectionHeaders.recommendations} />
          </SectionReveal>
        )}
        {sections.entertainment !== false && podcasts.length > 0 && (
          <SectionReveal>
            <EntertainmentPreview items={podcasts} frequencyOptions={podFrequencies} sectionHeader={sectionHeaders.entertainment} />
          </SectionReveal>
        )}
        {sections.lifeHacks !== false && lifeHacks.length > 0 && (
          <SectionReveal>
            <LifeHacksCarousel items={lifeHacks} sectionHeader={sectionHeaders.lifeHacks} />
          </SectionReveal>
        )}
      </div>
    </main>
  )
}
