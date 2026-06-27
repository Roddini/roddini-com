'use client'

import { useEffect, useState } from 'react'
import AdminNav from '../components/AdminNav'
import Toggle from '../components/Toggle'

type CareerHighlight = {
  id: number
  headline: string
  company: string
  period: string
  description: string
  accent: string
  link: string
  sort_order: number
  published: boolean
  featured_in_carousel: boolean
}

const emptyForm = { headline: '', company: '', period: '', description: '', accent: '#ffffff', link: '', sort_order: 0 }

export default function CareerHighlightsAdmin() {
  const [items, setItems] = useState<CareerHighlight[]>([])
  const [form, setForm] = useState(emptyForm)
  const [editingId, setEditingId] = useState<number | null>(null)
  const [showForm, setShowForm] = useState(false)

  async function load() {
    const data = await fetch('/api/admin/career-highlights').then((r) => r.json())
    setItems(data)
  }

  useEffect(() => { load() }, [])

  async function toggle(id: number, field: 'published' | 'featured_in_carousel', val: boolean) {
    setItems((prev) => prev.map((item) => (item.id === id ? { ...item, [field]: val } : item)))
    await fetch(`/api/admin/career-highlights/${id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ [field]: val }),
    })
  }

  async function save() {
    if (editingId !== null) {
      await fetch(`/api/admin/career-highlights/${editingId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      })
    } else {
      await fetch('/api/admin/career-highlights', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      })
    }
    setForm(emptyForm)
    setEditingId(null)
    setShowForm(false)
    load()
  }

  async function remove(id: number) {
    if (!confirm('Delete this career highlight?')) return
    await fetch(`/api/admin/career-highlights/${id}`, { method: 'DELETE' })
    load()
  }

  function startEdit(item: CareerHighlight) {
    setForm({ headline: item.headline, company: item.company ?? '', period: item.period ?? '', description: item.description ?? '', accent: item.accent ?? '#ffffff', link: item.link ?? '', sort_order: item.sort_order })
    setEditingId(item.id)
    setShowForm(true)
  }

  return (
    <>
      <AdminNav />
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-semibold">Career Highlights</h1>
        <button onClick={() => { setForm(emptyForm); setEditingId(null); setShowForm(true) }} className="px-4 py-2 rounded bg-white/10 hover:bg-white/20 text-sm transition-colors">
          + Add
        </button>
      </div>

      {showForm && (
        <div className="mb-6 rounded-lg bg-white/5 p-4 flex flex-col gap-3">
          <h2 className="font-medium">{editingId ? 'Edit Career Highlight' : 'New Career Highlight'}</h2>
          <input placeholder="Headline" value={form.headline} onChange={(e) => setForm({ ...form, headline: e.target.value })} className="input" />
          <input placeholder="Company" value={form.company} onChange={(e) => setForm({ ...form, company: e.target.value })} className="input" />
          <input placeholder="Period (e.g. 2020–2023)" value={form.period} onChange={(e) => setForm({ ...form, period: e.target.value })} className="input" />
          <textarea placeholder="Description" value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} className="input" rows={2} />
          <div className="flex items-center gap-3">
            <label className="text-sm text-white/60">Accent color</label>
            <input type="color" value={form.accent} onChange={(e) => setForm({ ...form, accent: e.target.value })} className="h-8 w-16 rounded cursor-pointer bg-transparent" />
            <span className="text-sm text-white/40">{form.accent}</span>
          </div>
          <input placeholder="Link URL" value={form.link} onChange={(e) => setForm({ ...form, link: e.target.value })} className="input" />
          <input type="number" placeholder="Sort order" value={form.sort_order} onChange={(e) => setForm({ ...form, sort_order: Number(e.target.value) })} className="input" />
          <div className="flex gap-2">
            <button onClick={save} disabled={!form.headline} className="px-4 py-2 rounded bg-emerald-600 hover:bg-emerald-500 text-sm disabled:opacity-50 transition-colors">Save</button>
            <button onClick={() => { setShowForm(false); setEditingId(null) }} className="px-4 py-2 rounded bg-white/10 hover:bg-white/20 text-sm transition-colors">Cancel</button>
          </div>
        </div>
      )}

      <div className="flex flex-col gap-2">
        {items.map((item) => (
          <div key={item.id} className="rounded-lg bg-white/5 px-4 py-3 flex items-center gap-4">
            <div className="w-3 h-3 rounded-full shrink-0" style={{ background: item.accent }} />
            <div className="flex-1 min-w-0">
              <p className="font-medium truncate">{item.headline}</p>
              <p className="text-sm text-white/40">{item.company} · {item.period}</p>
            </div>
            <div className="flex items-center gap-6 shrink-0">
              <label className="flex flex-col items-center gap-1 text-xs text-white/40">
                Published
                <Toggle checked={item.published} onChange={(val) => toggle(item.id, 'published', val)} />
              </label>
              <label className="flex flex-col items-center gap-1 text-xs text-white/40">
                Carousel
                <Toggle checked={item.featured_in_carousel} onChange={(val) => toggle(item.id, 'featured_in_carousel', val)} />
              </label>
              <button onClick={() => startEdit(item)} className="text-white/40 hover:text-white text-sm transition-colors">Edit</button>
              <button onClick={() => remove(item.id)} className="text-red-400/60 hover:text-red-400 text-sm transition-colors">Delete</button>
            </div>
          </div>
        ))}
        {items.length === 0 && <p className="text-white/30 text-sm">No career highlights yet.</p>}
      </div>
    </>
  )
}
