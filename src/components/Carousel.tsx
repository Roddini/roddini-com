'use client'

import { useState, useEffect, useRef, useCallback, type ReactNode } from 'react'
import { motion, useMotionValue, useAnimationFrame, useReducedMotion } from 'framer-motion'
import Link from 'next/link'
import SectionHeader from './SectionHeader'

const OFFSET_GAP = 36
const AUTO_INTERVAL = 5000
const DRIFT_SPEED = 0.008

const DEFAULT_BORDER = () => '1px solid rgba(0,212,170,0.12)'

export type CardContext = {
  /** True for the focused (front) card. */
  isCenter: boolean
  /** True while the pointer is hovering the focused card. */
  isHovered: boolean
  /** Position relative to the focused card: -2..2. */
  offset: number
}

/**
 * The scrollable description block shared by every card face: clamps to a few
 * lines, expands to a scroll area when the focused card is hovered, and shows a
 * "···" affordance when there is hidden text.
 */
export function CardDescription({
  text,
  ctx,
  clamp = 'line-clamp-3',
  preLine = true,
}: {
  text: string
  ctx: CardContext
  clamp?: string
  preLine?: boolean
}) {
  const { isCenter, isHovered } = ctx
  return (
    <>
      <div className={`flex-1 ${isHovered ? 'overflow-auto' : 'overflow-hidden'}`}>
        <p
          className={`text-sm leading-relaxed ${preLine ? 'whitespace-pre-line ' : ''}${isHovered ? '' : clamp}`}
          style={{ color: 'rgba(148,163,184,0.75)' }}
        >
          {text}
        </p>
      </div>
      {isCenter && !isHovered && text && text.length > 100 && (
        <p className="text-xs mt-1 shrink-0" style={{ color: 'rgba(0,212,170,0.45)' }}>···</p>
      )}
    </>
  )
}

interface CarouselProps<T> {
  items: T[]
  sectionId: string
  sectionHeader: string
  /** Renders the inner content of a card. The template supplies the card shell. */
  renderCard: (item: T, ctx: CardContext) => ReactNode
  cardWidth?: number
  cardHeight?: number
  trackHeight?: number
  /** Extra classes for the <section> (e.g. custom vertical padding). */
  sectionClassName?: string
  /** Per-item CSS border string for the card shell. */
  cardBorder?: (item: T) => string
  footerLink?: { href: string; label: string }
}

/**
 * Shared carousel template. Every content carousel on the site renders through
 * this so the motion/drag/auto-advance/dot-nav/drift machinery lives in one place.
 * All hooks run unconditionally before the empty-items guard, so an unfilled
 * carousel renders nothing without violating the rules of hooks.
 */
