'use client'

import { useEffect, useState, useRef } from 'react'
import AdminNav from './components/AdminNav'
import Toggle from './components/Toggle'
import type { SiteSection } from '@/lib/types'

const VISIBILITY_KEYS = ['projects', 'funProjects', 'careerHighlights', 'experience', 'education', 'hobbies', 'recommendations', 'entertainment', 'lifeHacks', 'contact']

const sectionDisplayNames: Record<string, string> = {
  projects: 'Projects',
  funProjects: 'Fun Projects',
  careerHighlights: 'Career Highlights',
  hobbies: 'Hobbies',
  recommendations: 'Recommendations',
  entertainment: 'Entertainment / Podcasts',
  lifeHacks: 'Life Hacks',
  contact: 'Contact',
  hero: 'Hero',
  experience: 'Experience',
  education: 'Education',
}

export default function AdminDashboard() {
  const [sections, setSections] = useState<SiteSection[]>([])
  const savingRef = useRef<Record<string, ReturnType<typeof setTimeout>>>({})

  useEffect(() => {
    fetch('/api/admin/site-sections').then((r) => r.json()).then(setSections)
  }, [])

  async function toggleSection(key: string, val: boolean) {
    setSections((prev) => prev.map((s) => (s.section_key === key ? { ...s, visible: val } : s)))
    await fetch('/api/admin/site-sections', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ section_key: key, visible: val }),
    })
  }

  function scheduleFieldSave(key: string, field: 'section_header' | 'nav_label', value: string) {
    const timerKey = `${key}_${field}`
    if (savingRef.current[timerKey]) clearTimeout(savingRef.current[timerKey])
    savingRef.current[timerKey] = setTimeout(() => {
      fetch('/api/admin/site-sections', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ section_key: key, [field]: value }),
      })
    }, 600)
  }

  function updateField(key: string, field: 'section_header' | 'nav_label', value: string) {
    setSections((prev) =>
      prev.map((s) => (s.section_key === key ? { ...s, [field]: value } : s))
    )
    scheduleFieldSave(key, field, value)
  }

  const allSections = sections.filter((s) => VISIBILITY_KEYS.includes(s.section_key))

  return (
    <>
      <AdminNav />
      <h1 className="text-2xl font-semibold mb-6">Dashboard</h1>

      <section>
        <h2 className="text-lg font-medium text-white/60 mb-4">Homepage Sections</h2>
        <div className="flex flex-col gap-3">
          {allSections.map((s) => (
            <div key={s.section_key} className="rounded-lg bg-white/5 px-4 py-3 flex flex-col gap-3">
              <div className="flex items-center justify-between">
                <span className="font-medium">{sectionDisplayNames[s.section_key] ?? s.section_key}</span>
                <Toggle checked={s.visible} onChange={(val) => toggleSection(s.section_key, val)} />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[10px] tracking-widest uppercase text-white/40 mb-1">Section Header</label>
                  <input
                    className="input w-full"
                    value={s.section_header ?? ''}
                    onChange={(e) => updateField(s.section_key, 'section_header', e.target.value)}
                    placeholder="Section header text"
                  />
                </div>
                <div>
                  <label className="block text-[10px] tracking-widest uppercase text-white/40 mb-1">Nav Label</label>
                  <input
                    className="input w-full"
                    value={s.nav_label ?? ''}
                    onChange={(e) => updateField(s.section_key, 'nav_label', e.target.value)}
                    placeholder="Side nav label"
                  />
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>
    </>
  )
}
