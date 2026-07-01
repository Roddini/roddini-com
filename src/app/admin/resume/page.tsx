'use client'

import { useEffect, useState } from 'react'
import AdminNav from '../components/AdminNav'
import Toggle from '../components/Toggle'
import type { Experience } from '@/lib/types'

// Editable form of an entry: highlights/tags are edited as free text and
// converted to arrays on publish so typing (blank lines, trailing commas) is natural.
type Entry = {
  role: string
  company: string
  period: string
  year: string
  description: string
  highlightsText: string
  tagsText: string
  accent: string
  published: boolean
}

const ACCENTS = ['#22d3ee', '#0ea5e9', '#38bdf8', '#818cf8', '#00d4aa']

function blankEntry(i = 0): Entry {
  return { role: '', company: '', period: '', year: '', description: '', highlightsText: '', tagsText: '', accent: ACCENTS[i % ACCENTS.length], published: true }
}

// From DB rows → editable entries
function fromExperience(rows: Experience[]): Entry[] {
  return rows.map((r, i) => ({
    role: r.role ?? '',
    company: r.company ?? '',
    period: r.period ?? '',
    year: r.year ?? '',
    description: r.description ?? '',
    highlightsText: (r.highlights ?? []).join('\n'),
    tagsText: (r.tags ?? []).join(', '),
    accent: r.accent || ACCENTS[i % ACCENTS.length],
    published: r.published ?? true,
  }))
}

// From parsed model output → editable entries (assigns a rotating accent)
type ParsedItem = { role?: string; company?: string; period?: string; year?: string; description?: string; highlights?: string[]; tags?: string[] }
function fromParsed(items: ParsedItem[]): Entry[] {
  return items.map((it, i) => ({
    role: it.role ?? '',
    company: it.company ?? '',
    period: it.period ?? '',
    year: it.year ?? '',
    description: it.description ?? '',
    highlightsText: (it.highlights ?? []).join('\n'),
    tagsText: (it.tags ?? []).join(', '),
    accent: ACCENTS[i % ACCENTS.length],
    published: true,
  }))
}

function toPayload(entries: Entry[]) {
  return entries.map((e) => ({
    role: e.role,
    company: e.company,
    period: e.period,
    year: e.year,
    description: e.description,
    highlights: e.highlightsText.split('\n').map((s) => s.trim()).filter(Boolean),
    tags: e.tagsText.split(',').map((s) => s.trim()).filter(Boolean),
    accent: e.accent,
    published: e.published,
  }))
}

function fileToBase64(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = () => resolve((reader.result as string).split(',')[1] ?? '')
    reader.onerror = reject
    reader.readAsDataURL(file)
  })
}

