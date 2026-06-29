'use client'

import { useEffect, useState } from 'react'
import AdminNav from '../components/AdminNav'
import Toggle from '../components/Toggle'

type Podcast = {
  id: number
  name: string
  description: string
  category: string
  frequency: string
  link: string
  sort_order: number
  published: boolean
  featured_in_carousel: boolean
}

type FrequencyOption = { value: string; label: string }
type PodcastForm = { name: string; description: string; category: string; frequency: string; link: string; sort_order: number }
const emptyForm: PodcastForm = { name: '', description: '', category: '', frequency: '', link: '', sort_order: 0 }

export default function PodcastsAdmin() {
  const [podcasts, setPodcasts] = useState<Podcast[]>([])
  const [frequencies, setFrequencies] = useState<FrequencyOption[]>([])
  const [form, setForm] = useState<PodcastForm>(emptyForm)
  const [editingId, setEditingId] = useState<number | null>(null)
  const [showForm, setShowForm] = useState(false)

  async function load() {
    const [data, freqs] = await Promise.all([
      fetch('/api/admin/podcasts').then((r) => r.json()),
      fetch('/api/admin/lookup-values?type=podcast_frequency').then((r) => r.json()),
    ])
    setPodcasts(data)
    setFrequencies(freqs)
    setForm((f) => ({ ...f, frequency: f.frequency || freqs[0]?.value || '' }))
  }

  useEffect(() => { load() }, [])

  async function toggle(id: number, field: 'published' | 'featured_in_carousel', val: boolean) {
    setPodcasts((prev) => prev.map((p) => (p.id === id ? { ...p, [field]: val } : p)))
    await fetch(`/api/admin/podcasts/${id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ [field]: val }),
    })
  }

  async function save() {
    if (editingId !== null) {
      await fetch(`/api/admin/podcasts/${editingId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      })
    } else {
      await fetch('/api/admin/podcasts', {
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
    if (!confirm('Delete this podcast?')) return
    await fetch(`/api/admin/podcasts/${id}`, { method: 'DELETE' })
    load()
  }

  function startEdit(p: Podcast) {
    setForm({ name: p.name, description: p.description, category: p.category, frequency: p.frequency, link: p.link ?? '', sort_order: p.sort_order })
    setEditingId(p.id)
    setShowForm(true)
  }

  return (
    <>
      <AdminNav />
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-semibold">Podcasts</h1>
        <button onClick={() => { setForm(emptyForm); setEditingId(null); setShowForm(true) }} className="px-4 py-2 rounded bg-white/10 hover:bg-white/20 text-sm transition-colors">
          + Add
        </button>
      </div>

      {showForm && editingId === null && (
        <div className="mb-6 rounded-lg bg-white/5 p-4 flex flex-col gap-3">
          <h2 className="font-medium">New Podcast</h2>
          <input placeholder="Name" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} className="input" />
          <textarea placeholder="Description" value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} className="input" rows={2} />
          <input placeholder="Category" value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value })} className="input" />
          <select value={form.frequency} onChange={(e) => setForm({ ...form, frequency: e.target.value })} className="input">
            {frequencies.map((f) => (
              <option key={f.value} value={f.value}>{f.label}</option>
            ))}
          </select>
          <input placeholder="Link URL" value={form.link} onChange={(e) => setForm({ ...form, link: e.target.value })} className="input" />
          <input type="number" placeholder="Sort order" value={form.sort_order} onChange={(e) => setForm({ ...form, sort_order: Number(e.target.value) })} className="input" />
          <div className="flex gap-2">
            <button onClick={save} disabled={!form.name} className="px-4 py-2 rounded bg-emerald-600 hover:bg-emerald-500 text-sm disabled:opacity-50 transition-colors">Save</button>
            <button onClick={() => { setShowForm(false); setEditingId(null) }} className="px-4 py-2 rounded bg-white/10 hover:bg-white/20 text-sm transition-colors">Cancel</button>
          </div>
        </div>
      )}

      <div className="flex flex-col gap-2">
        {podcasts.map((p) => editingId === p.id ? (
          <div key={p.id} className="rounded-lg bg-white/5 p-4 flex flex-col gap-3">
            <h2 className="font-medium">Edit Podcast</h2>
            <input placeholder="Name" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} className="input" />
            <textarea placeholder="Description" value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} className="input" rows={2} />
            <input placeholder="Category" value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value })} className="input" />
            <select value={form.frequency} onChange={(e) => setForm({ ...form, frequency: e.target.value })} className="input">
              {frequencies.map((f) => (
                <option key={f.value} value={f.value}>{f.label}</option>
              ))}
            </select>
            <input placeholder="Link URL" value={form.link} onChange={(e) => setForm({ ...form, link: e.target.value })} className="input" />
            <input type="number" placeholder="Sort order" value={form.sort_order} onChange={(e) => setForm({ ...form, sort_order: Number(e.target.value) })} className="input" />
            <div className="flex gap-2">
              <button onClick={save} disabled={!form.name} className="px-4 py-2 rounded bg-emerald-600 hover:bg-emerald-500 text-sm disabled:opacity-50 transition-colors">Save</button>
              <button onClick={() => { setShowForm(false); setEditingId(null) }} className="px-4 py-2 rounded bg-white/10 hover:bg-white/20 text-sm transition-colors">Cancel</button>
            </div>
          </div>
        ) : (
          <div key={p.id} className="rounded-lg bg-white/5 px-4 py-3 flex items-center gap-4">
            <div className="flex-1 min-w-0">
              <p className="font-medium truncate">{p.name}</p>
              <p className="text-sm text-white/40">{p.category} · {p.frequency}</p>
            </div>
            <div className="flex items-center gap-6 shrink-0">
              <label className="flex flex-col items-center gap-1 text-xs text-white/40">
                Published
                <Toggle checked={p.published} onChange={(val) => toggle(p.id, 'published', val)} />
              </label>
              <label className="flex flex-col items-center gap-1 text-xs text-white/40">
                Carousel
                <Toggle checked={p.featured_in_carousel} onChange={(val) => toggle(p.id, 'featured_in_carousel', val)} />
              </label>
              <button onClick={() => startEdit(p)} className="text-white/40 hover:text-white text-sm transition-colors">Edit</button>
              <button onClick={() => remove(p.id)} className="text-red-400/60 hover:text-red-400 text-sm transition-colors">Delete</button>
            </div>
          </div>
        ))}
        {podcasts.length === 0 && <p className="text-white/30 text-sm">No podcasts yet.</p>}
      </div>
    </>
  )
}
