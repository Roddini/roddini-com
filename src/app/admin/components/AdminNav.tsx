'use client'

import Link from 'next/link'
import { useRouter } from 'next/navigation'

const links = [
  { href: '/admin', label: 'Dashboard' },
  { href: '/admin/resume', label: 'Resume' },
  { href: '/admin/projects', label: 'Projects' },
  { href: '/admin/fun-projects', label: 'Fun Projects' },
  { href: '/admin/career-highlights', label: 'Career Highlights' },
  { href: '/admin/podcasts', label: 'Entertainment' },
  { href: '/admin/recommendations', label: 'Recommendations' },
  { href: '/admin/hobbies', label: 'Hobbies' },
  { href: '/admin/categories', label: 'Categories' },
  { href: '/admin/chat', label: 'Chat Access' },
  { href: '/admin/conversations', label: 'Conversations' },
  { href: '/admin/life-hacks', label: 'Life Hacks' },
  { href: '/admin/hero', label: 'Hero' },
  { href: '/admin/nav-links', label: 'Nav Links' },
]

export default function AdminNav() {
  const router = useRouter()

  async function logout() {
    await fetch('/api/admin/logout', { method: 'POST' })
    router.push('/admin/login')
  }

  return (
    <nav className="flex items-center gap-4 flex-wrap mb-8 border-b border-white/10 pb-4">
      {links.map(({ href, label }) => (
        <Link key={href} href={href} className="text-white/60 hover:text-white transition-colors text-sm">
          {label}
        </Link>
      ))}
      <button
        onClick={logout}
        className="ml-auto text-white/30 hover:text-white/60 transition-colors text-sm"
      >
        Log out
      </button>
    </nav>
  )
}