export default function ResumeAdmin() {
  const [entries, setEntries] = useState<Entry[]>([])
  const [pasteText, setPasteText] = useState('')
  const [busy, setBusy] = useState<'' | 'parsing' | 'publishing'>('')
  const [status, setStatus] = useState('')
  const [resumeInfo, setResumeInfo] = useState<{ hasResume: boolean; filename?: string; updated_at?: string } | null>(null)

  async function loadExperience() {
    const rows = (await fetch('/api/admin/experience').then((r) => r.json())) as Experience[]
    setEntries(fromExperience(rows))
  }

  async function loadResumeInfo() {
    const info = await fetch('/api/admin/resume/upload').then((r) => r.json())
    setResumeInfo(info)
  }

  useEffect(() => {
    loadExperience()
    loadResumeInfo()
  }, [])

  async function onPdfSelected(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    e.target.value = ''
    if (!file) return
    setBusy('parsing')
    setStatus('Uploading and parsing your résumé — this can take a moment…')
    try {
      const b64 = await fileToBase64(file)
      // Store the PDF as the downloadable résumé
      await fetch('/api/admin/resume/upload', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ pdfBase64: b64, filename: file.name }),
      })
      // Parse it into structured experience
      const res = await fetch('/api/admin/resume/parse', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ pdfBase64: b64 }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error ?? 'Parse failed')
      setEntries(fromParsed(data.items ?? []))
      setStatus(`Parsed ${data.items?.length ?? 0} role(s). Review and edit below, then Publish. The PDF is now the downloadable résumé.`)
      loadResumeInfo()
    } catch (err) {
      setStatus(`Error: ${(err as Error).message}`)
    } finally {
      setBusy('')
    }
  }

  async function parseText() {
    if (!pasteText.trim()) return
    setBusy('parsing')
    setStatus('Parsing pasted text…')
    try {
      const res = await fetch('/api/admin/resume/parse', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text: pasteText }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error ?? 'Parse failed')
      setEntries(fromParsed(data.items ?? []))
      setStatus(`Parsed ${data.items?.length ?? 0} role(s). Review and edit below, then Publish.`)
    } catch (err) {
      setStatus(`Error: ${(err as Error).message}`)
    } finally {
      setBusy('')
    }
  }

  async function publish() {
    setBusy('publishing')
    setStatus('Publishing…')
    try {
      const res = await fetch('/api/admin/experience', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ items: toPayload(entries) }),
      })
      if (!res.ok) throw new Error('Publish failed')
      await loadExperience()
      setStatus('Published — your live Experience section is updated.')
    } catch (err) {
      setStatus(`Error: ${(err as Error).message}`)
    } finally {
      setBusy('')
    }
  }

  function update(i: number, patch: Partial<Entry>) {
    setEntries((prev) => prev.map((e, idx) => (idx === i ? { ...e, ...patch } : e)))
  }
  function move(i: number, dir: -1 | 1) {
    setEntries((prev) => {
      const next = [...prev]
      const j = i + dir
      if (j < 0 || j >= next.length) return prev
      ;[next[i], next[j]] = [next[j], next[i]]
      return next
    })
  }
  function removeEntry(i: number) {
    setEntries((prev) => prev.filter((_, idx) => idx !== i))
  }

  return (
    <>
      <AdminNav />
      <div className="flex items-center justify-between mb-2">
        <h1 className="text-2xl font-semibold">Résumé</h1>
        <button
          onClick={publish}
          disabled={busy !== '' || entries.length === 0}
          className="px-4 py-2 rounded bg-emerald-600 hover:bg-emerald-500 text-sm disabled:opacity-50 transition-colors"
        >
          {busy === 'publishing' ? 'Publishing…' : 'Publish'}
        </button>
      </div>
      <p className="text-sm text-white/40 mb-6">
        Upload a résumé PDF (from Google Docs: File → Download → PDF) — it becomes your downloadable résumé and is parsed into the Experience timeline for you to review. Or paste text, or just edit the entries below by hand.
      </p>

      {/* Import controls */}
      <div className="grid gap-4 md:grid-cols-2 mb-6">
        <div className="rounded-lg bg-white/5 p-4 flex flex-col gap-3">
          <h2 className="font-medium text-sm">Upload PDF</h2>
          <label className="px-4 py-2 rounded bg-white/10 hover:bg-white/20 text-sm transition-colors cursor-pointer text-center">
            {busy === 'parsing' ? 'Working…' : 'Choose PDF'}
            <input type="file" accept="application/pdf" onChange={onPdfSelected} disabled={busy !== ''} className="hidden" />
          </label>
          <p className="text-xs text-white/40">
            {resumeInfo?.hasResume
              ? `Current download: ${resumeInfo.filename ?? 'résumé.pdf'} (updated ${resumeInfo.updated_at ? new Date(resumeInfo.updated_at).toLocaleString() : ''})`
              : 'No PDF uploaded yet — the download serves the bundled file.'}
          </p>
        </div>
        <div className="rounded-lg bg-white/5 p-4 flex flex-col gap-3">
          <h2 className="font-medium text-sm">Paste text</h2>
          <textarea
            placeholder="Paste your résumé text here…"
            value={pasteText}
            onChange={(e) => setPasteText(e.target.value)}
            className="input"
            rows={3}
          />
          <button
            onClick={parseText}
            disabled={busy !== '' || !pasteText.trim()}
            className="px-4 py-2 rounded bg-white/10 hover:bg-white/20 text-sm disabled:opacity-50 transition-colors"
          >
            Parse text
          </button>
        </div>
      </div>

      {status && <p className="text-sm text-teal-300/80 mb-6">{status}</p>}

      {/* Editable review list */}
      <div className="flex items-center justify-between mb-3">
        <h2 className="font-medium">Experience entries ({entries.length})</h2>
        <button
          onClick={() => setEntries((prev) => [...prev, blankEntry(prev.length)])}
          className="px-3 py-1.5 rounded bg-white/10 hover:bg-white/20 text-sm transition-colors"
        >
          + Add entry
        </button>
      </div>

      <div className="flex flex-col gap-4">
        {entries.map((e, i) => (
          <div key={i} className="rounded-lg bg-white/5 p-4 flex flex-col gap-3">
            <div className="flex items-center gap-3">
              <div className="w-3 h-3 rounded-full shrink-0" style={{ background: e.accent }} />
              <input placeholder="Role / title" value={e.role} onChange={(ev) => update(i, { role: ev.target.value })} className="input flex-1" />
              <div className="flex items-center gap-1 shrink-0">
                <button onClick={() => move(i, -1)} disabled={i === 0} className="text-white/40 hover:text-white text-sm disabled:opacity-30 px-1">↑</button>
                <button onClick={() => move(i, 1)} disabled={i === entries.length - 1} className="text-white/40 hover:text-white text-sm disabled:opacity-30 px-1">↓</button>
                <button onClick={() => removeEntry(i)} className="text-red-400/60 hover:text-red-400 text-sm px-1">Delete</button>
              </div>
            </div>
            <div className="grid gap-3 md:grid-cols-3">
              <input placeholder="Company" value={e.company} onChange={(ev) => update(i, { company: ev.target.value })} className="input" />
              <input placeholder="Period (e.g. 2017 — 2021)" value={e.period} onChange={(ev) => update(i, { period: ev.target.value })} className="input" />
              <input placeholder="Year label (e.g. 2021 / Present)" value={e.year} onChange={(ev) => update(i, { year: ev.target.value })} className="input" />
            </div>
            <textarea placeholder="Short company/context blurb (optional)" value={e.description} onChange={(ev) => update(i, { description: ev.target.value })} className="input" rows={2} />
            <label className="text-xs text-white/40">Highlights — one bullet per line</label>
            <textarea placeholder="One accomplishment per line" value={e.highlightsText} onChange={(ev) => update(i, { highlightsText: ev.target.value })} className="input" rows={5} />
            <div className="grid gap-3 md:grid-cols-[1fr_auto_auto] items-center">
              <input placeholder="Tags, comma-separated" value={e.tagsText} onChange={(ev) => update(i, { tagsText: ev.target.value })} className="input" />
              <div className="flex items-center gap-2">
                <label className="text-xs text-white/40">Accent</label>
                <input type="color" value={e.accent} onChange={(ev) => update(i, { accent: ev.target.value })} className="h-8 w-14 rounded cursor-pointer bg-transparent" />
              </div>
              <label className="flex items-center gap-2 text-xs text-white/40">
                Published
                <Toggle checked={e.published} onChange={(val) => update(i, { published: val })} />
              </label>
            </div>
          </div>
        ))}
        {entries.length === 0 && <p className="text-white/30 text-sm">No experience yet. Upload a PDF, paste text, or add an entry.</p>}
      </div>
    </>
  )
}
