'use client'

import type { Recommendation } from '@/lib/types'
import Carousel, { CardDescription } from './Carousel'

const FALLBACK_COLOR = '#00d4aa'

export default function RecommendationsCarousel({
  items,
  categoryColors = {},
  sectionHeader = 'Things I Recommend',
}: {
  items: Recommendation[]
  categoryColors?: Record<string, string>
  sectionHeader?: string
}) {
  return (
    <Carousel
      items={items}
      sectionId="recommendations"
      sectionHeader={sectionHeader}
      cardWidth={300}
      cardHeight={220}
      trackHeight={260}
      footerLink={{ href: '/recommendations', label: 'Browse all picks →' }}
      renderCard={(item, ctx) => {
        const accentColor = categoryColors[item.category] ?? FALLBACK_COLOR
        return (
          <>
            <span
              className="text-[9px] tracking-widest uppercase mb-3 self-start px-2 py-0.5 rounded-full shrink-0"
              style={{
                color: accentColor,
                background: `${accentColor}15`,
                border: `1px solid ${accentColor}30`,
              }}
            >
              {item.category}
            </span>
            <h3 className="text-lg font-light text-white mb-3 shrink-0">{item.name}</h3>
            <CardDescription text={item.description} ctx={ctx} />
            {item.link && (
              <a
                href={item.link}
                target="_blank"
                rel="noopener noreferrer"
                className="mt-2 text-[10px] tracking-widest uppercase transition-colors duration-200 shrink-0"
                style={{ color: `${accentColor}88` }}
                onClick={(e) => e.stopPropagation()}
                onMouseEnter={(e) => ((e.currentTarget as HTMLElement).style.color = accentColor)}
                onMouseLeave={(e) => ((e.currentTarget as HTMLElement).style.color = `${accentColor}88`)}
              >
                View →
              </a>
            )}
          </>
        )
      }}
    />
  )
}
