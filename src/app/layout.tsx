import type { Metadata } from 'next'
import { Geist } from 'next/font/google'
import './globals.css'
import NavMenu from '@/components/NavMenu'
import Initials from '@/components/Initials'

const geist = Geist({
  variable: '--font-geist-sans',
  subsets: ['latin'],
  weight: ['100', '200', '300', '400'],
})

export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL ?? 'https://localhost:3000'),
  title: 'Andrew Roddini — Head of Talent',
  description:
    'People & Talent leader who builds recruiting and HR functions from zero and scales them through hypergrowth. Former Head of Talent at Varo.',
  icons: {
    icon: [{ url: '/icon.png', type: 'image/png' }],
    apple: '/icon.png',
  },
  openGraph: {
    title: 'Andrew Roddini — Head of Talent',
    description:
      'People & Talent leader who builds recruiting and HR functions from zero and scales them through hypergrowth. Former Head of Talent at Varo.',
    images: ['/opengraph-image.jpg'],
  },
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${geist.variable} h-full`}>
      <body className="min-h-full antialiased">
        <NavMenu />
        <Initials />
        {children}
      </body>
    </html>
  )
}
