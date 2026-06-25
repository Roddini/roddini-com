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
import { client } from '@/sanity/client'
import type { SanityHobby, SanityRecommendation, SanityPodcast, SanityCareerHighlight, SanityConfig } from '@/sanity/types'

export const revalidate = 60

export default async function Home() {
  const [hobbies, recommendations, podcasts, careerHighlights, siteConfig] = await Promise.all([
    client.fetch<SanityHobby[]>(`*[_type == "hobby"] | order(order asc)`),
    client.fetch<SanityRecommendation[]>(`*[_type == "recommendation"] | order(order asc)`),
    client.fetch<SanityPodcast[]>(`*[_type == "podcast"] | order(order asc)`),
    client.fetch<SanityCareerHighlight[]>(`*[_type == "careerHighlight"] | order(order asc)`),
    client.fetch<SanityConfig>(`*[_type == "siteConfig"][0]`),
  ])

  const hiddenSectionIds = [
    siteConfig?.careerHighlights === false && 'career-highlights',
    siteConfig?.hobbies === false && 'hobbies',
    siteConfig?.recommendations === false && 'recommendations',
    siteConfig?.entertainment === false && 'entertainment',
    siteConfig?.contact === false && 'contact',
  ].filter(Boolean) as string[]

  return (
    <main className="relative min-h-screen" style={{ background: '#060a13' }}>
      <StarField />
      <SideNav hiddenSectionIds={hiddenSectionIds} />

      <div className="relative" style={{ zIndex: 1 }}>
        <Hero />
        {siteConfig?.careerHighlights !== false && (
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
        {siteConfig?.contact !== false && (
          <SectionReveal>
            <Contact />
          </SectionReveal>
        )}
        {siteConfig?.hobbies !== false && (
          <SectionReveal>
            <HobbiesCarousel items={hobbies} />
          </SectionReveal>
        )}
        {siteConfig?.recommendations !== false && (
          <SectionReveal>
            <RecommendationsCarousel items={recommendations} />
          </SectionReveal>
        )}
        {siteConfig?.entertainment !== false && (
          <SectionReveal>
            <EntertainmentPreview items={podcasts} />
          </SectionReveal>
        )}
      </div>
    </main>
  )
}
