import { GeistSans } from 'geist/font/sans'
import { JetBrains_Mono, Martian_Mono } from 'next/font/google'
import { Analytics } from '@vercel/analytics/next'
import { AdminShortcut } from '@/components/AdminShortcut'
import { jsonLd } from '@/lib/site'

const jetbrainsMono = JetBrains_Mono({
  subsets: ['latin'],
  weight: ['400', '500'],
  variable: '--font-jetbrains-mono',
  display: 'swap',
})

const martianMono = Martian_Mono({
  subsets: ['latin'],
  variable: '--font-martian-mono',
  display: 'swap',
})

type Props = {
  lang: string
  skipLabel?: string
  schema?: unknown
  children: React.ReactNode
}

// <html> og <body> bor her, ikke i rot-layouten, så lang kan følge språket i URL-en.
export function RootDocument({ lang, skipLabel, schema, children }: Props) {
  return (
    <html
      lang={lang}
      className={`${GeistSans.variable} ${jetbrainsMono.variable} ${martianMono.variable}`}
      suppressHydrationWarning
    >
      <body suppressHydrationWarning>
        {skipLabel && (
          <a
            href="#main"
            className="sr-only focus:not-sr-only focus:fixed focus:top-4 focus:left-4 focus:z-50 focus:bg-ink focus:text-bg-elev focus:px-3 focus:py-2 focus:rounded-md"
          >
            {skipLabel}
          </a>
        )}
        {children}
        <AdminShortcut />
        <Analytics />
        {schema !== undefined && (
          <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: jsonLd(schema) }} />
        )}
      </body>
    </html>
  )
}
