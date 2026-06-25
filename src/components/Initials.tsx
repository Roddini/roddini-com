'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'

export default function Initials() {
  const pathname = usePathname()
  const isHome = pathname === '/'

  if (pathname.startsWith('/studio')) return null

  return (
    <div className="fixed top-5 left-6 z-40 group">
      <Link
        href="/"
        className="block px-1 py-1 text-[1.6rem] font-normal leading-none select-none opacity-0 group-hover:opacity-100 transition-opacity duration-300"
        style={{ color: 'rgba(255,255,255,0.88)', letterSpacing: '-0.03em' }}
        onClick={(e) => {
          if (isHome) {
            e.preventDefault()
            window.scrollTo({ top: 0, behavior: 'smooth' })
          }
        }}
      >
        ar
      </Link>
    </div>
  )
}
