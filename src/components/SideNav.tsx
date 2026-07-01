'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { useScrollVisibility } from '@/hooks/useScrollVisibility'

// A section that exists on the page. `showDot: false` means the section is
// rendered (and participates in scroll tracking) but has no SideNav dot — used
// when its nav label is explicitly blanked. `sections` is already ordered to
// match the homepage.
export type NavSection = { id: string; label: string; showDot: boolean }

export default function SideNav({ sections = [] }: { sections?: NavSection[] }) {
  const visible = useScrollVisibility()
  const [active, setActive] = useState('hero')

  // Track active section via scroll position. We compute the best-overlapping
  // section across ALL on-page sections (including dot-less ones), then, if the
  // winner has no dot, walk backward to the nearest preceding section that does
  // — so a blanked-label section keeps the dot above it lit until you scroll
  // past both.
  useEffect(() => {
    const sectionEls = sections
      .map((s) => ({ ...s, el: document.getElementById(s.id) }))
      .filter((x): x is NavSection & { el: HTMLElement } => x.el !== null)

    const update = () => {
      const vh = window.innerHeight
      const zoneTop = vh * 0.1
      const zoneBottom = vh * 0.7
      let bestIdx = 0
      let bestOverlap = -Infinity

      sectionEls.forEach((s, i) => {
        const rect = s.el.getBoundingClientRect()
        const overlap = Math.min(rect.bottom, zoneBottom) - Math.max(rect.top, zoneTop)
        if (overlap > bestOverlap) {
          bestOverlap = overlap
          bestIdx = i
        }
      })

      // Fall back to the nearest preceding section that has a dot.
      let idx = bestIdx
      while (idx > 0 && !sectionEls[idx]?.showDot) idx--
      setActive(sectionEls[idx]?.id ?? 'hero')
    }

    update()
    window.addEventListener('scroll', update, { passive: true })
    return () => window.removeEventListener('scroll', update)
  }, [sections])

  const scrollTo = (id: string) => {
    document.getElementById(id)?.scrollIntoView({ behavior: 'smooth' })
  }

  const dots = sections.filter((s) => s.showDot)

  return (
    <motion.nav
      initial={{ opacity: 0 }}
      animate={{ opacity: visible ? 1 : 0 }}
      transition={{ duration: 0.7 }}
      className="fixed right-6 top-1/2 -translate-y-1/2 z-50 hidden md:flex flex-col items-end gap-5"
      aria-label="Page navigation"
    >
      {dots.map(({ id, label }) => {
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
