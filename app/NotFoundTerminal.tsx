'use client'

import Link from 'next/link'
import { useParams } from 'next/navigation'
import { DICTIONARY } from '@/lib/i18n/dictionaries'
import { DEFAULT_LOCALE, isLocale, localePath, type Locale } from '@/lib/i18n/config'

// Brukes både av rot-not-found (som får locale fra cookie) og [locale]/not-found
// (som leser locale fra URL-en via useParams).
export function NotFoundTerminal({ locale: given }: { locale?: Locale }) {
  const params = useParams<{ locale?: string }>()
  const locale = given ?? (isLocale(params?.locale) ? params.locale : DEFAULT_LOCALE)
  const d = DICTIONARY[locale]

  return (
    <section className="error-page px-5 md:px-8">
      <div className="container" style={{ maxWidth: '40rem' }}>
        <div className="term">
          <div className="now-terminal-bar">
            <span className="now-terminal-dot" aria-hidden style={{ background: 'var(--accent)' }} />
            <span className="now-terminal-title">marcus@redi — {d['notFound.terminalTitle']}</span>
          </div>
          <div style={{ padding: '0 1.25rem 1.25rem' }}>
            <div>
              <span className="prompt">marcus@redi</span> <span className="str">~</span> $ curl
              -I $REQUESTED_URL
            </div>
            <h1 className="error-code display">404</h1>
            <p style={{ color: 'var(--term-ink)', margin: '0 0 .5rem' }}>{d['notFound.body']}</p>
            <div style={{ marginTop: '1rem' }}>
              <span className="prompt">marcus@redi</span> <span className="str">~</span> ${' '}
              <Link href={localePath(locale, 'home')} className="error-link">
                {d['notFound.home']}
              </Link>
              <span className="term-caret" aria-hidden style={{ marginLeft: '.4em' }} />
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
