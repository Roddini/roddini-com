'use client'

import { useState } from 'react'
import StarField from '@/components/StarField'
import Link from 'next/link'
import { motion } from 'framer-motion'
import type { Recommendation } from '@/lib/types'

const CATEGORY_COLORS: Record<string, string> = {
  tech: '#22d3ee',
  food: '#f59e0b',
  costco: '#0ea5e9',
  entertainment: '#a78bfa',
  general: '#00d4aa',
}

const CATEGORIES = [
  { value: 'all', label: 'All' },
  { value: 'tech', label: 'Tech' },
  { value: 'food', label: 'Food' },
  { value: 'costco', label: 'Costco' },
  { value: 'entertainment', label: 'Entertainment' },
  { value: 'general', label: 'General' },
]

export default function RecommendationsContent({ recommendations }: { recommendations: Recommendation[] }) {
  const [activeCategory, setActiveCategory] = useState('all')

  const filtered = activeCategory === 'all'
    ? recommendations
    : recommendations.filter((r) => r.category === activeCategory)

  return (
    <main className="relative min-h-screen" style={{ background: '#060a13' }}>
      <StarField />

      <div className="relative py-24 px-6 max-w-4xl mx-auto" style={{ zIndex: 1 }}>
        <Link
          href="/"
          className="inline-flex items-center gap-2 text-[10px] tracking-[0.3em] uppercase mb-16 transition-colors duration-200"
          style={{ color: 'rgba(0,212,170,0.45)' }}
          onMouseEnter={(e) => ((e.currentTarget as HTMLElement).style.color = '#00d4aa')}
          onMouseLeave={(e) => ((e.currentTarget as HTMLElement).style.color = 'rgba(0,212,170,0.45)')}
        >
          ← Back
        </Link>

        <div className="flex items-center gap-4 mb-8">
          <div className="h-px flex-1" style={{ background: 'rgba(0,212,170,0.15)' }} />
          <span
            className="text-[10px] tracking-[0.35em] uppercase font-light"
            style={{ color: 'rgba(0,212,170,0.6)' }}
          >
            Things I Recommend
          </span>
          <div className="h-px flex-1" style={{ background: 'rgba(0,212,170,0.15)' }} />
        </div>

        <p className="text-center text-sm font-light mb-12 max-w-xl mx-auto" style={{ color: 'rgba(148,163,184,0.65)' }}>
          I genuinely enjoy sharing things I love with people — good products, great deals, things worth watching.
          Here&apos;s my running list.
        </p>

        <div className="flex flex-wrap justify-center gap-2 mb-12">
          {CATEGORIES.map(({ value, label }) => {
            const isActive = activeCategory === value
            const color = value === 'all' ? '#00d4aa' : (CATEGORY_COLORS[value] ?? '#00d4aa')
            return (
              <button
                key={value}
                onClick={() => setActiveCategory(value)}
                className="px-3 py-1 rounded-full text-[10px] tracking-widest uppercase transition-all duration-200"
                style={{
                  color: isActive ? color : 'rgba(100,116,139,0.7)',
                  background: isActive ? `${color}15` : 'transparent',
                  border: `1px solid ${isActive ? `${color}50` : 'rgba(100,116,139,0.2)'}`,
                }}
              >
                {label}
              </button>
            )
          })}
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {filtered.map((rec, i) => {
            const accentColor = CATEGORY_COLORS[rec.category] ?? '#00d4aa'
            return (
              <motion.div
                key={rec.id}
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.05, duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
                className="rounded-xl p-5 flex flex-col"
                style={{
                  background: 'rgba(6,10,19,0.78)',
                  backdropFilter: 'blur(10px)',
                  border: '1px solid rgba(0,212,170,0.1)',
                }}
              >
                <span
                  className="text-[9px] tracking-widest uppercase mb-2 self-start px-2 py-0.5 rounded-full"
                  style={{
                    color: accentColor,
                    background: `${accentColor}15`,
                    border: `1px solid ${accentColor}30`,
                  }}
                >
                  {rec.category}
                </span>
                <h3 className="text-base font-light text-white mb-2">{rec.name}</h3>
                <p className="text-sm leading-relaxed flex-1 whitespace-pre-line" style={{ color: 'rgba(148,163,184,0.7)' }}>
                  {rec.description}
                </p>
                {rec.link && (
                  <a
                    href={rec.link}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="mt-3 text-[10px] tracking-widest uppercase transition-colors duration-200 self-start"
                    style={{ color: `${accentColor}70` }}
                    onMouseEnter={(e) => ((e.currentTarget as HTMLElement).style.color = accentColor)}
                    onMouseLeave={(e) => ((e.currentTarget as HTMLElement).style.color = `${accentColor}70`)}
                  >
                    View →
                  </a>
                )}
              </motion.div>
            )
          })}
        </div>
      </div>
    </main>
  )
}
