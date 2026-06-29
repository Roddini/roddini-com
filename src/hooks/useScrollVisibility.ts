'use client'

import { useState, useEffect, useRef } from 'react'

export function useScrollVisibility(initialDelay = 1800, hideDelay = 1200) {
  const [visible, setVisible] = useState(false)
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  useEffect(() => {
    const onScroll = () => {
      setVisible(false)
      if (timerRef.current) clearTimeout(timerRef.current)
      timerRef.current = setTimeout(() => setVisible(true), hideDelay)
    }

    const initialTimer = setTimeout(() => setVisible(true), initialDelay)

    window.addEventListener('scroll', onScroll, { passive: true })
    return () => {
      window.removeEventListener('scroll', onScroll)
      if (timerRef.current) clearTimeout(timerRef.current)
      clearTimeout(initialTimer)
    }
  }, [initialDelay, hideDelay])

  return visible
}
