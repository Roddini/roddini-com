'use client'

import { useEffect, useState, useRef } from 'react'
import AdminNav from '../components/AdminNav'

type HeroConfig = {
  hero_name: string
  hero_title: string
  hero_tagline_1: string
  hero_tagline_2: string
}

const DEFAULT_CONFIG: HeroConfig = {
  hero_name: '',
  hero_title: '',
  hero_tagline_1: '',
  hero_tagline_2: '',
}

const FIELD_LABELS: Record<keyof HeroConfig, string> = {
  hero_name: 'Name',
  hero_title: 'Title / Subtitle',
  hero_tagline_1: 'Tagline 1',
  hero_tagline_2: 'Tagline 2',
}

export default function HeroAdminPage() {
  const [config, setConfig] = useState<HeroConfig>(DEFAULT_CONFIG)
  const [saved, setSaved] = useState<Partial<Record<keyof HeroConfig, boolean>>>({})
  const savingRef = useRef<Partial<Record<keyof HeroConfig, ReturnType<typeof setTimeout>>>>({})

  useEffect(() => {
    fetch('/api/admin/site-config')
      .then((r) => r.json())
      .then((data) => setConfig((prev) => ({ ...prev, ...data })))
  }, [])

  function updateField(key: keyof HeroConfig, value: string) {
    setConfig((prev) => ({ ...prev, [key]: value }))
    if (savingRef.current[key]) clearTimeout(savingRef.current[key]!)
    savingRef.current[key] = setTimeout(async () => {
      await fetch('/api/admin/site-config', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ key, value }),
      })
      setSaved((prev) => ({ ...prev, [key]: true }))
      setTimeout(() => setSaved((prev) => ({ ...prev, [key]: false })), 1500)
    }, 600)
  }

  return (
    <>
      <AdminNav />
      <h1 className="text-2xl font-semibold mb-2">Hero</h1>
      <p className="text-sm text-white/40 mb-6">Edits auto-save 600ms after you stop typing.</p>

      <div className="flex flex-col gap-4 max-w-lg">
        {(Object.keys(FIELD_LABELS) as (keyof HeroConfig)[]).map((key) => (
          <div key={key} className="rounded-lg bg-white/5 px-4 py-3">
            <div className="flex items-center justify-between mb-1">
              <label className="text-[10px] tracking-widest uppercase text-white/40">
                {FIELD_LABELS[key]}
              </label>
              {saved[key] && (
                <span className="text-[10px] tracking-widest uppercase" style={{ color: '#00d4aa' }}>
                  Saved
                </span>
              )}
            </div>
            <input
              className="input w-full"
              value={config[key]}
              onChange={(e) => updateField(key, e.target.value)}
              placeholder={FIELD_LABELS[key]}
            />
          </div>
        ))}
      </div>
    </>
  )
}
