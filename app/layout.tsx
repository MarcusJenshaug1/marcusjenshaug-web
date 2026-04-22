import type { Metadata } from 'next'
import { GeistSans } from 'geist/font/sans'
import { Fraunces, JetBrains_Mono } from 'next/font/google'
import './globals.css'

const fraunces = Fraunces({
  subsets: ['latin'],
  axes: ['opsz'],
  variable: '--font-fraunces',
  display: 'swap',
})

const jetbrainsMono = JetBrains_Mono({
  subsets: ['latin'],
  weight: ['400', '500'],
  variable: '--font-jetbrains-mono',
  display: 'swap',
})

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? 'https://marcusjenshaug.no'

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: {
    default: 'Marcus Jenshaug',
    template: '%s · Marcus Jenshaug',
  },
  description: 'Fullstack-utvikler i Redi AS. Bygger verktøy for eiendomsmarkedet.',
  alternates: { canonical: '/' },
  openGraph: {
    type: 'website',
    locale: 'nb_NO',
    url: siteUrl,
    siteName: 'Marcus Jenshaug',
  },
  robots: { index: true, follow: true },
}

const websiteSchema = {
  '@context': 'https://schema.org',
  '@type': 'WebSite',
  url: siteUrl,
  name: 'Marcus Jenshaug',
  inLanguage: 'nb-NO',
  author: { '@id': `${siteUrl}/#person` },
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html
      lang="nb"
      className={`${GeistSans.variable} ${fraunces.variable} ${jetbrainsMono.variable}`}
    >
      <body>
        <a
          href="#main"
          className="sr-only focus:not-sr-only focus:fixed focus:top-4 focus:left-4 focus:z-50 focus:bg-ink focus:text-bg-elev focus:px-3 focus:py-2 focus:rounded-md"
        >
          Hopp til hovedinnhold
        </a>
        {children}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(websiteSchema) }}
        />
      </body>
    </html>
  )
}
