'use client'

import { useState, useEffect, useRef } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { motion, AnimatePresence } from 'framer-motion'

const DEFAULT_NAV_LINKS = [
  { href: '/', label: 'Home' },
  { href: '/hobbies', label: 'Hobbies' },
  { href: '/recommendations', label: 'Recommendations' },
  { href: '/entertainment', label: 'Entertainment' },
]

export default function NavMenu({ links }: { links?: { href: string; label: string }[] }) {
  const NAV_LINKS = links && links.length > 0 ? links : DEFAULT_NAV_LINKS
  const [visible, setVisible] = useState(false)
  const [open, setOpen] = useState(false)
  const pathname = usePathname()
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  // Fade in after scroll stops, hide when scrolling — same logic as SideNav
  useEffect(() => {
    const onScroll = () => {
      setVisible(false)
      setOpen(false)
      if (timerRef.current) clearTimeout(timerRef.current)
      timerRef.current = setTimeout(() => setVisible(true), 1200)
    }
    const initialTimer = setTimeout(() => setVisible(true), 1800)
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => {
      window.removeEventListener('scroll', onScroll)
      if (timerRef.current) clearTimeout(timerRef.current)
      clearTimeout(initialTimer)
    }
  }, [])

  if (pathname.startsWith('/studio')) return null

  return (
    <motion.div
      className="fixed top-6 right-6 z-40 flex flex-col items-end"
      initial={{ opacity: 0 }}
      animate={{ opacity: visible ? 1 : 0 }}
      transition={{ duration: 0.7 }}
    >
      {/* Hamburger */}
      <button
        onClick={() => setOpen((o) => !o)}
        className="flex flex-col gap-[5px] p-2"
        aria-label={open ? 'Close navigation' : 'Open navigation'}
      >
        {[0, 1, 2].map((i) => (
          <span
            key={i}
            className="block w-5 h-px transition-colors duration-200"
            style={{ background: open ? '#00d4aa' : 'rgba(0,212,170,0.55)' }}
          />
        ))}
      </button>

      {/* Compact dropdown */}
      <AnimatePresence>
        {open && (
          <motion.nav
            initial={{ opacity: 0, y: -6, scale: 0.97 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -6, scale: 0.97 }}
            transition={{ duration: 0.16, ease: [0.16, 1, 0.3, 1] }}
            className="mt-1 flex flex-col items-end gap-3 px-4 py-3 rounded-xl"
            style={{
              background: 'rgba(6,10,19,0.82)',
              backdropFilter: 'blur(12px)',
              border: '1px solid rgba(0,212,170,0.12)',
            }}
          >
            {NAV_LINKS.map(({ href, label }) => {
              const isActive = pathname === href
              return (
                <Link
                  key={href}
                  href={href}
                  onClick={() => setOpen(false)}
                  className="text-[10px] tracking-[0.28em] uppercase font-light transition-colors duration-200"
                  style={{ color: isActive ? '#00d4aa' : 'rgba(148,163,184,0.7)' }}
                  onMouseEnter={(e) => {
                    if (!isActive) (e.currentTarget as HTMLElement).style.color = '#00d4aa'
                  }}
                  onMouseLeave={(e) => {
                    if (!isActive) (e.currentTarget as HTMLElement).style.color = 'rgba(148,163,184,0.7)'
                  }}
                >
                  {label}
                </Link>
              )
            })}
          </motion.nav>
        )}
      </AnimatePresence>
    </motion.div>
  )
}
