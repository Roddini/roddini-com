'use client'

import { useRef } from 'react'
import { motion, useScroll, useTransform } from 'framer-motion'

export default function SectionReveal({ children }: { children: React.ReactNode }) {
  const ref = useRef<HTMLDivElement>(null)

  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ['start end', 'start 0.35'],
  })

  const opacity = useTransform(scrollYProgress, [0, 0.55, 1], [0, 0.65, 1])
  const scale = useTransform(scrollYProgress, [0, 1], [0.96, 1])
  const y = useTransform(scrollYProgress, [0, 1], [56, 0])

  return (
    <motion.div ref={ref} style={{ opacity, scale, y }}>
      {children}
    </motion.div>
  )
}
