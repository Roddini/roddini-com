'use client'

import { useEffect, useState } from 'react'
import AdminNav from '../components/AdminNav'
import type { ChatConversationSummary, ChatConversation, ChatMessage } from '@/lib/types'

type Detail = { conversation: ChatConversation; messages: ChatMessage[] }

function shortId(id: string | null) {
  return id ? id.slice(0, 8) : '—'
}

function geoLabel(c: { city: string | null; country: string | null }) {
  return [c.city, c.country].filter(Boolean).join(', ') || 'Unknown location'
}

export default function ConversationsAdmin() {
  const [list, setList] = useState<ChatConversationSummary[]>([])
  const [q, setQ] = useState('')
  const [from, setFrom] = useState('')
  const [to, setTo] = useState('')
  const [selectedId, setSelectedId] = useState<string | null>(null)
  const [detail, setDetail] = useState<Detail | null>(null)
  const [loadingDetail, setLoadingDetail] = useState(false)

  // Explicit args (no state defaults) so filter handlers fetch with their new value
  // before state settles, and the mount effect stays non-reactive.
  async function load(nq: string, nfrom: string, nto: string) {
    const params = new URLSearchParams()
    if (nq.trim()) params.set('q', nq.trim())
    if (nfrom) params.set('from', nfrom)
    if (nto) params.set('to', nto)
    const data = await fetch(`/api/admin/conversations?${params}`).then((r) => r.json())
    setList(data)
  }

  useEffect(() => { load('', '', '') }, [])

  async function openConversation(id: string) {
    setSelectedId(id)
    setLoadingDetail(true)
    const data = await fetch(`/api/admin/conversations/${id}`).then((r) => r.json())
    setDetail(data)
    setLoadingDetail(false)
  }

  async function remove(id: string) {
    if (!confirm('Delete this conversation and all its messages?')) return
    await fetch(`/api/admin/conversations/${id}`, { method: 'DELETE' })
    if (selectedId === id) { setSelectedId(null); setDetail(null) }
    await load(q, from, to)
  }

  return (
    <>
      <AdminNav />
      <h1 className="text-2xl font-semibold mb-6">Conversations</h1>

      {/* Filter bar */}
      <div className="flex flex-wrap items-end gap-3 mb-6">
        <div className="flex-1 min-w-[180px]">
          <label className="block text-[10px] tracking-widest uppercase text-white/40 mb-1">Search messages</label>
          <input
            value={q}
            onChange={(e) => { setQ(e.target.value); load(e.target.value, from, to) }}
            placeholder="keyword…"
            className="input w-full"
          />
        </div>
        <div>
          <label className="block text-[10px] tracking-widest uppercase text-white/40 mb-1">From</label>
          <input
            type="date"
            value={from}
            onChange={(e) => { setFrom(e.target.value); load(q, e.target.value, to) }}
            className="input"
          />
        </div>
        <div>
          <label className="block text-[10px] tracking-widest uppercase text-white/40 mb-1">To</label>
          <input
            type="date"
            value={to}
            onChange={(e) => { setTo(e.target.value); load(q, from, e.target.value) }}
            className="input"
          />
        </div>
        {(q || from || to) && (
          <button
            onClick={() => { setQ(''); setFrom(''); setTo(''); load('', '', '') }}
            className="px-4 py-2 rounded-lg text-sm font-medium text-white/50"
            style={{ background: 'rgba(255,255,255,0.05)' }}
          >
            Clear
          </button>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-[340px_1fr] gap-6">
        {/* Master list */}
        <div className="flex flex-col gap-2">
          {list.length === 0 && <p className="text-white/30 text-sm">No conversations yet.</p>}
          {list.map((c) => (
            <button
              key={c.id}
              onClick={() => openConversation(c.id)}
              className={`text-left rounded-lg px-4 py-3 transition-colors ${
                selectedId === c.id ? 'bg-white/10' : 'bg-white/5 hover:bg-white/[0.07]'
              }`}
            >
              <div className="flex items-center justify-between gap-2">
                <span className="font-medium text-sm">{geoLabel(c)}</span>
                <span className="text-xs text-white/30">{new Date(c.updated_at).toLocaleDateString()}</span>
              </div>
              <p className="text-xs text-white/40 mt-1">
                visitor {shortId(c.visitor_id)} · {c.message_count} msgs · {c.tokens_used.toLocaleString()} tokens
              </p>
              {c.request_name && (
                <span
                  className="inline-block mt-2 text-[10px] px-2 py-0.5 rounded-full"
                  style={{ background: 'rgba(0,212,170,0.12)', color: '#00d4aa', border: '1px solid rgba(0,212,170,0.25)' }}
                >
                  access request · {c.request_name}
                </span>
              )}
            </button>
          ))}
        </div>

        {/* Detail / transcript */}
        <div className="rounded-lg bg-white/5 px-4 py-4 min-h-[300px]">
          {!detail && !loadingDetail && (
            <p className="text-white/30 text-sm">Select a conversation to view the transcript.</p>
          )}
          {loadingDetail && <p className="text-white/30 text-sm">Loading…</p>}
          {detail && !loadingDetail && (
            <>
              <div className="flex items-start justify-between gap-4 mb-4 pb-3 border-b border-white/10">
                <div className="min-w-0">
                  <p className="font-medium">{geoLabel(detail.conversation)}</p>
                  <p className="text-xs text-white/40 mt-1">
                    visitor {shortId(detail.conversation.visitor_id)} · IP {detail.conversation.ip ?? '—'}
                  </p>
                  <p className="text-xs text-white/30 mt-1">
                    {new Date(detail.conversation.started_at).toLocaleString()} ·{' '}
                    {detail.conversation.tokens_used.toLocaleString()} tokens
                  </p>
                </div>
                <button
                  onClick={() => remove(detail.conversation.id)}
                  className="text-xs px-3 py-1 rounded transition-colors text-red-400 shrink-0"
                  style={{ background: 'rgba(239,68,68,0.1)' }}
                >
                  Delete
                </button>
              </div>
              <div className="flex flex-col gap-3">
                {detail.messages.map((m) => (
                  <div key={m.id} className={`flex ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                    <div
                      className="rounded-xl px-3 py-2 text-sm leading-relaxed max-w-[85%] whitespace-pre-wrap"
                      style={
                        m.role === 'user'
                          ? { background: 'rgba(0,212,170,0.12)', border: '1px solid rgba(0,212,170,0.2)' }
                          : { background: 'rgba(0,40,50,0.5)', border: '1px solid rgba(0,212,170,0.15)' }
                      }
                    >
                      {m.content}
                    </div>
                  </div>
                ))}
                {detail.messages.length === 0 && (
                  <p className="text-white/30 text-sm">No messages recorded.</p>
                )}
              </div>
            </>
          )}
        </div>
      </div>
    </>
  )
}
