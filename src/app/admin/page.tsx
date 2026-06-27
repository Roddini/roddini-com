'use client'

import { useEffect, useState } from 'react'
import AdminNav from './components/AdminNav'
import Toggle from './components/Toggle'

type Section = { section_key: string; visible: boolean }

const sectionLabels: Record<string, string> = {
  careerHighlights: 'Career Highlights',
  hobbies: 'Hobbies',
  recommendations: 'Recommendations',
  entertainment: 'Entertainment / Podcasts',
  contact: 'Contact',
}

export default function AdminDashboard() {
  const [sections, setSections] = useState<Section[]>([])

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

  return (
    <>
      <AdminNav />
      <h1 className="text-2xl font-semibold mb-6">Dashboard</h1>

      <section>
        <h2 className="text-lg font-medium text-white/60 mb-4">Homepage Sections</h2>
        <div className="flex flex-col gap-3">
          {sections.map((s) => (
            <div key={s.section_key} className="flex items-center justify-between rounded-lg bg-white/5 px-4 py-3">
              <span>{sectionLabels[s.section_key] ?? s.section_key}</span>
              <Toggle checked={s.visible} onChange={(val) => toggleSection(s.section_key, val)} />
            </div>
          ))}
        </div>
      </section>
    </>
  )
}
