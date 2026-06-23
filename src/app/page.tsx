import StarField from '@/components/StarField'
import Hero from '@/components/Hero'
import CareerHighlights from '@/components/CareerHighlights'
import Timeline from '@/components/Timeline'
import Projects from '@/components/Projects'
import FunProjects from '@/components/FunProjects'
import Education from '@/components/Education'
import SideNav from '@/components/SideNav'
import SectionReveal from '@/components/SectionReveal'

export default function Home() {
  return (
    <main className="relative min-h-screen" style={{ background: '#060a13' }}>
      {/* Fixed animated starfield */}
      <StarField />

      {/* Fixed right-side nav */}
      <SideNav />

      {/* Scrollable content — sits above the canvas */}
      <div className="relative" style={{ zIndex: 1 }}>
        <Hero />
        <SectionReveal>
          <CareerHighlights />
        </SectionReveal>
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
      </div>
    </main>
  )
}
