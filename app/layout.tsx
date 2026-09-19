import type { Metadata } from 'next'
import './globals.css'
import { siteUrl } from '@/lib/site'

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: {
    default: 'Marcus Jenshaug',
    template: '%s · Marcus Jenshaug',
  },
  twitter: {
    card: 'summary_large_image',
    images: [`/api/og?title=${encodeURIComponent('Marcus Jenshaug')}`],
  },
  robots: { index: true, follow: true },
}

// <html>/<body> rendres av app/[locale]/layout.tsx og app/admin/layout.tsx,
// slik at lang kan følge språket.
export default function RootLayout({ children }: { children: React.ReactNode }) {
  return children
}
