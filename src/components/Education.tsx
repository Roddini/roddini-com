'use client'

import { motion } from 'framer-motion'
import { RESUME } from '@/data/resume'

export default function Education() {
  const edu = RESUME.education
  const contact = RESUME.contact

  return (
    <section id="education" className="relative py-24 pb-40" style={{ zIndex: 1 }}>
      <div className="max-w-5xl mx-auto px-6">
        {/* Section label */}
        <div className="flex items-center gap-4 mb-16">
          <div className="h-px flex-1" style={{ background: 'rgba(0,212,170,0.15)' }} />
          <span
            className="text-[10px] tracking-[0.35em] uppercase font-light"
            style={{ color: 'rgba(0,212,170,0.6)' }}
          >
            Education
          </span>
          <div className="h-px flex-1" style={{ background: 'rgba(0,212,170,0.15)' }} />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Education card */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
            className="rounded-xl p-7 relative"
            style={{
              background: 'rgba(6,10,19,0.75)',
              backdropFilter: 'blur(10px)',
              border: '1px solid rgba(0,212,170,0.12)',
            }}
          >
            <div
              className="absolute left-0 top-6 bottom-6 w-[2px] rounded-full"
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
              <ul className="mt-4 space-y-1.5">
                {edu.details.map((d) => (
                  <li key={d} className="flex items-start gap-2 text-sm" style={{ color: 'rgba(148,163,184,0.65)' }}>
                    <span className="mt-[6px] w-1 h-1 rounded-full shrink-0 bg-teal-400" />
                    {d}
                  </li>
                ))}
              </ul>
            </div>
          </motion.div>

          {/* Contact card */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8, delay: 0.12, ease: [0.16, 1, 0.3, 1] }}
            className="rounded-xl p-7 relative"
            style={{
              background: 'rgba(6,10,19,0.75)',
              backdropFilter: 'blur(10px)',
              border: '1px solid rgba(0,212,170,0.12)',
            }}
          >
            <p className="text-[10px] tracking-widest uppercase mb-6" style={{ color: 'rgba(0,212,170,0.5)' }}>
              Get in touch
            </p>
            <div className="space-y-4">
              <a
                href={`mailto:${contact.email}`}
                className="flex items-center gap-3 group"
              >
                <span
                  className="text-[10px] tracking-widest uppercase w-16 shrink-0"
                  style={{ color: 'rgba(100,116,139,0.6)' }}
                >
                  Email
                </span>
                <span
                  className="text-sm font-light transition-colors duration-200"
                  style={{ color: 'rgba(203,213,225,0.8)' }}
                  onMouseEnter={(e) => ((e.target as HTMLElement).style.color = '#00d4aa')}
                  onMouseLeave={(e) => ((e.target as HTMLElement).style.color = 'rgba(203,213,225,0.8)')}
                >
                  {contact.email}
                </span>
              </a>
              <a
                href={`https://${contact.linkedin}`}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-3 group"
              >
                <span
                  className="text-[10px] tracking-widest uppercase w-16 shrink-0"
                  style={{ color: 'rgba(100,116,139,0.6)' }}
                >
                  LinkedIn
                </span>
                <span
                  className="text-sm font-light transition-colors duration-200"
                  style={{ color: 'rgba(203,213,225,0.8)' }}
                  onMouseEnter={(e) => ((e.target as HTMLElement).style.color = '#00d4aa')}
                  onMouseLeave={(e) => ((e.target as HTMLElement).style.color = 'rgba(203,213,225,0.8)')}
                >
                  {contact.linkedin}
                </span>
              </a>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  )
}
