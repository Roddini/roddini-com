'use client'

import type { CareerHighlight } from '@/lib/types'
import { hexToRgb } from '@/lib/color'
import Carousel, { CardDescription } from './Carousel'

export default function CareerHighlights({ items, sectionHeader = 'Career Highlights' }: { items: CareerHighlight[]; sectionHeader?: string }) {
  return (
    <Carousel
      items={items}
      sectionId="career-highlights"
      sectionHeader={sectionHeader}
      cardWidth={320}
      cardHeight={240}
      trackHeight={280}
      cardBorder={(item) => `1px solid rgba(${hexToRgb(item.accent)},0.15)`}
      renderCard={(item, ctx) => (
        <>
          <div className="w-8 h-[2px] rounded-full mb-4 shrink-0" style={{ background: item.accent }} />
          <h3 className="text-lg font-light leading-snug mb-2 shrink-0" style={{ color: item.accent }}>
            {item.headline}
          </h3>
          <span
            className="text-[10px] tracking-widest uppercase font-light mb-3 shrink-0"
            style={{ color: 'rgba(100,116,139,0.7)' }}
          >
            {item.company}
          </span>
          <CardDescription text={item.description} ctx={ctx} />
          {item.link && (
            <a
              href={item.link}
              target="_blank"
              rel="noopener noreferrer"
              className="mt-3 text-[10px] tracking-widest uppercase flex items-center gap-1.5 hover:opacity-100 transition-opacity duration-200 shrink-0"
              style={{ color: `rgba(${hexToRgb(item.accent)},0.55)` }}
              onClick={(e) => e.stopPropagation()}
            >
              Read the article →
            </a>
          )}
        </>
      )}
    />
  )
}
