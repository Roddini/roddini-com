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
  title: 'Andrew Roddini — Head of Talent',
  description:
    'People & Talent leader who builds recruiting and HR functions from zero and scales them through hypergrowth. Former Head of Talent at Varo.',
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
