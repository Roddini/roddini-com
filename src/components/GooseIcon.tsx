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

export default function GooseIcon({ size = 56 }: { size?: number }) {
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

      // Crop to just the face area: upper-right quadrant of the 2714×2380 original
      off.drawImage(img, 1550, 50, 1050, 950, 0, 0, W, H)

      const imageData = off.getImageData(0, 0, W, H)
      const stars: Star[] = []
      const step = 3

      let seed = 99
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

          if (a < 80) continue
          if (r > 238 && g > 238 && b > 238) continue

          if (rand() < 0.5) {
            const isBright = rand() < 0.2
            stars.push({
              x: x + (rand() - 0.5) * step * 0.5,
              y: y + (rand() - 0.5) * step * 0.5,
              r: isBright ? 1.2 : 0.6,
              baseAlpha: isBright ? 0.95 : 0.6,
              phase: rand() * Math.PI * 2,
              speed: 0.5 + rand() * 1.5,
            })
          }
        }
      }

      const t0 = performance.now()

      function draw(now: number) {
        if (cancelled) return
        const t = now - t0
        const globalPulse = 0.25 + 0.75 * (0.5 + 0.5 * Math.sin(t * 0.00126))

        ctx.clearRect(0, 0, W, H)

        for (const s of stars) {
          const twinkle = 0.6 + 0.4 * Math.sin(t * 0.005 * s.speed + s.phase)
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
    <canvas
      ref={canvasRef}
      width={size}
      height={size}
      style={{ display: 'block', imageRendering: 'pixelated' }}
    />
  )
}
