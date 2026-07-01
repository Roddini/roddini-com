'use client'

import type { Podcast } from '@/lib/types'
import Carousel, { CardDescription } from './Carousel'

const FALLBACK_COLOR = '#00d4aa'

type FrequencyOption = { value: string; label: string; color: string }

export default function EntertainmentPreview({
  items,
  frequencyOptions = [],
  sectionHeader = 'What I\'m Into',
}: {
  items: Podcast[]
  frequencyOptions?: FrequencyOption[]
  sectionHeader?: string
}) {
  const freqMap = Object.fromEntries(frequencyOptions.map((f) => [f.value, f]))
  const getFreqLabel = (v: string) => freqMap[v]?.label ?? v

  return (
    <Carousel
      items={items}
      sectionId="entertainment"
      sectionHeader={sectionHeader}
      cardWidth={300}
      cardHeight={220}
      trackHeight={260}
      footerLink={{ href: '/entertainment', label: 'See everything →' }}
      renderCard={(item, ctx) => (
        <>
          <div className="flex items-center gap-2 mb-3 shrink-0">
            {item.category && (
              <span
                className="text-[9px] tracking-widest uppercase px-2 py-0.5 rounded-full"
                style={{
                  color: FALLBACK_COLOR,
                  background: `${FALLBACK_COLOR}15`,
                  border: `1px solid ${FALLBACK_COLOR}30`,
                }}
              >
                {item.category}
              </span>
            )}
            {item.frequency && (
              <span className="text-[9px] tracking-widest uppercase" style={{ color: 'rgba(100,116,139,0.6)' }}>
                {getFreqLabel(item.frequency)}
              </span>
            )}
          </div>
          <h3 className="text-lg font-light text-white mb-3 shrink-0">{item.name}</h3>
          <CardDescription text={item.description} ctx={ctx} />
        </>
      )}
    />
  )
}
