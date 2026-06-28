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

export default function ConstellationDog() {
  const canvasRef = useRef<HTMLCanvasElement>(null)

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')!
    if (!ctx) return

    const W = canvas.width
    const H = canvas.height

    let rafId: number
    let cancelled = false

    const img = new Image()
    img.src = '/goose-constellation.png'
    img.onload = () => {
      const offscreen = document.createElement('canvas')
      offscreen.width = W
      offscreen.height = H
      const off = offscreen.getContext('2d')!
      off.drawImage(img, 0, 0, W, H)

      const imageData = off.getImageData(0, 0, W, H)
      const stars: Star[] = []
      const step = 9

      let seed = 42
      const rand = () => {
        seed = (seed * 1664525 + 1013904223) & 0xffffffff
        return (seed >>> 0) / 0xffffffff
      }

      for (let y = 0; y < H; y += step) {
        for (let x = 0; x < W; x += step) {
          const idx = (y * W + x) * 4
          const r = imageData.data[idx]
          const g = imageData.data[idx + 1]
          const b = imageData.data[idx + 2]
          const a = imageData.data[idx + 3]

          // Skip transparent or near-white background pixels
          if (a < 80) continue
          if (r > 238 && g > 238 && b > 238) continue

          if (rand() < 0.55) {
            const isBright = rand() < 0.18
            stars.push({
              x: x + (rand() - 0.5) * step * 0.6,
              y: y + (rand() - 0.5) * step * 0.6,
              r: isBright ? 1.8 : 0.95,
              baseAlpha: isBright ? 0.9 : 0.55,
              phase: rand() * Math.PI * 2,
              speed: 0.5 + rand() * 1.5,
            })
          }
        }
      }

      // Precompute lines between nearby stars once — avoids O(n²) per frame
      const lines: [number, number][] = []
      const maxDistSq = 22 * 22
      for (let i = 0; i < stars.length && lines.length < 900; i++) {
        for (let j = i + 1; j < stars.length; j++) {
          const dx = stars[i].x - stars[j].x
          const dy = stars[i].y - stars[j].y
          if (dx * dx + dy * dy < maxDistSq) {
            lines.push([i, j])
            if (lines.length >= 900) break
          }
        }
      }

      const t0 = performance.now()

      function draw(now: number) {
        if (cancelled) return
        const t = now - t0

        const globalPulse = 0.2 + 0.8 * (0.5 + 0.5 * Math.sin(t * 0.00126))

        ctx.clearRect(0, 0, W, H)

        // Batch all lines into a single stroke call
        ctx.strokeStyle = 'rgba(0,212,170,0.09)'
        ctx.lineWidth = 0.6
        ctx.beginPath()
        for (const [i, j] of lines) {
          ctx.moveTo(stars[i].x, stars[i].y)
          ctx.lineTo(stars[j].x, stars[j].y)
        }
        ctx.stroke()

        for (const s of stars) {
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
    }

    return () => {
      cancelled = true
      if (rafId) cancelAnimationFrame(rafId)
    }
  }, [])

  return (
    <div className="flex justify-center py-8 px-4">
      <canvas ref={canvasRef} width={580} height={510} style={{ maxWidth: '100%' }} />
    </div>
  )
}
