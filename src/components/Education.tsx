'use client'

import { motion } from 'framer-motion'
import { RESUME } from '@/data/resume'
import SectionHeader from './SectionHeader'

export default function Education({ sectionHeader = 'Education' }: { sectionHeader?: string }) {
  const edu = RESUME.education

  return (
    <section id="education" className="relative py-20 pb-20" style={{ zIndex: 1 }}>
      <div className="max-w-5xl mx-auto px-6">
        <SectionHeader className="mb-10">{sectionHeader}</SectionHeader>

        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
          className="rounded-xl p-5 relative max-w-xl mx-auto"
          style={{
            background: 'rgba(6,10,19,0.75)',
            backdropFilter: 'blur(10px)',
            border: '1px solid rgba(0,212,170,0.12)',
          }}
        >
          <div
            className="absolute left-0 top-5 bottom-5 w-[2px] rounded-full"
            style={{ background: 'linear-gradient(to bottom, #00d4aa, transparent)' }}
          />
          <div className="pl-1">
            <p className="text-[10px] tracking-widest uppercase mb-2" style={{ color: 'rgba(0,212,170,0.5)' }}>
              Education
            </p>
            <h3 className="text-xl font-light text-white mb-1">{edu.degree}</h3>
            <p className="text-sm" style={{ color: '#00d4aa' }}>
              {edu.minor}
            </p>
            <p className="text-sm mt-1" style={{ color: 'rgba(148,163,184,0.7)' }}>
              {edu.school} — {edu.location}
            </p>
            <ul className="mt-3 space-y-1.5">
              {edu.details.map((d) => (
                <li key={d} className="flex items-start gap-2 text-sm" style={{ color: 'rgba(148,163,184,0.65)' }}>
                  <span className="mt-[6px] w-1 h-1 rounded-full shrink-0 bg-teal-400" />
                  {d}
                </li>
              ))}
            </ul>
          </div>
        </motion.div>
      </div>
    </section>
  )
}
