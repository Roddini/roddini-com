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
import { sql } from '@/lib/db'
import type { Hobby, Recommendation, Podcast, CareerHighlight } from '@/lib/types'

export default async function Home() {
  const [hobbies, recommendations, podcasts, careerHighlights, siteSections] = await Promise.all([
    sql`SELECT * FROM hobbies WHERE published = true AND featured_in_carousel = true ORDER BY sort_order ASC` as unknown as Hobby[],
    sql`SELECT * FROM recommendations WHERE published = true AND featured_in_carousel = true ORDER BY sort_order ASC` as unknown as Recommendation[],
    sql`SELECT * FROM podcasts WHERE published = true AND featured_in_carousel = true ORDER BY sort_order ASC` as unknown as Podcast[],
    sql`SELECT * FROM career_highlights WHERE published = true AND featured_in_carousel = true ORDER BY sort_order ASC` as unknown as CareerHighlight[],
    sql`SELECT section_key, visible FROM site_sections` as unknown as { section_key: string; visible: boolean }[],
  ])

  const sections = Object.fromEntries(siteSections.map((s) => [s.section_key, s.visible]))

  const hiddenSectionIds = [
    sections.careerHighlights === false && 'career-highlights',
    sections.hobbies === false && 'hobbies',
    sections.recommendations === false && 'recommendations',
    sections.entertainment === false && 'entertainment',
    sections.contact === false && 'contact',
  ].filter(Boolean) as string[]

  return (
    <main className="relative min-h-screen" style={{ background: '#060a13' }}>
      <StarField />
      <SideNav hiddenSectionIds={hiddenSectionIds} />

      <div className="relative" style={{ zIndex: 1 }}>
        <Hero />
        {sections.careerHighlights !== false && (
          <SectionReveal>
            <CareerHighlights items={careerHighlights} />
          </SectionReveal>
        )}
        <Timeline />
        <SectionReveal>
          <Projects />
        </SectionReveal>
        <SectionReveal>
          <FunProjects />
        </SectionReveal>
        <SectionReveal>
          <Education />
        </SectionReveal>
        {sections.contact !== false && (
          <SectionReveal>
            <Contact />
          </SectionReveal>
        )}
        {sections.hobbies !== false && (
          <SectionReveal>
            <HobbiesCarousel items={hobbies} />
          </SectionReveal>
        )}
        {sections.recommendations !== false && (
          <SectionReveal>
            <RecommendationsCarousel items={recommendations} />
          </SectionReveal>
        )}
        {sections.entertainment !== false && (
          <SectionReveal>
            <EntertainmentPreview items={podcasts} />
          </SectionReveal>
        )}
      </div>
    </main>
  )
}
