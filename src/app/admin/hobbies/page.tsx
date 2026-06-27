'use client'

import { useEffect, useState } from 'react'
import AdminNav from '../components/AdminNav'
import Toggle from '../components/Toggle'

type Hobby = {
  id: number
  name: string
  tagline: string
  description: string
  details: string[]
  link: string
  link_label: string
  promo_code: string
  sort_order: number
  published: boolean
  featured_in_carousel: boolean
}

type HobbyForm = { name: string; tagline: string; description: string; details: string; link: string; link_label: string; promo_code: string; sort_order: number }
const emptyForm: HobbyForm = { name: '', tagline: '', description: '', details: '', link: '', link_label: '', promo_code: '', sort_order: 0 }

export default function HobbiesAdmin() {
  const [items, setItems] = useState<Hobby[]>([])
  const [form, setForm] = useState<HobbyForm>(emptyForm)
  const [editingId, setEditingId] = useState<number | null>(null)
  const [showForm, setShowForm] = useState(false)

  async function load() {
    const data = await fetch('/api/admin/hobbies').then((r) => r.json())
    setItems(data)
  }

  useEffect(() => { load() }, [])

  async function toggle(id: number, field: 'published' | 'featured_in_carousel', val: boolean) {
    setItems((prev) => prev.map((item) => (item.id === id ? { ...item, [field]: val } : item)))
    await fetch(`/api/admin/hobbies/${id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ [field]: val }),
    })
  }

  async function save() {
    const payload = { ...form, details: form.details.split('\n').filter(Boolean) }
    if (editingId !== null) {
      await fetch(`/api/admin/hobbies/${editingId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      })
    } else {
      await fetch('/api/admin/hobbies', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      })
    }
    setForm(emptyForm)
    setEditingId(null)
    setShowForm(false)
    load()
  }

  async function remove(id: number) {
    if (!confirm('Delete this hobby?')) return
    await fetch(`/api/admin/hobbies/${id}`, { method: 'DELETE' })
    load()
  }

  function startEdit(item: Hobby) {
    setForm({ name: item.name, tagline: item.tagline ?? '', description: item.description ?? '', details: (item.details ?? []).join('\n'), link: item.link ?? '', link_label: item.link_label ?? '', promo_code: item.promo_code ?? '', sort_order: item.sort_order })
    setEditingId(item.id)
    setShowForm(true)
  }

  return (
    <>
      <AdminNav />
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-semibold">Hobbies</h1>
        <button onClick={() => { setForm(emptyForm); setEditingId(null); setShowForm(true) }} className="px-4 py-2 rounded bg-white/10 hover:bg-white/20 text-sm transition-colors">
          + Add
        </button>
      </div>

      {showForm && (
        <div className="mb-6 rounded-lg bg-white/5 p-4 flex flex-col gap-3">
          <h2 className="font-medium">{editingId ? 'Edit Hobby' : 'New Hobby'}</h2>
          <input placeholder="Name" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} className="input" />
          <input placeholder="Tagline" value={form.tagline} onChange={(e) => setForm({ ...form, tagline: e.target.value })} className="input" />
          <textarea placeholder="Description" value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} className="input" rows={2} />
          <textarea placeholder="Details (one per line)" value={form.details} onChange={(e) => setForm({ ...form, details: e.target.value })} className="input" rows={3} />
          <input placeholder="Link URL" value={form.link} onChange={(e) => setForm({ ...form, link: e.target.value })} className="input" />
          <input placeholder="Link Label" value={form.link_label} onChange={(e) => setForm({ ...form, link_label: e.target.value })} className="input" />
          <input placeholder="Promo Code" value={form.promo_code} onChange={(e) => setForm({ ...form, promo_code: e.target.value })} className="input" />
<input type="number" placeholder="Sort order" value={form.sort_order} onChange={(e) => setForm({ ...form, sort_order: Number(e.target.value) })} className="input" />
          <div className="flex gap-2">
            <button onClick={save} disabled={!form.name} className="px-4 py-2 rounded bg-emerald-600 hover:bg-emerald-500 text-sm disabled:opacity-50 transition-colors">Save</button>
            <button onClick={() => { setShowForm(false); setEditingId(null) }} className="px-4 py-2 rounded bg-white/10 hover:bg-white/20 text-sm transition-colors">Cancel</button>
          </div>
        </div>
      )}

      <div className="flex flex-col gap-2">
        {items.map((item) => (
          <div key={item.id} className="rounded-lg bg-white/5 px-4 py-3 flex items-center gap-4">
            <div className="flex-1 min-w-0">
              <p className="font-medium truncate">{item.name}</p>
              <p className="text-sm text-white/40">{item.tagline}</p>
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
        {items.length === 0 && <p className="text-white/30 text-sm">No hobbies yet.</p>}
      </div>
    </>
  )
}
