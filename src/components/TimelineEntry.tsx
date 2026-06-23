'use client'

import { useRef, useState } from 'react'
import { motion, AnimatePresence, useScroll, useTransform } from 'framer-motion'
import { Experience } from '@/data/resume'

interface Props {
  entry: Experience
  index: number
}

const PREVIEW_COUNT = 2

export default function TimelineEntry({ entry, index }: Props) {
  const isLeft = index % 2 === 0
  const [hovered, setHovered] = useState(false)
  const [expanded, setExpanded] = useState(false)

  const showExtra = expanded || hovered

  // Per-card scroll-based depth reveal
  const entryRef = useRef<HTMLDivElement>(null)
  const { scrollYProgress } = useScroll({
    target: entryRef,
    offset: ['start end', 'start 0.4'],
  })
  const opacity = useTransform(scrollYProgress, [0, 0.45, 1], [0, 0.35, 1])
  const scale = useTransform(scrollYProgress, [0, 1], [0.8, 1])
  const entryY = useTransform(scrollYProgress, [0, 1], [80, 0])

  const previewBullets = entry.highlights.slice(0, PREVIEW_COUNT)
  const extraBullets = entry.highlights.slice(PREVIEW_COUNT)

  const bulletItem = (bullet: string, i: number) => (
    <li
      key={i}
      className="flex items-start gap-2.5 text-sm leading-relaxed"
      style={{ color: 'rgba(203,213,225,0.8)' }}
    >
      <span className="mt-[5px] w-1 h-1 rounded-full shrink-0" style={{ background: entry.accent }} />
      {bullet}
    </li>
  )

  const card = (
    <motion.div
      className="relative"
      style={{ width: '100%' }}
      onHoverStart={() => setHovered(true)}
      onHoverEnd={() => setHovered(false)}
    >
      <div
        className="rounded-xl p-6 md:p-7 transition-all duration-500"
        style={{
          background: 'rgba(6,10,19,0.78)',
          backdropFilter: 'blur(10px)',
          border: `1px solid rgba(${hexToRgb(entry.accent)},${expanded ? 0.45 : 0.18})`,
          boxShadow: expanded
            ? `0 0 32px rgba(${hexToRgb(entry.accent)},0.1)`
            : `0 0 0 0 rgba(${hexToRgb(entry.accent)},0)`,
          cursor: extraBullets.length > 0 ? 'pointer' : 'default',
        }}
        onClick={() => {
          if (extraBullets.length > 0) setExpanded((v) => !v)
        }}
        onMouseEnter={(e) => {
          if (!expanded) {
            ;(e.currentTarget as HTMLElement).style.border = `1px solid rgba(${hexToRgb(entry.accent)},0.4)`
            ;(e.currentTarget as HTMLElement).style.boxShadow = `0 0 24px rgba(${hexToRgb(entry.accent)},0.08)`
          }
        }}
        onMouseLeave={(e) => {
          if (!expanded) {
            ;(e.currentTarget as HTMLElement).style.border = `1px solid rgba(${hexToRgb(entry.accent)},0.18)`
            ;(e.currentTarget as HTMLElement).style.boxShadow = `0 0 0 0 rgba(${hexToRgb(entry.accent)},0)`
          }
        }}
      >
        {/* Accent left bar */}
        <div
          className="absolute left-0 top-6 bottom-6 w-[2px] rounded-full"
          style={{ background: `linear-gradient(to bottom, ${entry.accent}, transparent)` }}
        />

        {/* Header */}
        <div className="mb-4 pl-1">
          <div className="flex flex-wrap items-baseline gap-x-3 gap-y-1 mb-1">
            <h3
              className="text-xl md:text-2xl font-light tracking-tight"
              style={{ color: entry.accent }}
            >
              {entry.company}
            </h3>
            <span className="text-xs tracking-widest uppercase" style={{ color: 'rgba(100,116,139,0.8)' }}>
              {entry.period}
            </span>
          </div>
          <p className="text-sm font-light text-slate-300 tracking-wide">{entry.role}</p>
          {entry.description && (
            <p className="text-xs mt-2 leading-relaxed" style={{ color: 'rgba(100,116,139,0.7)' }}>
              {entry.description}
            </p>
          )}
        </div>

        {/* Mobile: all bullets always shown */}
        <ul className="md:hidden space-y-2.5 pl-1">
          {entry.highlights.map(bulletItem)}
        </ul>

        {/* Desktop: preview bullets + expand on hover or click */}
        <div className="hidden md:block">
          <ul className="space-y-2.5 pl-1">
            {previewBullets.map(bulletItem)}
          </ul>

          <AnimatePresence>
            {showExtra && extraBullets.length > 0 && (
              <motion.div
                key="extra"
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: 'auto', opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                transition={{
                  height: { duration: 0.44, ease: [0.16, 1, 0.3, 1] as [number, number, number, number] },
                  opacity: { duration: 0.28, ease: 'easeOut' },
                }}
                style={{ overflow: 'hidden' }}
              >
                <ul className="space-y-2.5 pl-1 pt-2.5">
                  {extraBullets.map(bulletItem)}
                </ul>
              </motion.div>
            )}
          </AnimatePresence>

          {extraBullets.length > 0 && (
            <p
              className="text-[10px] tracking-widest uppercase mt-3 pl-1 transition-opacity duration-200"
              style={{
                color: `rgba(${hexToRgb(entry.accent)},0.4)`,
                opacity: showExtra ? 0 : 1,
              }}
            >
              +{extraBullets.length} more · click to expand
            </p>
          )}

          {expanded && (
            <p
              className="text-[10px] tracking-widest uppercase mt-3 pl-1 transition-opacity duration-200"
              style={{ color: `rgba(${hexToRgb(entry.accent)},0.3)` }}
            >
              click to collapse
            </p>
          )}
        </div>

        {/* Tags */}
        <div className="flex flex-wrap gap-2 mt-5 pl-1">
          {entry.tags.map((tag) => (
            <span
              key={tag}
              className="text-[10px] tracking-widest uppercase px-2.5 py-1 rounded-full"
              style={{
                color: entry.accent,
                background: `rgba(${hexToRgb(entry.accent)},0.1)`,
                border: `1px solid rgba(${hexToRgb(entry.accent)},0.2)`,
              }}
            >
              {tag}
            </span>
          ))}
        </div>
      </div>
    </motion.div>
  )

  const yearLabel = (
    <div className={`hidden md:flex flex-col ${isLeft ? 'items-start' : 'items-end'}`}>
      <span
        className="text-2xl font-extralight tabular-nums"
        style={{ color: 'rgba(100,116,139,0.5)' }}
      >
        {entry.year}
      </span>
    </div>
  )

  return (
    <motion.div
      ref={entryRef}
      style={{ opacity, scale, y: entryY }}
      className="relative grid grid-cols-1 md:grid-cols-[1fr_40px_1fr] gap-y-4 md:gap-x-8 items-start mb-16 md:mb-24"
    >
      {/* Left column */}
      <div className={`flex ${isLeft ? 'justify-end' : 'justify-start'}`}>
        {isLeft ? card : yearLabel}
      </div>

      {/* Center — dot on timeline */}
      <div className="hidden md:flex justify-center pt-5">
        <div
          className="w-3 h-3 rounded-full"
          style={{
            background: entry.accent,
            boxShadow: `0 0 14px ${entry.accent}, 0 0 28px rgba(${hexToRgb(entry.accent)},0.4)`,
          }}
        />
      </div>

      {/* Right column */}
      <div className={`flex ${isLeft ? 'justify-start' : 'justify-end'}`}>
        {isLeft ? yearLabel : card}
      </div>
    </motion.div>
  )
}

function hexToRgb(hex: string): string {
  const clean = hex.replace('#', '')
  const r = parseInt(clean.substring(0, 2), 16)
  const g = parseInt(clean.substring(2, 4), 16)
  const b = parseInt(clean.substring(4, 6), 16)
  return `${r},${g},${b}`
}
