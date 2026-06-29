'use client'

import { useEffect, useState } from 'react'
import AdminNav from '../components/AdminNav'
import type { NavLink } from '@/lib/types'

const emptyForm = { label: '', href: '', sort_order: 0 }

export default function NavLinksAdminPage() {
  const [items, setItems] = useState<NavLink[]>([])
  const [form, setForm] = useState(emptyForm)
  const [editingId, setEditingId] = useState<number | null>(null)
  const [showForm, setShowForm] = useState(false)

  async function load() {
    const data = await fetch('/api/admin/nav-links').then((r) => r.json())
    setItems(data)
  }

  useEffect(() => { load() }, [])

  async function save() {
    if (editingId !== null) {
      await fetch(`/api/admin/nav-links/${editingId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      })
    } else {
      await fetch('/api/admin/nav-links', {
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
    if (!confirm('Delete this nav link?')) return
    await fetch(`/api/admin/nav-links/${id}`, { method: 'DELETE' })
    load()
  }

  function startEdit(item: NavLink) {
    setForm({ label: item.label, href: item.href, sort_order: item.sort_order })
    setEditingId(item.id)
    setShowForm(true)
  }

  function cancel() {
    setForm(emptyForm)
    setEditingId(null)
    setShowForm(false)
  }

  return (
    <>
      <AdminNav />
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-semibold">Nav Links</h1>
          <p className="text-sm text-white/40 mt-1">Controls the hamburger menu links.</p>
        </div>
        {!showForm && (
          <button
            onClick={() => setShowForm(true)}
            className="px-4 py-2 rounded-lg text-sm font-medium transition-colors"
            style={{ background: 'rgba(0,212,170,0.15)', color: '#00d4aa', border: '1px solid rgba(0,212,170,0.25)' }}
          >
            Add Link
          </button>
        )}
      </div>

      {showForm && (
        <div className="rounded-lg bg-white/5 px-4 py-4 mb-6 flex flex-col gap-3 max-w-lg">
          <h2 className="text-sm font-medium text-white/60">{editingId ? 'Edit Link' : 'New Link'}</h2>
          <div>
            <label className="block text-[10px] tracking-widest uppercase text-white/40 mb-1">Label</label>
            <input
              className="input w-full"
              value={form.label}
              onChange={(e) => setForm((f) => ({ ...f, label: e.target.value }))}
              placeholder="e.g. Home"
            />
          </div>
          <div>
            <label className="block text-[10px] tracking-widest uppercase text-white/40 mb-1">URL / Path</label>
            <input
              className="input w-full"
              value={form.href}
              onChange={(e) => setForm((f) => ({ ...f, href: e.target.value }))}
              placeholder="e.g. /hobbies"
            />
          </div>
          <div>
            <label className="block text-[10px] tracking-widest uppercase text-white/40 mb-1">Sort Order</label>
            <input
              type="number"
              className="input w-24"
              value={form.sort_order}
              onChange={(e) => setForm((f) => ({ ...f, sort_order: Number(e.target.value) }))}
            />
          </div>
          <div className="flex gap-2 pt-1">
            <button
              onClick={save}
              className="px-4 py-2 rounded-lg text-sm font-medium"
              style={{ background: '#00d4aa', color: '#060a13' }}
            >
              Save
            </button>
            <button
              onClick={cancel}
              className="px-4 py-2 rounded-lg text-sm font-medium text-white/50"
              style={{ background: 'rgba(255,255,255,0.05)' }}
            >
              Cancel
            </button>
          </div>
        </div>
      )}

      <div className="flex flex-col gap-2 max-w-lg">
        {items.length === 0 && (
          <p className="text-white/40 text-sm">No nav links yet.</p>
        )}
        {items.map((item) => (
          <div
            key={item.id}
            className="rounded-lg bg-white/5 px-4 py-3 flex items-center justify-between gap-4"
          >
            <div className="flex items-center gap-4 min-w-0">
              <span className="text-[10px] text-white/30 w-4 shrink-0">{item.sort_order}</span>
              <div className="min-w-0">
                <p className="text-sm font-medium truncate">{item.label}</p>
                <p className="text-[11px] text-white/40 truncate">{item.href}</p>
              </div>
            </div>
            <div className="flex gap-2 shrink-0">
              <button
                onClick={() => startEdit(item)}
                className="text-xs px-3 py-1 rounded transition-colors"
                style={{ color: '#00d4aa', background: 'rgba(0,212,170,0.1)' }}
              >
                Edit
              </button>
              <button
                onClick={() => remove(item.id)}
                className="text-xs px-3 py-1 rounded transition-colors text-red-400"
                style={{ background: 'rgba(239,68,68,0.1)' }}
              >
                Delete
              </button>
            </div>
          </div>
        ))}
      </div>
    </>
  )
}
