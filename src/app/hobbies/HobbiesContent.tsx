'use client'

import StarField from '@/components/StarField'
import Link from 'next/link'
import { motion } from 'framer-motion'
import type { SanityHobby } from '@/sanity/types'

export default function HobbiesContent({ hobbies }: { hobbies: SanityHobby[] }) {
  return (
    <main className="relative min-h-screen" style={{ background: '#060a13' }}>
      <StarField />

      <div className="relative py-24 px-6 max-w-3xl mx-auto" style={{ zIndex: 1 }}>
        <Link
          href="/"
          className="inline-flex items-center gap-2 text-[10px] tracking-[0.3em] uppercase mb-16 transition-colors duration-200"
          style={{ color: 'rgba(0,212,170,0.45)' }}
          onMouseEnter={(e) => ((e.currentTarget as HTMLElement).style.color = '#00d4aa')}
          onMouseLeave={(e) => ((e.currentTarget as HTMLElement).style.color = 'rgba(0,212,170,0.45)')}
        >
          ← Back
        </Link>

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

        <div className="flex flex-col gap-8">
          {hobbies.map((hobby, i) => (
            <motion.div
              key={hobby._id}
              initial={{ opacity: 0, y: 24 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.1, duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
              className="rounded-xl p-8"
              style={{
                background: 'rgba(6,10,19,0.78)',
                backdropFilter: 'blur(10px)',
                border: '1px solid rgba(0,212,170,0.12)',
              }}
            >
              {hobby.status === 'placeholder' && (
                <span
                  className="text-[9px] tracking-widest uppercase mb-4 inline-block px-2 py-0.5 rounded-full"
                  style={{
                    color: 'rgba(100,116,139,0.6)',
                    border: '1px solid rgba(100,116,139,0.2)',
                  }}
                >
                  Coming soon
                </span>
              )}

              <h2 className="text-2xl font-light text-white mb-1">{hobby.name}</h2>
              <p className="text-[11px] tracking-widest uppercase mb-5" style={{ color: '#00d4aa', opacity: 0.7 }}>
                {hobby.tagline}
              </p>

              <p className="text-sm leading-relaxed mb-6 whitespace-pre-line" style={{ color: 'rgba(148,163,184,0.8)' }}>
                {hobby.description}
              </p>

              {hobby.details?.length > 0 && (
                <ul className="space-y-2 mb-6">
                  {hobby.details.map((detail) => (
                    <li key={detail} className="flex items-start gap-2 text-sm" style={{ color: 'rgba(148,163,184,0.7)' }}>
                      <span className="mt-[7px] w-1 h-1 rounded-full shrink-0 bg-teal-400" />
                      {detail}
                    </li>
                  ))}
                </ul>
              )}

              {hobby.promoCode && (
                <div
                  className="inline-flex items-center gap-3 px-4 py-2 rounded-full mb-4"
                  style={{
                    background: 'rgba(0,212,170,0.06)',
                    border: '1px solid rgba(0,212,170,0.2)',
                  }}
                >
                  <span className="text-[10px] tracking-widest uppercase" style={{ color: 'rgba(0,212,170,0.6)' }}>
                    Promo code
                  </span>
                  <span className="text-sm font-light tracking-widest" style={{ color: '#00d4aa' }}>
                    {hobby.promoCode}
                  </span>
                </div>
              )}

              {hobby.link && (
                <div>
                  <a
                    href={hobby.link}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-[10px] tracking-[0.25em] uppercase transition-colors duration-200"
                    style={{ color: 'rgba(0,212,170,0.5)' }}
                    onMouseEnter={(e) => ((e.currentTarget as HTMLElement).style.color = '#00d4aa')}
                    onMouseLeave={(e) => ((e.currentTarget as HTMLElement).style.color = 'rgba(0,212,170,0.5)')}
                  >
                    {hobby.linkLabel ?? hobby.link} →
                  </a>
                </div>
              )}
            </motion.div>
          ))}
        </div>
      </div>
    </main>
  )
}
