'use client'

import { useState, useEffect, useRef, useCallback } from 'react'
import { motion, useMotionValue, useAnimationFrame } from 'framer-motion'
import Link from 'next/link'
import type { Hobby } from '@/lib/types'

const CARD_W = 300
const OFFSET = CARD_W + 36
const AUTO_INTERVAL = 5000
const DRIFT_SPEED = 0.008

export default function HobbiesCarousel({ items }: { items: Hobby[] }) {
  if (!items || items.length === 0) return null
  const n = items.length
  const [rawIdx, setRawIdx] = useState(0)
  const [centerHovered, setCenterHovered] = useState(false)
  const autoRef = useRef<ReturnType<typeof setInterval> | null>(null)
  const pausedRef = useRef(false)
  const driftMV = useMotionValue(0)

  const wrap = (i: number) => ((i % n) + n) % n
  const activeIdx = wrap(rawIdx)

  const next = () => setRawIdx((i) => i + 1)
  const prev = () => setRawIdx((i) => i - 1)

  const startAuto = useCallback(() => {
    if (autoRef.current) clearInterval(autoRef.current)
    autoRef.current = setInterval(() => setRawIdx((i) => i + 1), AUTO_INTERVAL)
  }, [])

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

  useEffect(() => {
    driftMV.set(0)
  }, [rawIdx, driftMV])

  useAnimationFrame((_, delta) => {
    if (!pausedRef.current) {
      driftMV.set(driftMV.get() - delta * DRIFT_SPEED)
    }
  })

  const virtualCards = [-2, -1, 0, 1, 2].map((offset) => ({
    virtualIdx: rawIdx + offset,
    offset,
    item: items[wrap(rawIdx + offset)],
  }))

  return (
    <section id="hobbies" className="relative pt-40 pb-24" style={{ zIndex: 1 }}>
      <div className="max-w-5xl mx-auto px-6">
        <div className="flex items-center gap-4 mb-16">
          <div className="h-px flex-1" style={{ background: 'rgba(0,212,170,0.15)' }} />
          <span
            className="text-[10px] tracking-[0.35em] uppercase font-light"
            style={{ color: 'rgba(0,212,170,0.6)' }}
          >
            Hobbies
          </span>
          <div className="h-px flex-1" style={{ background: 'rgba(0,212,170,0.15)' }} />
        </div>

        <motion.div
          className="relative overflow-hidden select-none"
          style={{ height: 260, cursor: 'grab', touchAction: 'pan-y' }}
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
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
            {virtualCards.map(({ virtualIdx, offset, item }) => (
              <motion.div
                key={virtualIdx}
                className="absolute"
                style={{
                  pointerEvents: Math.abs(offset) > 1 ? 'none' : 'auto',
                  cursor: offset !== 0 ? 'pointer' : 'default',
                }}
                animate={{
                  x: offset * OFFSET,
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
                    width: CARD_W,
                    height: 220,
                    background: 'rgba(6,10,19,0.78)',
                    backdropFilter: 'blur(10px)',
                    border: '1px solid rgba(0,212,170,0.12)',
                  }}
                >
<h3 className="text-xl font-light text-white mb-1 shrink-0">{item.name}</h3>
                  <p className="text-[11px] tracking-widest uppercase mb-3 shrink-0" style={{ color: '#00d4aa', opacity: 0.7 }}>
                    {item.tagline}
                  </p>
                  <div className={`flex-1 ${offset === 0 && centerHovered ? 'overflow-auto' : 'overflow-hidden'}`}>
                    <p
                      className={`text-sm leading-relaxed whitespace-pre-line ${offset === 0 && centerHovered ? '' : 'line-clamp-3'}`}
                      style={{ color: 'rgba(148,163,184,0.75)' }}
                    >
                      {item.description}
                    </p>
                  </div>
                  {offset === 0 && !centerHovered && item.description.length > 100 && (
                    <p className="text-xs mt-1 shrink-0" style={{ color: 'rgba(0,212,170,0.45)' }}>···</p>
                  )}
                  {item.promo_code && (
                    <p className="mt-2 text-[10px] tracking-widest uppercase shrink-0" style={{ color: 'rgba(0,212,170,0.6)' }}>
                      Code: {item.promo_code}
                    </p>
                  )}
                </motion.div>
              </motion.div>
            ))}
          </div>

          <div
            className="absolute inset-y-0 left-0 w-16 pointer-events-none z-20"
            style={{ background: 'linear-gradient(to right, #060a13 30%, transparent 100%)' }}
          />
          <div
            className="absolute inset-y-0 right-0 w-16 pointer-events-none z-20"
            style={{ background: 'linear-gradient(to left, #060a13 30%, transparent 100%)' }}
          />
        </motion.div>

        <div className="flex flex-col items-center gap-4 mt-6">
          <div className="flex items-center gap-2">
            {items.map((_, i) => (
              <button
                key={i}
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
              className="w-9 h-9 rounded-full flex items-center justify-center transition-all duration-200"
              style={{ border: '1px solid rgba(0,212,170,0.25)', color: 'rgba(0,212,170,0.6)' }}
              onMouseEnter={(e) => {
                ;(e.currentTarget as HTMLElement).style.borderColor = 'rgba(0,212,170,0.6)'
                ;(e.currentTarget as HTMLElement).style.color = '#00d4aa'
              }}
              onMouseLeave={(e) => {
                ;(e.currentTarget as HTMLElement).style.borderColor = 'rgba(0,212,170,0.25)'
                ;(e.currentTarget as HTMLElement).style.color = 'rgba(0,212,170,0.6)'
              }}
            >
              ←
            </button>
            <button
              onClick={next}
              className="w-9 h-9 rounded-full flex items-center justify-center transition-all duration-200"
              style={{ border: '1px solid rgba(0,212,170,0.25)', color: 'rgba(0,212,170,0.6)' }}
              onMouseEnter={(e) => {
                ;(e.currentTarget as HTMLElement).style.borderColor = 'rgba(0,212,170,0.6)'
                ;(e.currentTarget as HTMLElement).style.color = '#00d4aa'
              }}
              onMouseLeave={(e) => {
                ;(e.currentTarget as HTMLElement).style.borderColor = 'rgba(0,212,170,0.25)'
                ;(e.currentTarget as HTMLElement).style.color = 'rgba(0,212,170,0.6)'
              }}
            >
              →
            </button>
          </div>
          <Link
            href="/hobbies"
            className="text-[10px] tracking-[0.3em] uppercase transition-colors duration-200 mt-2"
            style={{ color: 'rgba(0,212,170,0.45)' }}
            onMouseEnter={(e) => ((e.currentTarget as HTMLElement).style.color = '#00d4aa')}
            onMouseLeave={(e) => ((e.currentTarget as HTMLElement).style.color = 'rgba(0,212,170,0.45)')}
          >
            See all hobbies →
          </Link>
        </div>
      </div>
    </section>
  )
}
