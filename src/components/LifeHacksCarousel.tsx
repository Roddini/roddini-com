'use client'

import type { LifeHack } from '@/lib/types'
import Carousel, { CardDescription } from './Carousel'

export default function LifeHacksCarousel({
  items,
  sectionHeader = 'Life Hacks',
}: {
  items: LifeHack[]
  sectionHeader?: string
}) {
  return (
    <Carousel
      items={items}
      sectionId="life-hacks"
      sectionHeader={sectionHeader}
      cardWidth={300}
      cardHeight={220}
      trackHeight={260}
      renderCard={(item, ctx) => (
        <>
          {item.category && (
            <span
              className="text-[9px] tracking-widest uppercase mb-3 self-start px-2 py-0.5 rounded-full shrink-0"
              style={{
                color: '#00d4aa',
                background: 'rgba(0,212,170,0.08)',
                border: '1px solid rgba(0,212,170,0.2)',
              }}
            >
              {item.category}
            </span>
          )}
          <h3 className="text-lg font-light text-white mb-3 shrink-0">{item.name}</h3>
          <CardDescription text={item.description} ctx={ctx} />
          {item.link && (
            <a
              href={item.link}
              target="_blank"
              rel="noopener noreferrer"
              className="mt-2 text-[10px] tracking-widest uppercase transition-colors duration-200 shrink-0"
              style={{ color: 'rgba(0,212,170,0.55)' }}
              onClick={(e) => e.stopPropagation()}
              onMouseEnter={(e) => ((e.currentTarget as HTMLElement).style.color = '#00d4aa')}
              onMouseLeave={(e) => ((e.currentTarget as HTMLElement).style.color = 'rgba(0,212,170,0.55)')}
            >
              Learn more →
            </a>
          )}
        </>
      )}
    />
  )
}
