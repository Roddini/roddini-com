import Link from 'next/link'

const links = [
  { href: '/admin', label: 'Dashboard' },
  { href: '/admin/podcasts', label: 'Podcasts' },
  { href: '/admin/recommendations', label: 'Recommendations' },
  { href: '/admin/hobbies', label: 'Hobbies' },
  { href: '/admin/career-highlights', label: 'Career Highlights' },
]

export default function AdminNav() {
  return (
    <nav className="flex gap-4 flex-wrap mb-8 border-b border-white/10 pb-4">
      {links.map(({ href, label }) => (
        <Link key={href} href={href} className="text-white/60 hover:text-white transition-colors text-sm">
          {label}
        </Link>
      ))}
    </nav>
  )
}
