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

  // All edits below write to the draft_* columns only — nothing reaches the
  // homepage until Publish.
  async function patchDraft(key: string, body: Record<string, unknown>) {
    await fetch('/api/admin/site-sections', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ section_key: key, ...body }),
    })
  }

  async function toggleSection(key: string, val: boolean) {
    setSections((prev) => prev.map((s) => (s.section_key === key ? { ...s, draft_visible: val } : s)))
    await patchDraft(key, { visible: val })
  }

  function scheduleFieldSave(key: string, field: 'section_header' | 'nav_label', value: string) {
    const timerKey = `${key}_${field}`
    if (savingRef.current[timerKey]) clearTimeout(savingRef.current[timerKey])
    savingRef.current[timerKey] = setTimeout(() => {
      patchDraft(key, { [field]: value })
    }, 600)
  }

  function updateField(key: string, field: 'draft_section_header' | 'draft_nav_label', value: string) {
    setSections((prev) => prev.map((s) => (s.section_key === key ? { ...s, [field]: value } : s)))
    scheduleFieldSave(key, field === 'draft_section_header' ? 'section_header' : 'nav_label', value)
  }

  const ordered = sections
    .filter((s) => VISIBILITY_KEYS.includes(s.section_key))
    .sort((a, b) => (a.draft_sort_order ?? 0) - (b.draft_sort_order ?? 0))

  async function move(index: number, dir: -1 | 1) {
    const target = index + dir
    if (target < 0 || target >= ordered.length) return
    const a = ordered[index]
    const b = ordered[target]
    const aOrder = a.draft_sort_order ?? 0
    const bOrder = b.draft_sort_order ?? 0
    setSections((prev) =>
      prev.map((s) => {
        if (s.section_key === a.section_key) return { ...s, draft_sort_order: bOrder }
        if (s.section_key === b.section_key) return { ...s, draft_sort_order: aOrder }
        return s
      })
    )
    await Promise.all([
      patchDraft(a.section_key, { sort_order: bOrder }),
      patchDraft(b.section_key, { sort_order: aOrder }),
    ])
  }

  const dirtyCount = sections.filter(
    (s) =>
      s.draft_visible !== s.visible ||
      (s.draft_section_header ?? null) !== (s.section_header ?? null) ||
      (s.draft_nav_label ?? null) !== (s.nav_label ?? null) ||
      (s.draft_sort_order ?? null) !== (s.sort_order ?? null)
  ).length

  async function publish() {
    const rows = await fetch('/api/admin/site-sections/publish', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action: 'publish' }),
    }).then((r) => r.json())
    setSections(rows)
  }

  async function discard() {
    if (!confirm('Discard all unpublished changes and revert to the live site?')) return
    const rows = await fetch('/api/admin/site-sections/publish', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action: 'discard' }),
    }).then((r) => r.json())
    setSections(rows)
  }

  return (
    <>
      <AdminNav />
      <div className="flex items-center justify-between mb-6 flex-wrap gap-3">
        <h1 className="text-2xl font-semibold">Dashboard</h1>
        <div className="flex items-center gap-3">
          {dirtyCount > 0 && (
            <span className="text-xs text-amber-300/90">{dirtyCount} unpublished change{dirtyCount === 1 ? '' : 's'}</span>
          )}
          <button
            onClick={discard}
            disabled={dirtyCount === 0}
            className="px-3 py-2 rounded bg-white/10 hover:bg-white/20 text-sm transition-colors disabled:opacity-40"
          >
            Discard
          </button>
          <button
            onClick={publish}
            disabled={dirtyCount === 0}
            className="px-4 py-2 rounded bg-emerald-600 hover:bg-emerald-500 text-sm transition-colors disabled:opacity-40"
          >
            Publish
          </button>
        </div>
      </div>

      <section>
        <h2 className="text-lg font-medium text-white/60 mb-1">Homepage Sections</h2>
        <p className="text-xs text-white/40 mb-4">Order, labels, and visibility below are a draft. Nothing changes on the live site until you Publish.</p>
        <div className="flex flex-col gap-3">
          {ordered.map((s, i) => (
            <div key={s.section_key} className="rounded-lg bg-white/5 px-4 py-3 flex flex-col gap-3">
              <div className="flex items-center justify-between gap-3">
                <div className="flex items-center gap-2 min-w-0">
                  <div className="flex flex-col">
                    <button
                      onClick={() => move(i, -1)}
                      disabled={i === 0}
                      aria-label="Move up"
                      className="text-white/40 hover:text-white text-xs leading-none disabled:opacity-20 transition-colors"
                    >
                      ▲
                    </button>
                    <button
                      onClick={() => move(i, 1)}
                      disabled={i === ordered.length - 1}
                      aria-label="Move down"
                      className="text-white/40 hover:text-white text-xs leading-none disabled:opacity-20 transition-colors"
                    >
                      ▼
                    </button>
                  </div>
                  <span className="font-medium truncate">{sectionDisplayNames[s.section_key] ?? s.section_key}</span>
                </div>
                <Toggle checked={!!s.draft_visible} onChange={(val) => toggleSection(s.section_key, val)} />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[10px] tracking-widest uppercase text-white/40 mb-1">Section Header</label>
                  <input
                    className="input w-full"
                    value={s.draft_section_header ?? ''}
                    onChange={(e) => updateField(s.section_key, 'draft_section_header', e.target.value)}
                    placeholder="Section header text"
                  />
                </div>
                <div>
                  <label className="block text-[10px] tracking-widest uppercase text-white/40 mb-1">Nav Label</label>
                  <input
                    className="input w-full"
                    value={s.draft_nav_label ?? ''}
                    onChange={(e) => updateField(s.section_key, 'draft_nav_label', e.target.value)}
                    placeholder="Leave blank to hide from side nav"
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
