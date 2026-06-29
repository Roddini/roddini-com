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

    const dpr = window.devicePixelRatio || 1
    const W = Math.round(size * dpr)
    const H = Math.round(size * dpr)
    canvas.width = W
    canvas.height = H
    canvas.style.width = `${size}px`
    canvas.style.height = `${size}px`

    let rafId: number
    let cancelled = false

    const img = new Image()
    img.src = '/goose-laying.png'
    img.onload = () => {
      const off = document.createElement('canvas')
      off.width = W
      off.height = H
      const offCtx = off.getContext('2d')!
      offCtx.drawImage(img, 0, 0, W, H)

      const imageData = offCtx.getImageData(0, 0, W, H)
      const stars: Star[] = []
      const step = Math.max(2, Math.round(3 * dpr))

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

          if (a < 80) continue
          if (r > 238 && g > 238 && b > 238) continue

          if (rand() < 0.55) {
            const isBright = rand() < 0.18
            stars.push({
              x: x + (rand() - 0.5) * step * 0.6,
              y: y + (rand() - 0.5) * step * 0.6,
              r: (isBright ? 1.8 : 0.95) * dpr,
              baseAlpha: isBright ? 0.9 : 0.55,
              phase: rand() * Math.PI * 2,
              speed: 0.5 + rand() * 1.5,
            })
          }
        }
      }

      // Constellation lines between nearby stars
      const lines: [number, number][] = []
      const maxDistSq = (W * 0.2) ** 2
      for (let i = 0; i < stars.length && lines.length < 300; i++) {
        for (let j = i + 1; j < stars.length; j++) {
          const dx = stars[i].x - stars[j].x
          const dy = stars[i].y - stars[j].y
          if (dx * dx + dy * dy < maxDistSq) {
            lines.push([i, j])
            if (lines.length >= 300) break
          }
        }
      }

      const t0 = performance.now()

      function draw(now: number) {
        if (cancelled) return
        const t = now - t0
        const globalPulse = 0.2 + 0.8 * (0.5 + 0.5 * Math.sin(t * 0.00126))

        ctx.clearRect(0, 0, W, H)

        ctx.strokeStyle = 'rgba(0,212,170,0.09)'
        ctx.lineWidth = 0.6 * dpr
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
  }, [size])

  return <canvas ref={canvasRef} style={{ display: 'block' }} />
}
