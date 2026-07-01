'use client'

import type { Hobby } from '@/lib/types'
import Carousel, { CardDescription } from './Carousel'

export default function HobbiesCarousel({ items, sectionHeader = 'Hobbies' }: { items: Hobby[]; sectionHeader?: string }) {
  return (
    <Carousel
      items={items}
      sectionId="hobbies"
      sectionHeader={sectionHeader}
      sectionClassName="pt-16 pb-24"
      cardWidth={300}
      cardHeight={220}
      trackHeight={260}
      footerLink={{ href: '/hobbies', label: 'See all hobbies →' }}
      renderCard={(item, ctx) => (
        <>
          <h3 className="text-xl font-light text-white mb-1 shrink-0">{item.name}</h3>
          <p className="text-[11px] tracking-widest uppercase mb-3 shrink-0" style={{ color: '#00d4aa', opacity: 0.7 }}>
            {item.tagline}
          </p>
          <CardDescription text={item.description} ctx={ctx} />
          {item.promo_code && (
            <p className="mt-2 text-[10px] tracking-widest uppercase shrink-0" style={{ color: 'rgba(0,212,170,0.6)' }}>
              Code: {item.promo_code}
            </p>
          )}
        </>
      )}
    />
  )
}
