'use client'

import { useEffect, useState } from 'react'
import AdminNav from '../components/AdminNav'

type Request = {
  id: number
  ip: string
  name: string
  email: string
  company: string | null
  reason: string
  approved: boolean
  created_at: string
  tokens_used: number | null
  session_approved: boolean | null
  token_limit_override: number | null
}

export default function ChatAccessAdmin() {
  const [requests, setRequests] = useState<Request[]>([])
  const [tokenInputs, setTokenInputs] = useState<Record<string, string>>({})
  const [approving, setApproving] = useState<string | null>(null)

  async function load() {
    const data = await fetch('/api/admin/chat').then((r) => r.json())
    setRequests(data)
  }

  useEffect(() => { load() }, [])

  async function approve(ip: string) {
    setApproving(ip)
    const raw = tokenInputs[ip]?.trim()
    const tokenLimit = raw ? parseInt(raw, 10) : null
    await fetch('/api/admin/chat', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ ip, tokenLimit }),
    })
    await load()
    setApproving(null)
  }

  const pending = requests.filter((r) => !r.session_approved)
  const approved = requests.filter((r) => r.session_approved)

  return (
    <>
      <AdminNav />
      <h1 className="text-2xl font-semibold mb-6">Chat Access</h1>

      <section className="mb-10">
        <h2 className="text-lg font-medium text-white/60 mb-4">
          Pending ({pending.length})
        </h2>
        {pending.length === 0 && (
          <p className="text-white/30 text-sm">No pending requests.</p>
        )}
        <div className="flex flex-col gap-3">
          {pending.map((r) => (
            <div key={r.id} className="rounded-lg bg-white/5 px-4 py-4 flex flex-col gap-3">
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1 min-w-0">
                  <p className="font-medium">{r.name}</p>
                  <p className="text-sm text-white/50">{r.email}{r.company ? ` · ${r.company}` : ''}</p>
                  <p className="text-sm text-white/70 mt-1">{r.reason}</p>
                  <p className="text-xs text-white/30 mt-1">
                    {r.tokens_used != null ? `${r.tokens_used.toLocaleString()} tokens used · ` : ''}
                    {new Date(r.created_at).toLocaleDateString()}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <input
                  type="number"
                  placeholder="Token limit (blank = unlimited)"
                  value={tokenInputs[r.ip] ?? ''}
                  onChange={(e) => setTokenInputs((prev) => ({ ...prev, [r.ip]: e.target.value }))}
                  className="input text-sm flex-1"
                />
                <button
                  onClick={() => approve(r.ip)}
                  disabled={approving === r.ip}
                  className="px-4 py-2 rounded bg-emerald-600 hover:bg-emerald-500 text-sm disabled:opacity-50 transition-colors shrink-0"
                >
                  {approving === r.ip ? 'Approving…' : 'Approve'}
                </button>
              </div>
            </div>
          ))}
        </div>
      </section>

      <section>
        <h2 className="text-lg font-medium text-white/60 mb-4">
          Approved ({approved.length})
        </h2>
        <div className="flex flex-col gap-2">
          {approved.map((r) => (
            <div key={r.id} className="rounded-lg bg-white/5 px-4 py-3 flex items-center gap-4">
              <div className="flex-1 min-w-0">
                <p className="font-medium truncate">{r.name}</p>
                <p className="text-sm text-white/40 truncate">{r.email}{r.company ? ` · ${r.company}` : ''}</p>
              </div>
              <div className="text-right shrink-0">
                <p className="text-sm text-white/50">
                  {r.tokens_used != null ? `${r.tokens_used.toLocaleString()} tokens` : '—'}
                </p>
                <p className="text-xs text-white/30">
                  {r.token_limit_override != null
                    ? `limit: ${r.token_limit_override.toLocaleString()}`
                    : 'unlimited'}
                </p>
              </div>
            </div>
          ))}
          {approved.length === 0 && <p className="text-white/30 text-sm">None yet.</p>}
        </div>
      </section>
    </>
  )
}