export default function Carousel<T>({
  items,
  sectionId,
  sectionHeader,
  renderCard,
  cardWidth = 300,
  cardHeight = 220,
  trackHeight = 260,
  sectionClassName = 'py-24',
  cardBorder = DEFAULT_BORDER,
  footerLink,
}: CarouselProps<T>) {
  const reduceMotion = useReducedMotion()
  const n = items.length
  const [rawIdx, setRawIdx] = useState(0)
  const [centerHovered, setCenterHovered] = useState(false)
  const autoRef = useRef<ReturnType<typeof setInterval> | null>(null)
  const pausedRef = useRef(false)
  const driftMV = useMotionValue(0)

  const wrap = useCallback((i: number) => (n > 0 ? ((i % n) + n) % n : 0), [n])
  const activeIdx = wrap(rawIdx)

  const next = () => setRawIdx((i) => i + 1)
  const prev = () => setRawIdx((i) => i - 1)

  const startAuto = useCallback(() => {
    if (autoRef.current) clearInterval(autoRef.current)
    if (reduceMotion) return
    autoRef.current = setInterval(() => setRawIdx((i) => i + 1), AUTO_INTERVAL)
  }, [reduceMotion])

  const stopAuto = useCallback(() => {
    if (autoRef.current) {
      clearInterval(autoRef.current)
      autoRef.current = null
    }
  }, [])

  useEffect(() => {
    startAuto()
    return stopAuto
  }, [startAuto, stopAuto])

  // Reset drift on each advance (masked by the spring)
  useEffect(() => {
    driftMV.set(0)
  }, [rawIdx, driftMV])

  // Continuous one-directional left drift (disabled when the user prefers reduced motion)
  useAnimationFrame((_, delta) => {
    if (!pausedRef.current && !reduceMotion) {
      driftMV.set(driftMV.get() - delta * DRIFT_SPEED)
    }
  })

  if (n === 0) return null

  const offsetX = cardWidth + OFFSET_GAP
  const virtualCards = [-2, -1, 0, 1, 2].map((offset) => ({
    virtualIdx: rawIdx + offset,
    offset,
    item: items[wrap(rawIdx + offset)],
  }))

  return (
    <section id={sectionId} className={`relative ${sectionClassName}`} style={{ zIndex: 1 }}>
      <div className="max-w-5xl mx-auto px-6">
        <SectionHeader>{sectionHeader}</SectionHeader>

        <motion.div
          className="relative overflow-hidden select-none"
          style={{ height: trackHeight, cursor: 'grab', touchAction: 'pan-y' }}
          role="region"
          aria-roledescription="carousel"
          aria-label={sectionHeader}
          drag="x"
          dragConstraints={{ left: 0, right: 0 }}
          dragElastic={0.06}
          onMouseEnter={() => { stopAuto(); pausedRef.current = true }}
          onMouseLeave={() => { setCenterHovered(false); startAuto(); pausedRef.current = false }}
          onDragStart={() => { stopAuto(); pausedRef.current = true }}
          onDragEnd={(_, info) => {
            if (info.offset.x < -60 || info.velocity.x < -400) next()
            else if (info.offset.x > 60 || info.velocity.x > 400) prev()
            startAuto()
            pausedRef.current = false
          }}
        >
          <div className="absolute inset-0 pointer-events-none">
            {virtualCards.map(({ virtualIdx, offset, item }) => (
              <motion.div
                key={virtualIdx}
                className="absolute"
                style={{
                  left: '50%',
                  top: '50%',
                  marginLeft: -(cardWidth / 2),
                  marginTop: -(cardHeight / 2),
                  pointerEvents: Math.abs(offset) > 1 ? 'none' : 'auto',
                  cursor: offset !== 0 ? 'pointer' : 'default',
                }}
                animate={{
                  x: offset * offsetX,
                  scale: offset === 0 ? 1 : Math.abs(offset) === 1 ? 0.92 : 0.8,
                  opacity: offset === 0 ? 1 : Math.abs(offset) === 1 ? 0.68 : 0,
                  zIndex: offset === 0 ? 10 : Math.abs(offset) === 1 ? 5 : 0,
                }}
                transition={{ type: 'spring' as const, stiffness: 500, damping: 45 }}
                onMouseEnter={() => { if (offset === 0) setCenterHovered(true) }}
                onMouseLeave={() => { if (offset === 0) setCenterHovered(false) }}
                onClick={() => {
                  if (offset === 1) next()
                  else if (offset === -1) prev()
                }}
              >
                <motion.div
                  className="flex flex-col rounded-xl p-6"
                  style={{
                    x: Math.abs(offset) <= 1 ? driftMV : undefined,
                    width: cardWidth,
                    height: cardHeight,
                    background: 'rgba(6,10,19,0.78)',
                    backdropFilter: 'blur(10px)',
                    border: cardBorder(item),
                  }}
                >
                  {renderCard(item, {
                    offset,
                    isCenter: offset === 0,
                    isHovered: offset === 0 && centerHovered,
                  })}
                </motion.div>
              </motion.div>
            ))}
          </div>

          {/* Edge fades */}
          <div
            className="absolute inset-y-0 left-0 w-16 pointer-events-none z-20"
            style={{ background: 'linear-gradient(to right, #060a13 30%, transparent 100%)' }}
          />
          <div
            className="absolute inset-y-0 right-0 w-16 pointer-events-none z-20"
            style={{ background: 'linear-gradient(to left, #060a13 30%, transparent 100%)' }}
          />
        </motion.div>

        {/* Navigation */}
        <div className="flex flex-col items-center gap-4 mt-6">
          <div className="flex items-center gap-2">
            {items.map((_, i) => (
              <button
                key={i}
                aria-label={`Go to slide ${i + 1}`}
                aria-current={activeIdx === i}
                onClick={() => {
                  const diff = ((i - activeIdx) % n + n) % n
                  setRawIdx((r) => r + (diff <= n / 2 ? diff : diff - n))
                }}
                className="rounded-full transition-all duration-300"
                style={{
                  width: activeIdx === i ? 20 : 6,
                  height: 6,
                  background: activeIdx === i ? '#00d4aa' : 'rgba(0,212,170,0.25)',
                }}
              />
            ))}
          </div>
          <div className="flex gap-3">
            <button
              onClick={prev}
              aria-label="Previous"
              className="w-9 h-9 rounded-full flex items-center justify-center transition-all duration-200 border text-[rgba(0,212,170,0.6)] border-[rgba(0,212,170,0.25)] hover:text-[#00d4aa] hover:border-[rgba(0,212,170,0.6)]"
            >
              ←
            </button>
            <button
              onClick={next}
              aria-label="Next"
              className="w-9 h-9 rounded-full flex items-center justify-center transition-all duration-200 border text-[rgba(0,212,170,0.6)] border-[rgba(0,212,170,0.25)] hover:text-[#00d4aa] hover:border-[rgba(0,212,170,0.6)]"
            >
              →
            </button>
          </div>
          {footerLink && (
            <Link
              href={footerLink.href}
              className="text-[10px] tracking-[0.3em] uppercase transition-colors duration-200 mt-2 text-[rgba(0,212,170,0.45)] hover:text-[#00d4aa]"
            >
              {footerLink.label}
            </Link>
          )}
        </div>
      </div>
    </section>
  )
}
