'use client'

import type { Experience } from '@/lib/types'
import TimelineEntry from './TimelineEntry'
import SectionHeader from './SectionHeader'

export default function Timeline({ items, sectionHeader = 'Experience' }: { items: Experience[]; sectionHeader?: string }) {
  return (
    <section id="experience" className="relative py-24" style={{ zIndex: 1 }}>
      <div className="max-w-5xl mx-auto px-6">
        <SectionHeader className="mb-20">{sectionHeader}</SectionHeader>

        {/* Timeline wrapper with center line */}
        <div className="relative">
          {/* Vertical center line — hidden on mobile */}
          <div
            className="hidden md:block absolute left-1/2 top-0 bottom-0 w-px -translate-x-1/2"
            style={{
              background:
                'linear-gradient(to bottom, transparent, rgba(0,212,170,0.3) 10%, rgba(34,211,238,0.2) 50%, rgba(56,189,248,0.15) 90%, transparent)',
            }}
          />

          {/* Entries */}
          {items.map((entry, i) => (
            <TimelineEntry key={entry.id} entry={entry} index={i} />
          ))}
        </div>
      </div>
    </section>
  )
}
