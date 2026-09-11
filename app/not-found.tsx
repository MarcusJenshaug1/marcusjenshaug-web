import type { Metadata } from 'next'
import Link from 'next/link'
import { connection } from 'next/server'
import { PublicShell } from '@/components/PublicShell'

export const metadata: Metadata = {
  title: 'Fant ikke siden',
  robots: { index: false, follow: false },
}

export default async function NotFound() {
  await connection()
  return (
    <PublicShell>
      <section className="error-page px-5 md:px-8">
        <div className="container" style={{ maxWidth: '40rem' }}>
          <div className="term">
            <div className="now-terminal-bar">
              <span className="now-terminal-dot" aria-hidden style={{ background: 'var(--accent)' }} />
              <span className="now-terminal-title">marcus@redi — feilkode 404</span>
            </div>
            <div style={{ padding: '0 1.25rem 1.25rem' }}>
              <div>
                <span className="prompt">marcus@redi</span> <span className="str">~</span> $ curl
                -I $REQUESTED_URL
              </div>
              <h1 className="error-code display">404</h1>
              <p style={{ color: 'var(--term-ink)', margin: '0 0 .5rem' }}>
                Fant ikke siden. Lenken er brutt, eller innholdet er flyttet.
              </p>
              <div style={{ marginTop: '1rem' }}>
                <span className="prompt">marcus@redi</span> <span className="str">~</span> ${' '}
                <Link href="/" className="error-link">
                  cd /
                </Link>
                <span className="term-caret" aria-hidden style={{ marginLeft: '.4em' }} />
              </div>
            </div>
          </div>
        </div>
      </section>
    </PublicShell>
  )
}
