'use client'

import type { FunProject } from '@/lib/types'
import Carousel, { CardDescription } from './Carousel'

export default function FunProjects({ items, sectionHeader = 'Projects That Delighted…the fun ones' }: { items: FunProject[]; sectionHeader?: string }) {
  return (
    <Carousel
      items={items}
      sectionId="fun-projects"
      sectionHeader={sectionHeader}
      cardWidth={300}
      cardHeight={260}
      trackHeight={300}
      renderCard={(project, ctx) => (
        <>
          <span
            className="text-[10px] tracking-widest uppercase font-light shrink-0"
            style={{ color: 'rgba(0,212,170,0.5)' }}
          >
            {project.company}
          </span>
          <h3 className="text-lg font-light text-white mt-2 mb-3 shrink-0">{project.name}</h3>
          <CardDescription text={project.description} ctx={ctx} clamp="line-clamp-4" preLine={false} />
          <div className="flex flex-wrap gap-2 mt-3 shrink-0">
            {project.tags.map((tag) => (
              <span
                key={tag}
                className="text-[10px] tracking-widest uppercase px-2.5 py-1 rounded-full"
                style={{
                  color: '#00d4aa',
                  background: 'rgba(0,212,170,0.08)',
                  border: '1px solid rgba(0,212,170,0.18)',
                }}
              >
                {tag}
              </span>
            ))}
          </div>
        </>
      )}
    />
  )
}
