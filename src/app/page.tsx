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
export const dynamic = 'force-dynamic'

import { sql } from '@/lib/db'
import type { Hobby, Recommendation, Podcast, CareerHighlight, Project, FunProject, LookupValue } from '@/lib/types'

export default async function Home() {
  const [hobbies, recommendations, podcasts, careerHighlights, projects, funProjects, siteSections, recCategories, podFrequencies] = await Promise.all([
    sql`SELECT * FROM hobbies WHERE published = true AND featured_in_carousel = true ORDER BY sort_order ASC` as unknown as Hobby[],
    sql`SELECT * FROM recommendations WHERE published = true AND featured_in_carousel = true ORDER BY sort_order ASC` as unknown as Recommendation[],
    sql`SELECT * FROM podcasts WHERE published = true AND featured_in_carousel = true ORDER BY sort_order ASC` as unknown as Podcast[],
    sql`SELECT * FROM career_highlights WHERE published = true AND featured_in_carousel = true ORDER BY sort_order ASC` as unknown as CareerHighlight[],
    sql`SELECT * FROM projects WHERE published = true AND featured_in_carousel = true ORDER BY sort_order ASC` as unknown as Project[],
    sql`SELECT * FROM fun_projects WHERE published = true AND featured_in_carousel = true ORDER BY sort_order ASC` as unknown as FunProject[],
    sql`SELECT section_key, visible FROM site_sections` as unknown as { section_key: string; visible: boolean }[],
    sql`SELECT value, color FROM lookup_values WHERE type = 'recommendation_category'` as unknown as LookupValue[],
    sql`SELECT value, label, color FROM lookup_values WHERE type = 'podcast_frequency' ORDER BY sort_order ASC` as unknown as LookupValue[],
  ])

  const categoryColors = Object.fromEntries(recCategories.map((c) => [c.value, c.color]))

  const sections = Object.fromEntries(siteSections.map((s) => [s.section_key, s.visible]))

  const hiddenSectionIds = [
    (sections.careerHighlights === false || careerHighlights.length === 0) && 'career-highlights',
    projects.length === 0 && 'projects',
    funProjects.length === 0 && 'fun-projects',
    (sections.hobbies === false || hobbies.length === 0) && 'hobbies',
    (sections.recommendations === false || recommendations.length === 0) && 'recommendations',
    (sections.entertainment === false || podcasts.length === 0) && 'entertainment',
    sections.contact === false && 'contact',
  ].filter(Boolean) as string[]

  return (
    <main className="relative min-h-screen" style={{ background: '#060a13' }}>
      <StarField />
      <SideNav hiddenSectionIds={hiddenSectionIds} />

      <div className="relative" style={{ zIndex: 1 }}>
        <Hero />
        {sections.careerHighlights !== false && careerHighlights.length > 0 && (
          <SectionReveal>
            <CareerHighlights items={careerHighlights} />
          </SectionReveal>
        )}
        <Timeline />
        {sections.projects !== false && projects.length > 0 && (
          <SectionReveal>
            <Projects items={projects} />
          </SectionReveal>
        )}
        {sections.funProjects !== false && funProjects.length > 0 && (
          <SectionReveal>
            <FunProjects items={funProjects} />
          </SectionReveal>
        )}
        <SectionReveal>
          <Education />
        </SectionReveal>
        {sections.contact !== false && (
          <SectionReveal>
            <Contact />
          </SectionReveal>
        )}
        {(hobbies.length > 0 || recommendations.length > 0 || podcasts.length > 0) && (
          <ConstellationDog />
        )}
        {sections.hobbies !== false && hobbies.length > 0 && (
          <SectionReveal>
            <HobbiesCarousel items={hobbies} />
          </SectionReveal>
        )}
        {sections.recommendations !== false && recommendations.length > 0 && (
          <SectionReveal>
            <RecommendationsCarousel items={recommendations} categoryColors={categoryColors} />
          </SectionReveal>
        )}
        {sections.entertainment !== false && podcasts.length > 0 && (
          <SectionReveal>
            <EntertainmentPreview items={podcasts} frequencyOptions={podFrequencies} />
          </SectionReveal>
        )}
      </div>
    </main>
  )
}
