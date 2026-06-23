'use client'

import { useEffect, useRef } from 'react'

interface Particle {
  x: number
  baseY: number
  driftX: number
  driftY: number
  size: number
  color: string
  baseAlpha: number
  vx: number
  vy: number
  layer: number
  parallaxFactor: number
  twinkleOffset: number
}

function buildParticles(w: number, h: number): Particle[] {
  const particles: Particle[] = []

  // Layer 0 — distant white stars
  for (let i = 0; i < 220; i++) {
    particles.push({
      x: Math.random() * w,
      baseY: Math.random() * h,
      driftX: 0,
      driftY: 0,
      size: Math.random() * 0.9 + 0.2,
      color: '#ffffff',
      baseAlpha: Math.random() * 0.45 + 0.1,
      vx: (Math.random() - 0.5) * 0.05,
      vy: (Math.random() - 0.5) * 0.05,
      layer: 0,
      parallaxFactor: 0.06,
      twinkleOffset: Math.random() * Math.PI * 2,
    })
  }

  // Layer 1 — mid-field teal/cyan network dots
  const midColors = ['#00d4aa', '#22d3ee', '#0ea5e9', '#38bdf8', '#00b8a9']
  for (let i = 0; i < 60; i++) {
    particles.push({
      x: Math.random() * w,
      baseY: Math.random() * h,
      driftX: 0,
      driftY: 0,
      size: Math.random() * 1.4 + 0.6,
      color: midColors[Math.floor(Math.random() * midColors.length)],
      baseAlpha: Math.random() * 0.4 + 0.15,
      vx: (Math.random() - 0.5) * 0.1,
      vy: (Math.random() - 0.5) * 0.1,
      layer: 1,
      parallaxFactor: 0.18,
      twinkleOffset: Math.random() * Math.PI * 2,
    })
  }

  // Layer 2 — foreground glowing dots
  const nearColors = ['#00d4aa', '#22d3ee', '#00e5cc']
  for (let i = 0; i < 20; i++) {
    particles.push({
      x: Math.random() * w,
      baseY: Math.random() * h,
      driftX: 0,
      driftY: 0,
      size: Math.random() * 1.8 + 1.2,
      color: nearColors[Math.floor(Math.random() * nearColors.length)],
      baseAlpha: Math.random() * 0.5 + 0.25,
      vx: (Math.random() - 0.5) * 0.14,
      vy: (Math.random() - 0.5) * 0.14,
      layer: 2,
      parallaxFactor: 0.35,
      twinkleOffset: Math.random() * Math.PI * 2,
    })
  }

  return particles
}

export default function StarField() {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const scrollYRef = useRef(0)
  const frameRef = useRef<number>(0)
  const particlesRef = useRef<Particle[]>([])

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    if (!ctx) return

    const setup = () => {
      canvas.width = window.innerWidth
      canvas.height = window.innerHeight
      particlesRef.current = buildParticles(canvas.width, canvas.height)
    }
    setup()

    const onScroll = () => { scrollYRef.current = window.scrollY }
    const onResize = () => setup()

    window.addEventListener('scroll', onScroll, { passive: true })
    window.addEventListener('resize', onResize)

    let time = 0

    const draw = () => {
      frameRef.current = requestAnimationFrame(draw)
      const w = canvas.width
      const h = canvas.height
      ctx.clearRect(0, 0, w, h)
      time += 0.007

      const ps = particlesRef.current
      const scroll = scrollYRef.current

      // Advance ambient drift
      for (const p of ps) {
        p.driftX += p.vx
        p.driftY += p.vy
        if (p.driftX > w) p.driftX -= w
        if (p.driftX < -w) p.driftX += w
      }

      // Pre-compute display positions
      const dx: number[] = new Array(ps.length)
      const dy: number[] = new Array(ps.length)
      for (let i = 0; i < ps.length; i++) {
        const p = ps[i]
        dx[i] = ((p.x + p.driftX) % w + w) % w
        const rawY = p.baseY + p.driftY - scroll * p.parallaxFactor
        dy[i] = ((rawY % h) + h) % h
      }

      // Connection lines between layer-1 particles
      ctx.lineWidth = 0.5
      for (let i = 0; i < ps.length; i++) {
        if (ps[i].layer !== 1) continue
        for (let j = i + 1; j < ps.length; j++) {
          if (ps[j].layer !== 1) continue
          const ddx = dx[i] - dx[j]
          const ddy = dy[i] - dy[j]
          const dist = Math.sqrt(ddx * ddx + ddy * ddy)
          // Skip pairs that appear far apart due to wrap-around
          if (dist < 115 && Math.abs(ddy) < h * 0.35) {
            const a = (1 - dist / 115) * 0.1
            ctx.beginPath()
            ctx.strokeStyle = `rgba(0,212,170,${a})`
            ctx.moveTo(dx[i], dy[i])
            ctx.lineTo(dx[j], dy[j])
            ctx.stroke()
          }
        }
      }

      // Draw particles
      for (let i = 0; i < ps.length; i++) {
        const p = ps[i]

        const twinkle =
          p.layer === 0
            ? Math.sin(time * 1.6 + p.twinkleOffset) * 0.18 + 0.82
            : 1

        ctx.globalAlpha = p.baseAlpha * twinkle

        if (p.layer >= 2) {
          ctx.shadowBlur = 12
          ctx.shadowColor = p.color
        } else if (p.layer === 1) {
          ctx.shadowBlur = 5
          ctx.shadowColor = p.color
        } else {
          ctx.shadowBlur = 0
        }

        ctx.fillStyle = p.color
        ctx.beginPath()
        ctx.arc(dx[i], dy[i], p.size, 0, Math.PI * 2)
        ctx.fill()
      }

      ctx.globalAlpha = 1
      ctx.shadowBlur = 0
    }

    draw()

    return () => {
      cancelAnimationFrame(frameRef.current)
      window.removeEventListener('scroll', onScroll)
      window.removeEventListener('resize', onResize)
    }
  }, [])

  return (
    <canvas
      ref={canvasRef}
      style={{ position: 'fixed', inset: 0, width: '100%', height: '100%', zIndex: 0, pointerEvents: 'none' }}
    />
  )
}
