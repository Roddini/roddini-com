'use client'

import { useEffect, useState } from 'react'
import AdminNav from '../components/AdminNav'
import Toggle from '../components/Toggle'
import type { LifeHack } from '@/lib/types'

type LifeHackForm = { name: string; category: string; description: string; link: string; sort_order: number }
const emptyForm: LifeHackForm = { name: '', category: '', description: '', link: '', sort_order: 0 }

export default function LifeHacksAdmin() {
  const [items, setItems] = useState<LifeHack[]>([])
  const [form, setForm] = useState<LifeHackForm>(emptyForm)
  const [editingId, setEditingId] = useState<number | null>(null)
  const [showForm, setShowForm] = useState(false)

  async function load() {
    const data = await fetch('/api/admin/life-hacks').then((r) => r.json())
    setItems(data)
  }

  useEffect(() => { load() }, [])

  async function toggle(id: number, field: 'published' | 'featured_in_carousel', val: boolean) {
    setItems((prev) => prev.map((p) => (p.id === id ? { ...p, [field]: val } : p)))
    await fetch(`/api/admin/life-hacks/${id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ [field]: val }),
    })
  }

  async function save() {
    if (editingId !== null) {
      await fetch(`/api/admin/life-hacks/${editingId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      })
    } else {
      await fetch('/api/admin/life-hacks', {
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
    if (!confirm('Delete this life hack?')) return
    await fetch(`/api/admin/life-hacks/${id}`, { method: 'DELETE' })
    load()
  }

  function startEdit(item: LifeHack) {
    setForm({ name: item.name, category: item.category, description: item.description, link: item.link ?? '', sort_order: item.sort_order })
    setEditingId(item.id)
    setShowForm(true)
  }

  return (
    <>
      <AdminNav />
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-semibold">Life Hacks</h1>
        {!showForm && (
          <button
            onClick={() => {
              setForm({ ...emptyForm, sort_order: items.length })
              setEditingId(null)
              setShowForm(true)
            }}
            className="px-4 py-2 rounded bg-white/10 hover:bg-white/20 text-sm transition-colors"
          >
            + Add
          </button>
        )}
      </div>

      {showForm && editingId === null && (
        <div className="mb-6 rounded-lg bg-white/5 p-4 flex flex-col gap-3">
          <h2 className="font-medium">New Life Hack</h2>
          <input placeholder="Name" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} className="input" />
          <input placeholder="Category (e.g. Productivity, Health, Tech)" value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value })} className="input" />
          <textarea placeholder="Description" value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} className="input" rows={2} />
          <input placeholder="Link URL (optional)" value={form.link} onChange={(e) => setForm({ ...form, link: e.target.value })} className="input" />
          <label className="flex items-center gap-2 text-sm text-white/50">Position
              <input type="number" min={1} value={form.sort_order + 1} onChange={(e) => setForm({ ...form, sort_order: Math.max(0, Number(e.target.value) - 1) })} className="input w-20" />
              <span className="text-white/30">of {editingId ? items.length : items.length + 1}</span>
            </label>
          <div className="flex gap-2">
            <button onClick={save} disabled={!form.name} className="px-4 py-2 rounded bg-emerald-600 hover:bg-emerald-500 text-sm disabled:opacity-50 transition-colors">Save</button>
            <button onClick={() => { setShowForm(false); setEditingId(null) }} className="px-4 py-2 rounded bg-white/10 hover:bg-white/20 text-sm transition-colors">Cancel</button>
          </div>
        </div>
      )}

      <div className="flex flex-col gap-2">
        {items.map((item) => editingId === item.id ? (
          <div key={item.id} className="rounded-lg bg-white/5 p-4 flex flex-col gap-3">
            <h2 className="font-medium">Edit Life Hack</h2>
            <input placeholder="Name" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} className="input" />
            <input placeholder="Category (e.g. Productivity, Health, Tech)" value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value })} className="input" />
            <textarea placeholder="Description" value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} className="input" rows={2} />
            <input placeholder="Link URL (optional)" value={form.link} onChange={(e) => setForm({ ...form, link: e.target.value })} className="input" />
            <label className="flex items-center gap-2 text-sm text-white/50">Position
              <input type="number" min={1} value={form.sort_order + 1} onChange={(e) => setForm({ ...form, sort_order: Math.max(0, Number(e.target.value) - 1) })} className="input w-20" />
              <span className="text-white/30">of {editingId ? items.length : items.length + 1}</span>
            </label>
            <div className="flex gap-2">
              <button onClick={save} disabled={!form.name} className="px-4 py-2 rounded bg-emerald-600 hover:bg-emerald-500 text-sm disabled:opacity-50 transition-colors">Save</button>
              <button onClick={() => { setShowForm(false); setEditingId(null) }} className="px-4 py-2 rounded bg-white/10 hover:bg-white/20 text-sm transition-colors">Cancel</button>
            </div>
          </div>
        ) : (
          <div key={item.id} className="rounded-lg bg-white/5 px-4 py-3 flex items-center gap-4">
            <div className="flex-1 min-w-0">
              <p className="font-medium truncate">{item.name}</p>
              <p className="text-sm text-white/40 truncate">{item.category}</p>
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
        {items.length === 0 && <p className="text-white/30 text-sm">No life hacks yet.</p>}
      </div>
    </>
  )
}
