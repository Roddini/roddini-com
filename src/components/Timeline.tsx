'use client'

import { RESUME } from '@/data/resume'
import TimelineEntry from './TimelineEntry'

export default function Timeline() {
  return (
    <section id="experience" className="relative py-24" style={{ zIndex: 1 }}>
      <div className="max-w-5xl mx-auto px-6">
        {/* Section label */}
        <div className="flex items-center gap-4 mb-20">
          <div className="h-px flex-1" style={{ background: 'rgba(0,212,170,0.15)' }} />
          <span
            className="text-[10px] tracking-[0.35em] uppercase font-light"
            style={{ color: 'rgba(0,212,170,0.6)' }}
          >
            Experience
          </span>
          <div className="h-px flex-1" style={{ background: 'rgba(0,212,170,0.15)' }} />
        </div>

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
          {RESUME.experience.map((entry, i) => (
            <TimelineEntry key={entry.id} entry={entry} index={i} />
          ))}
        </div>
      </div>
    </section>
  )
}
