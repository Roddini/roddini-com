'use client'

import { useEffect, useState } from 'react'
import AdminNav from '../components/AdminNav'

type LookupValue = {
  id: number
  type: string
  value: string
  label: string
  color: string
  sort_order: number
}

const TABS = [
  { key: 'recommendation_category', label: 'Recommendation Categories' },
  { key: 'podcast_frequency', label: 'Podcast Frequency' },
]

const emptyForm = { value: '', label: '', color: '#00d4aa', sort_order: 0 }

export default function CategoriesAdmin() {
  const [activeTab, setActiveTab] = useState('recommendation_category')
  const [items, setItems] = useState<LookupValue[]>([])
  const [form, setForm] = useState(emptyForm)
  const [editingId, setEditingId] = useState<number | null>(null)
  const [showForm, setShowForm] = useState(false)

  async function load(type = activeTab) {
    const data = await fetch(`/api/admin/lookup-values?type=${type}`).then((r) => r.json())
    setItems(data)
  }

  useEffect(() => { load(activeTab) }, [activeTab])

  async function save() {
    if (editingId !== null) {
      await fetch(`/api/admin/lookup-values/${editingId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      })
    } else {
      await fetch('/api/admin/lookup-values', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...form, type: activeTab }),
      })
    }
    setForm(emptyForm)
    setEditingId(null)
    setShowForm(false)
    load()
  }

  async function remove(id: number) {
    if (!confirm('Delete this category?')) return
    await fetch(`/api/admin/lookup-values/${id}`, { method: 'DELETE' })
    load()
  }

  function startEdit(item: LookupValue) {
    setForm({ value: item.value, label: item.label, color: item.color, sort_order: item.sort_order })
    setEditingId(item.id)
    setShowForm(true)
  }

  return (
    <>
      <AdminNav />
      <h1 className="text-2xl font-semibold mb-4">Categories</h1>
      <div className="flex gap-2 mb-6">
        {TABS.map((tab) => (
          <button
            key={tab.key}
            onClick={() => { setActiveTab(tab.key); setShowForm(false); setEditingId(null) }}
            className="px-4 py-1.5 rounded-full text-sm transition-colors"
            style={{
              background: activeTab === tab.key ? 'rgba(0,212,170,0.15)' : 'rgba(255,255,255,0.06)',
              color: activeTab === tab.key ? '#00d4aa' : 'rgba(255,255,255,0.5)',
              border: activeTab === tab.key ? '1px solid rgba(0,212,170,0.3)' : '1px solid transparent',
            }}
          >
            {tab.label}
          </button>
        ))}
      </div>
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-lg font-medium text-white/70">{TABS.find((t) => t.key === activeTab)?.label}</h2>
        <button
          onClick={() => { setForm(emptyForm); setEditingId(null); setShowForm(true) }}
          className="px-4 py-2 rounded bg-white/10 hover:bg-white/20 text-sm transition-colors"
        >
          + Add
        </button>
      </div>

      {showForm && (
        <div className="mb-6 rounded-lg bg-white/5 p-4 flex flex-col gap-3">
          <h2 className="font-medium">{editingId ? 'Edit Category' : 'New Category'}</h2>
          <div className="flex gap-3">
            <div className="flex-1">
              <label className="text-xs text-white/40 mb-1 block">Label (shown in UI)</label>
              <input
                placeholder="e.g. Books"
                value={form.label}
                onChange={(e) => setForm({ ...form, label: e.target.value })}
                className="input"
              />
            </div>
            <div className="flex-1">
              <label className="text-xs text-white/40 mb-1 block">Value (stored in DB)</label>
              <input
                placeholder="e.g. books"
                value={form.value}
                onChange={(e) => setForm({ ...form, value: e.target.value.toLowerCase().replace(/\s+/g, '-') })}
                className="input"
                disabled={editingId !== null}
              />
            </div>
          </div>
          <div className="flex gap-3">
            <div>
              <label className="text-xs text-white/40 mb-1 block">Color</label>
              <div className="flex items-center gap-2">
                <input
                  type="color"
                  value={form.color}
                  onChange={(e) => setForm({ ...form, color: e.target.value })}
                  className="w-10 h-10 rounded cursor-pointer bg-transparent border-0"
                />
                <input
                  placeholder="#00d4aa"
                  value={form.color}
                  onChange={(e) => setForm({ ...form, color: e.target.value })}
                  className="input w-32"
                />
              </div>
            </div>
            <div>
              <label className="text-xs text-white/40 mb-1 block">Sort order</label>
              <input
                type="number"
                value={form.sort_order}
                onChange={(e) => setForm({ ...form, sort_order: Number(e.target.value) })}
                className="input w-24"
              />
            </div>
          </div>
          <div className="flex gap-2">
            <button
              onClick={save}
              disabled={!form.label || !form.value}
              className="px-4 py-2 rounded bg-emerald-600 hover:bg-emerald-500 text-sm disabled:opacity-50 transition-colors"
            >
              Save
            </button>
            <button
              onClick={() => { setShowForm(false); setEditingId(null) }}
              className="px-4 py-2 rounded bg-white/10 hover:bg-white/20 text-sm transition-colors"
            >
              Cancel
            </button>
          </div>
        </div>
      )}

      <div className="flex flex-col gap-2">
        {items.map((item) => (
          <div key={item.id} className="rounded-lg bg-white/5 px-4 py-3 flex items-center gap-4">
            <div
              className="w-3 h-3 rounded-full shrink-0"
              style={{ background: item.color, boxShadow: `0 0 6px ${item.color}80` }}
            />
            <div className="flex-1 min-w-0">
              <p className="font-medium">{item.label}</p>
              <p className="text-xs text-white/30">{item.value}</p>
            </div>
            <span className="text-xs font-mono text-white/30">{item.color}</span>
            <button onClick={() => startEdit(item)} className="text-white/40 hover:text-white text-sm transition-colors">Edit</button>
            <button onClick={() => remove(item.id)} className="text-red-400/60 hover:text-red-400 text-sm transition-colors">Delete</button>
          </div>
        ))}
        {items.length === 0 && <p className="text-white/30 text-sm">No categories yet.</p>}
      </div>
    </>
  )
}
