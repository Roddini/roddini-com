'use client'

import { motion } from 'framer-motion'
import { RESUME } from '@/data/resume'
import SectionHeader from './SectionHeader'

export default function Contact({ sectionHeader = 'Get in Touch' }: { sectionHeader?: string }) {
  const contact = RESUME.contact

  return (
    <section id="contact" className="relative py-16 pb-24" style={{ zIndex: 1 }}>
      <div className="max-w-5xl mx-auto px-6">
        <SectionHeader className="mb-10">{sectionHeader}</SectionHeader>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
          className="flex flex-wrap items-center justify-center gap-x-8 gap-y-4"
        >
          <a
            href={`mailto:${contact.email}`}
            className="text-sm font-light transition-colors duration-200"
            style={{ color: 'rgba(203,213,225,0.75)' }}
            onMouseEnter={(e) => ((e.currentTarget as HTMLElement).style.color = '#00d4aa')}
            onMouseLeave={(e) => ((e.currentTarget as HTMLElement).style.color = 'rgba(203,213,225,0.75)')}
          >
            {contact.email}
          </a>

          <span style={{ color: 'rgba(0,212,170,0.25)' }}>·</span>

          <a
            href={`https://${contact.linkedin}`}
            target="_blank"
            rel="noopener noreferrer"
            className="text-sm font-light transition-colors duration-200"
            style={{ color: 'rgba(203,213,225,0.75)' }}
            onMouseEnter={(e) => ((e.currentTarget as HTMLElement).style.color = '#00d4aa')}
            onMouseLeave={(e) => ((e.currentTarget as HTMLElement).style.color = 'rgba(203,213,225,0.75)')}
          >
            {contact.linkedin}
          </a>

          <span style={{ color: 'rgba(0,212,170,0.25)' }}>·</span>

          <a
            href="/api/resume/download"
            download
            className="inline-flex items-center px-4 py-1.5 rounded-full text-[11px] tracking-[0.2em] uppercase font-light transition-all duration-200"
            style={{
              color: 'rgba(0,212,170,0.8)',
              border: '1px solid rgba(0,212,170,0.3)',
            }}
            onMouseEnter={(e) => {
              const el = e.currentTarget as HTMLElement
              el.style.color = '#00d4aa'
              el.style.borderColor = 'rgba(0,212,170,0.7)'
              el.style.background = 'rgba(0,212,170,0.06)'
            }}
            onMouseLeave={(e) => {
              const el = e.currentTarget as HTMLElement
              el.style.color = 'rgba(0,212,170,0.8)'
              el.style.borderColor = 'rgba(0,212,170,0.3)'
              el.style.background = 'transparent'
            }}
          >
            Download Resume
          </a>
        </motion.div>
      </div>
    </section>
  )
}
