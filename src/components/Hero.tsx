'use client'

import { motion } from 'framer-motion'

export default function Hero({
  name = 'Andrew Roddini',
  heroTitle = 'People & Talent Leadership',
  taglines = ['Building talent functions from zero.', 'Scaling them through hypergrowth.'],
}: {
  name?: string
  heroTitle?: string
  taglines?: [string, string]
}) {
  const nameParts = name.trim().split(' ')
  const firstName = nameParts.slice(0, -1).join(' ') || name
  const lastName = nameParts.length > 1 ? nameParts[nameParts.length - 1] : ''

  return (
    <section
      id="hero"
      className="relative flex flex-col items-center justify-center min-h-screen text-center px-8"
      style={{ zIndex: 1 }}
    >
      {/* Subtle radial glow behind text */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          background:
            'radial-gradient(ellipse 60% 50% at 50% 50%, rgba(0,212,170,0.05) 0%, transparent 70%)',
        }}
      />

      <motion.div
        initial={{ opacity: 0, y: 32 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 1.4, ease: [0.16, 1, 0.3, 1] }}
        className="relative space-y-6"
      >
        <motion.p
          initial={{ opacity: 0, letterSpacing: '0.5em' }}
          animate={{ opacity: 1, letterSpacing: '0.3em' }}
          transition={{ duration: 1.2, delay: 0.3 }}
          className="text-xs uppercase font-light"
          style={{ color: '#00d4aa' }}
        >
          {heroTitle}
        </motion.p>

        <h1 className="text-7xl md:text-9xl font-extralight tracking-tight text-white leading-none">
          {firstName}
          {lastName && (
            <>
              <br />
              <span
                style={{
                  background: 'linear-gradient(135deg, #00d4aa 0%, #22d3ee 50%, #38bdf8 100%)',
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent',
                  backgroundClip: 'text',
                }}
              >
                {lastName}
              </span>
            </>
          )}
        </h1>

        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 1.2, delay: 0.8 }}
          className="text-base md:text-lg font-light max-w-sm mx-auto leading-relaxed"
          style={{ color: 'rgba(148,163,184,0.85)' }}
        >
          {taglines[0]}
          <br />
          {taglines[1]}
        </motion.p>
      </motion.div>

      {/* Scroll indicator */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 2.2, duration: 1 }}
        className="absolute bottom-10 flex flex-col items-center gap-3"
        style={{ color: 'rgba(100,116,139,0.7)' }}
      >
        <span className="text-[10px] tracking-[0.25em] uppercase">Scroll</span>
        <div
          className="w-px h-14"
          style={{
            background: 'linear-gradient(to bottom, #00d4aa, transparent)',
          }}
        />
      </motion.div>
    </section>
  )
}
