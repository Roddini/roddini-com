'use client'

import { useEffect, useRef } from 'react'

interface Star {
  x: number
  y: number
  r: number
  baseAlpha: number
  phase: number
  speed: number
}

export default function ConstellationName() {
  const canvasRef = useRef<HTMLCanvasElement>(null)

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')!
    if (!ctx) return

    const W = canvas.width
    const H = canvas.height

    // Render text offscreen to sample letterform pixels
    const offscreen = document.createElement('canvas')
    offscreen.width = W
    offscreen.height = H
    const off = offscreen.getContext('2d')!
    off.fillStyle = 'white'
    off.font = '400 52px "Geist", system-ui, sans-serif'
    off.textAlign = 'center'
    off.textBaseline = 'middle'
    off.fillText('Andrew Roddini', W / 2, H / 2)

    const imageData = off.getImageData(0, 0, W, H)
    const stars: Star[] = []
    const step = 5

    let seed = 42
    const rand = () => {
      seed = (seed * 1664525 + 1013904223) & 0xffffffff
      return (seed >>> 0) / 0xffffffff
    }

    for (let y = 0; y < H; y += step) {
      for (let x = 0; x < W; x += step) {
        const idx = (y * W + x) * 4
        if (imageData.data[idx + 3] > 100) {
          const isBright = rand() < 0.18
          stars.push({
            x: x + (rand() - 0.5) * step * 0.5,
            y: y + (rand() - 0.5) * step * 0.5,
            r: isBright ? 1.6 : 0.85,
            baseAlpha: isBright ? 0.9 : 0.6,
            phase: rand() * Math.PI * 2,
            speed: 0.6 + rand() * 1.4,
          })
        }
      }
    }

    let rafId: number
    const t0 = performance.now()

    function draw(now: number) {
      const t = now - t0

      // Global pulse: dim → bright → dim, ~5s period
      // Ranges from 0.15 (nearly invisible) to 1.0 (full)
      const globalPulse = 0.15 + 0.85 * (0.5 + 0.5 * Math.sin(t * 0.00126))

      ctx.clearRect(0, 0, W, H)

      // Stars
      for (let i = 0; i < stars.length; i++) {
        const s = stars[i]
        // Each star twinkles at its own rate and phase
        const twinkle = 0.65 + 0.35 * Math.sin(t * 0.005 * s.speed + s.phase)
        const alpha = s.baseAlpha * globalPulse * twinkle
        ctx.beginPath()
        ctx.arc(s.x, s.y, s.r, 0, Math.PI * 2)
        ctx.fillStyle = `rgba(0,212,170,${alpha})`
        ctx.fill()
      }

      rafId = requestAnimationFrame(draw)
    }

    rafId = requestAnimationFrame(draw)
    return () => cancelAnimationFrame(rafId)
  }, [])

  return (
    <div className="flex justify-center py-8 px-4">
      <canvas ref={canvasRef} width={720} height={90} style={{ maxWidth: '100%' }} />
    </div>
  )
}
