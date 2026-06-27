'use client'

import StarField from '@/components/StarField'
import Link from 'next/link'
import { motion } from 'framer-motion'
import type { Podcast } from '@/lib/types'

const FREQUENCY_ORDER = ['always', 'sometimes', 'occasionally']

const FREQUENCY_COLORS: Record<string, string> = {
  always: '#00d4aa',
  sometimes: '#22d3ee',
  occasionally: '#0ea5e9',
}

const FREQUENCY_LABELS: Record<string, string> = {
  always: 'Always On',
  sometimes: 'Sometimes',
  occasionally: 'Occasionally',
}

export default function EntertainmentContent({ podcasts }: { podcasts: Podcast[] }) {
  const podcastsByFrequency = FREQUENCY_ORDER.map((freq) => ({
    freq,
    podcasts: podcasts.filter((p) => p.frequency === freq),
  })).filter(({ podcasts }) => podcasts.length > 0)

  return (
    <main className="relative min-h-screen" style={{ background: '#060a13' }}>
      <StarField />

      <div className="relative py-24 px-6 max-w-3xl mx-auto" style={{ zIndex: 1 }}>
        <Link
          href="/"
          className="inline-flex items-center gap-2 text-[10px] tracking-[0.3em] uppercase mb-16 transition-colors duration-200"
          style={{ color: 'rgba(0,212,170,0.45)' }}
          onMouseEnter={(e) => ((e.currentTarget as HTMLElement).style.color = '#00d4aa')}
          onMouseLeave={(e) => ((e.currentTarget as HTMLElement).style.color = 'rgba(0,212,170,0.45)')}
        >
          ← Back
        </Link>

        <div className="flex items-center gap-4 mb-16">
          <div className="h-px flex-1" style={{ background: 'rgba(0,212,170,0.15)' }} />
          <span
            className="text-[10px] tracking-[0.35em] uppercase font-light"
            style={{ color: 'rgba(0,212,170,0.6)' }}
          >
            What I&apos;m Into
          </span>
          <div className="h-px flex-1" style={{ background: 'rgba(0,212,170,0.15)' }} />
        </div>

        <div className="mb-6">
          <h2 className="text-xl font-light text-white mb-10">Podcasts</h2>

          {podcastsByFrequency.map(({ freq, podcasts }, groupIdx) => {
            const color = FREQUENCY_COLORS[freq]
            return (
              <div key={freq} className={groupIdx > 0 ? 'mt-12' : ''}>
                <div className="flex items-center gap-3 mb-6">
                  <div className="w-2 h-2 rounded-full" style={{ background: color }} />
                  <span className="text-[10px] tracking-[0.3em] uppercase" style={{ color }}>
                    {FREQUENCY_LABELS[freq]}
                  </span>
                  <div className="h-px flex-1" style={{ background: `${color}20` }} />
                </div>

                <div className="flex flex-col gap-3">
                  {podcasts.map((podcast, i) => (
                    <motion.div
                      key={podcast.id}
                      initial={{ opacity: 0, y: 12 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: (groupIdx * 0.1) + (i * 0.06), duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
                      className="rounded-xl p-5 flex items-start gap-4"
                      style={{
                        background: 'rgba(6,10,19,0.78)',
                        backdropFilter: 'blur(10px)',
                        border: '1px solid rgba(0,212,170,0.1)',
                      }}
                    >
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <h3 className="text-base font-light text-white">{podcast.name}</h3>
                          <span
                            className="text-[9px] tracking-widest uppercase px-2 py-0.5 rounded-full"
                            style={{
                              color: 'rgba(100,116,139,0.7)',
                              border: '1px solid rgba(100,116,139,0.2)',
                            }}
                          >
                            {podcast.category}
                          </span>
                        </div>
                        <p className="text-sm leading-relaxed whitespace-pre-line" style={{ color: 'rgba(148,163,184,0.7)' }}>
                          {podcast.description}
                        </p>
                        {podcast.link && (
                          <a
                            href={podcast.link}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="mt-2 inline-block text-[10px] tracking-widest uppercase transition-colors duration-200"
                            style={{ color: `${color}70` }}
                            onMouseEnter={(e) => ((e.currentTarget as HTMLElement).style.color = color)}
                            onMouseLeave={(e) => ((e.currentTarget as HTMLElement).style.color = `${color}70`)}
                          >
                            Listen →
                          </a>
                        )}
                      </div>
                    </motion.div>
                  ))}
                </div>
              </div>
            )
          })}
        </div>
      </div>
    </main>
  )
}
