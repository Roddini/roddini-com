import type { Metadata } from 'next'
import { Geist } from 'next/font/google'
import './globals.css'
import NavMenu from '@/components/NavMenu'
import Initials from '@/components/Initials'
import MotionProvider from '@/components/MotionProvider'
import { sql } from '@/lib/db'
import type { NavLink } from '@/lib/types'

const geist = Geist({
  variable: '--font-geist-sans',
  subsets: ['latin'],
  weight: ['100', '200', '300', '400'],
})

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? 'https://roddini.com'

const description =
  'People & Talent leader who builds recruiting and HR functions from zero and scales them through hypergrowth. Former Head of Talent at Varo.'

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: {
    default: 'Andrew Roddini — Head of Talent',
    template: '%s — Andrew Roddini',
  },
  description,
  icons: {
    icon: [{ url: '/icon.png', type: 'image/png' }],
    apple: '/icon.png',
  },
  // og:image / twitter:image are supplied automatically by the file-convention
  // asset at src/app/opengraph-image.jpg — do not also set them here.
  openGraph: {
    type: 'website',
    url: siteUrl,
    siteName: 'Andrew Roddini',
    title: 'Andrew Roddini — Head of Talent',
    description,
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Andrew Roddini — Head of Talent',
    description,
  },
}

export default async function RootLayout({ children }: { children: React.ReactNode }) {
  const navLinks = await sql`SELECT href, label FROM nav_links ORDER BY sort_order ASC`
    .catch(() => []) as unknown as Pick<NavLink, 'href' | 'label'>[]

  return (
    <html lang="en" className={`${geist.variable} h-full`}>
      <body className="min-h-full antialiased">
        <MotionProvider>
          <NavMenu links={navLinks} />
          <Initials />
          {children}
        </MotionProvider>
      </body>
    </html>
  )
}
