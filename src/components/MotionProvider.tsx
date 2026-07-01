'use client'

import { MotionConfig } from 'framer-motion'

/**
 * App-wide Framer Motion configuration. `reducedMotion="user"` makes every
 * motion component honor the OS "reduce motion" setting — transform-based
 * animations become instant while opacity still fades — without each component
 * having to opt in individually.
 */
export default function MotionProvider({ children }: { children: React.ReactNode }) {
  return <MotionConfig reducedMotion="user">{children}</MotionConfig>
}
