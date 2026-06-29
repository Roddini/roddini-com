'use client'

import { useRef, useState, useCallback, useEffect } from 'react'
import { motion } from 'framer-motion'

const MAX_TILT = 50
const LAYERS = 16

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

  const nameRef = useRef<HTMLDivElement>(null)
  const tiltRef = useRef({ x: 0, y: 0 })
  const [tilt, setTilt] = useState({ x: 0, y: 0 })
  const animRef = useRef<number | null>(null)

  const handleMouseMove = useCallback((e: React.MouseEvent<HTMLDivElement>) => {
    const el = nameRef.current
    if (!el) return
    const rect = el.getBoundingClientRect()
    const cx = (e.clientX - rect.left) / rect.width - 0.5
    const cy = (e.clientY - rect.top) / rect.height - 0.5
    const next = { x: -cy * MAX_TILT * 2, y: cx * MAX_TILT * 2 }
    tiltRef.current = next
    setTilt(next)
  }, [])

  const handleMouseEnter = useCallback(() => {
    if (animRef.current) cancelAnimationFrame(animRef.current)
  }, [])

  const handleMouseLeave = useCallback(() => {
    function ease() {
      tiltRef.current = {
        x: tiltRef.current.x * 0.83,
        y: tiltRef.current.y * 0.83,
      }
      const settled = Math.abs(tiltRef.current.x) < 0.05 && Math.abs(tiltRef.current.y) < 0.05
      if (settled) {
        tiltRef.current = { x: 0, y: 0 }
        setTilt({ x: 0, y: 0 })
        return
      }
      setTilt({ ...tiltRef.current })
      animRef.current = requestAnimationFrame(ease)
    }
    if (animRef.current) cancelAnimationFrame(animRef.current)
    animRef.current = requestAnimationFrame(ease)
  }, [])

  // Touch drag — native listeners with passive:false so preventDefault() stops page scroll on iOS
  useEffect(() => {
    const el = nameRef.current
    if (!el) return

    const onTouchStart = () => {
      if (animRef.current) cancelAnimationFrame(animRef.current)
    }

    const onTouchMove = (e: TouchEvent) => {
      e.preventDefault()
      const touch = e.touches[0]
      if (!touch) return
      const rect = el.getBoundingClientRect()
      const cx = (touch.clientX - rect.left) / rect.width - 0.5
      const cy = (touch.clientY - rect.top) / rect.height - 0.5
      const next = { x: -cy * MAX_TILT * 2, y: cx * MAX_TILT * 2 }
      tiltRef.current = next
      setTilt(next)
    }

    const onTouchEnd = () => {
      function ease() {
        tiltRef.current = { x: tiltRef.current.x * 0.83, y: tiltRef.current.y * 0.83 }
        const settled = Math.abs(tiltRef.current.x) < 0.05 && Math.abs(tiltRef.current.y) < 0.05
        if (settled) { tiltRef.current = { x: 0, y: 0 }; setTilt({ x: 0, y: 0 }); return }
        setTilt({ ...tiltRef.current })
        animRef.current = requestAnimationFrame(ease)
      }
      if (animRef.current) cancelAnimationFrame(animRef.current)
      animRef.current = requestAnimationFrame(ease)
    }

    el.addEventListener('touchstart', onTouchStart, { passive: true })
    el.addEventListener('touchmove', onTouchMove, { passive: false })
    el.addEventListener('touchend', onTouchEnd, { passive: true })

    return () => {
      el.removeEventListener('touchstart', onTouchStart)
      el.removeEventListener('touchmove', onTouchMove)
      el.removeEventListener('touchend', onTouchEnd)
    }
  }, [])

  useEffect(() => () => { if (animRef.current) cancelAnimationFrame(animRef.current) }, [])

  // Shadow fades in from zero as tilt increases — flat at rest
  const tiltAmount = Math.min(1, Math.sqrt(tilt.x ** 2 + tilt.y ** 2) / 30)
  const ex = -tilt.y * 0.038   // negative: depth appears on correct side when tilting
  const ey = tilt.x * 0.038

  function buildShadow(r: number, g: number, b: number): string {
    return Array.from({ length: LAYERS }, (_, i) => {
      const n = i + 2  // gap between front face and first depth layer
      const alpha = (0.92 - (i / LAYERS) * 0.65) * tiltAmount
      return `${ex * n}px ${ey * n}px 0 rgba(${r},${g},${b},${alpha})`
    }).join(', ')
  }

  const firstShadow = buildShadow(55, 62, 58)   // mid-tone gray-teal — visible on dark bg, contrasts white
  const lastShadow  = buildShadow(18, 48, 68)   // dark navy — visible on dark bg, contrasts gradient

  return (
    <section
      id="hero"
      className="relative flex flex-col items-center justify-center min-h-screen text-center px-8"
      style={{ zIndex: 1 }}
    >
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

        {/* Outer div positions normally; overlay div extends the hit zone without affecting layout */}
        <div style={{ position: 'relative', display: 'inline-block' }}>
          <div
            ref={nameRef}
            onMouseMove={handleMouseMove}
            onMouseEnter={handleMouseEnter}
            onMouseLeave={handleMouseLeave}
            style={{
              position: 'absolute',
              inset: '-2.5rem -6rem',
              zIndex: 1,
              cursor: 'default',
            }}
          />
          <h1
            className="text-7xl md:text-9xl font-extralight tracking-tight leading-none"
            style={{
              transform: `rotateX(${tilt.x}deg) rotateY(${tilt.y}deg)`,
              transformStyle: 'preserve-3d',
              perspective: '350px',
              willChange: 'transform',
            }}
          >
            <span style={{ color: 'white', textShadow: firstShadow }}>
              {firstName}
            </span>
            {lastName && (
              <>
                <br />
                <span style={{ position: 'relative', display: 'inline-block' }}>
                  {/* Shadow copy — transparent fill so only the offset shadows are visible,
                      avoids the CSS paint-order issue where text-shadow renders on top of
                      background-clip gradient text */}
                  <span
                    aria-hidden
                    style={{
                      position: 'absolute',
                      top: 0,
                      left: 0,
                      color: 'transparent',
                      textShadow: lastShadow,
                      pointerEvents: 'none',
                      userSelect: 'none',
                      whiteSpace: 'nowrap',
                    }}
                  >
                    {lastName}
                  </span>
                  {/* Gradient face — renders on top in DOM order */}
                  <span
                    style={{
                      position: 'relative',
                      background: 'linear-gradient(135deg, #00d4aa 0%, #22d3ee 50%, #38bdf8 100%)',
                      WebkitBackgroundClip: 'text',
                      WebkitTextFillColor: 'transparent',
                      backgroundClip: 'text',
                    }}
                  >
                    {lastName}
                  </span>
                </span>
              </>
            )}
          </h1>
        </div>

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
          style={{ background: 'linear-gradient(to bottom, #00d4aa, transparent)' }}
        />
      </motion.div>
    </section>
  )
}
