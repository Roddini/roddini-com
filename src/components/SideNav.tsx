'use client'

import { useState, useEffect, useRef } from 'react'
import { motion } from 'framer-motion'

const SECTIONS = [
  { id: 'hero', label: 'Intro' },
  { id: 'career-highlights', label: 'Highlights' },
  { id: 'experience', label: 'Experience' },
  { id: 'projects', label: 'Projects' },
  { id: 'fun-projects', label: 'Fun' },
  { id: 'education', label: 'Education' },
]

export default function SideNav() {
  const [visible, setVisible] = useState(false)
  const [active, setActive] = useState('hero')
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const isScrollingRef = useRef(false)

  // Fade in after scroll stops
  useEffect(() => {
    const onScroll = () => {
      isScrollingRef.current = true
      setVisible(false)
      if (timerRef.current) clearTimeout(timerRef.current)
      timerRef.current = setTimeout(() => {
        isScrollingRef.current = false
        setVisible(true)
      }, 1200)
    }

    // Show on initial load (not scrolled)
    const initialTimer = setTimeout(() => setVisible(true), 1800)

    window.addEventListener('scroll', onScroll, { passive: true })
    return () => {
      window.removeEventListener('scroll', onScroll)
      if (timerRef.current) clearTimeout(timerRef.current)
      clearTimeout(initialTimer)
    }
  }, [])

  // Track active section
  useEffect(() => {
    const observers: IntersectionObserver[] = []

    SECTIONS.forEach(({ id }) => {
      const el = document.getElementById(id)
      if (!el) return
      const observer = new IntersectionObserver(
        ([entry]) => {
          if (entry.isIntersecting) setActive(id)
        },
        { threshold: 0.25, rootMargin: '-10% 0px -60% 0px' }
      )
      observer.observe(el)
      observers.push(observer)
    })

    return () => observers.forEach((o) => o.disconnect())
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
      {SECTIONS.map(({ id, label }) => {
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
