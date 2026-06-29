'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { useScrollVisibility } from '@/hooks/useScrollVisibility'

const SECTIONS = [
  { id: 'hero', label: 'Intro' },
  { id: 'career-highlights', label: 'Highlights' },
  { id: 'experience', label: 'Experience' },
  { id: 'projects', label: 'Projects' },
  { id: 'fun-projects', label: 'Fun' },
  { id: 'education', label: 'Education' },
  { id: 'contact', label: 'Contact' },
  { id: 'hobbies', label: 'Hobbies' },
  { id: 'recommendations', label: 'Picks' },
  { id: 'entertainment', label: 'Listening' },
]

export default function SideNav({ hiddenSectionIds = [] }: { hiddenSectionIds?: string[] }) {
  const sections = SECTIONS.filter((s) => !hiddenSectionIds.includes(s.id))
  const visible = useScrollVisibility()
  const [active, setActive] = useState('hero')

  // Track active section via scroll position
  useEffect(() => {
    const sectionEls = sections
      .map(({ id }) => ({ id, el: document.getElementById(id) }))
      .filter((x): x is { id: string; el: HTMLElement } => x.el !== null)

    const update = () => {
      const vh = window.innerHeight
      const zoneTop = vh * 0.1
      const zoneBottom = vh * 0.7
      let bestId = sectionEls[0]?.id ?? 'hero'
      let bestOverlap = -Infinity

      for (const { id, el } of sectionEls) {
        const rect = el.getBoundingClientRect()
        const overlap = Math.min(rect.bottom, zoneBottom) - Math.max(rect.top, zoneTop)
        if (overlap > bestOverlap) {
          bestOverlap = overlap
          bestId = id
        }
      }

      setActive(bestId)
    }

    update()
    window.addEventListener('scroll', update, { passive: true })
    return () => window.removeEventListener('scroll', update)
  }, [])

  const scrollTo = (id: string) => {
    document.getElementById(id)?.scrollIntoView({ behavior: 'smooth' })
  }

  return (
    <motion.nav
      initial={{ opacity: 0 }}
      animate={{ opacity: visible ? 1 : 0 }}
      transition={{ duration: 0.7 }}
      className="fixed right-6 top-1/2 -translate-y-1/2 z-50 hidden md:flex flex-col items-end gap-5"
      aria-label="Page navigation"
    >
      {sections.map(({ id, label }) => {
        const isActive = active === id
        return (
          <button
            key={id}
            onClick={() => scrollTo(id)}
            className="flex items-center gap-2.5 group"
            aria-label={`Go to ${label}`}
          >
            <span
              className="text-[10px] tracking-[0.25em] uppercase font-light transition-all duration-300"
              style={{
                color: isActive ? '#00d4aa' : 'rgba(100,116,139,0.6)',
              }}
            >
              {label}
            </span>
            <div
              className="rounded-full transition-all duration-300"
              style={{
                width: isActive ? '7px' : '5px',
                height: isActive ? '7px' : '5px',
                background: isActive ? '#00d4aa' : 'rgba(100,116,139,0.4)',
                boxShadow: isActive ? '0 0 8px rgba(0,212,170,0.7)' : 'none',
              }}
            />
          </button>
        )
      })}
    </motion.nav>
  )
}
