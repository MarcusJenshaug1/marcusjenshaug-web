import type { Metadata } from 'next'
import Link from 'next/link'
import { getNowEntries } from '@/lib/now'
import { SafeMdx } from '@/components/SafeMdx'

export const metadata: Metadata = {
  title: 'Nå',
  description: 'Hva Marcus Jenshaug jobber med akkurat nå.',
  alternates: { canonical: '/na' },
}

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString('nb-NO', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  })
}

export default async function NaPage() {
  const entries = await getNowEntries()

  return (
    <section className="px-5 py-10 md:px-8 md:py-12">
      <div className="container" style={{ maxWidth: '44rem' }}>
        <div className="eyebrow" style={{ marginBottom: '.75rem' }}>
          /NA · NOW-PAGE ·{' '}
          <a href="https://nownownow.com" className="link" style={{ color: 'inherit' }}>nownownow.com</a>
        </div>
        <h1 style={{ fontFamily: 'var(--ff-serif)', fontWeight: 500 }}>
          Hva jeg jobber med akkurat nå.
        </h1>
        <p className="muted" style={{ marginTop: '.75rem', maxWidth: '34rem' }}>
          Dette er ikke en blogg. Det er en logg — korte oppdateringer om hva som opptar meg akkurat nå. Inspirert av Derek Sivers sin <code style={{ background: 'var(--bg-sunken)', padding: '1px 5px', borderRadius: 4, fontSize: '.875em' }}>/now</code>-konvensjon.
        </p>

        {entries.length === 0 ? (
          <div className="card" style={{ marginTop: '2rem' }}>
            <p className="muted">Første oppdatering kommer snart.</p>
          </div>
        ) : (
          <div style={{ marginTop: '2.5rem', display: 'flex', flexDirection: 'column', gap: '2rem' }}>
            {entries.map((e, i) => (
              <article
                key={e.id}
                style={{
                  paddingLeft: '1.25rem',
                  borderLeft: i === 0 ? '2px solid var(--accent)' : '1px solid var(--rule)',
                }}
              >
                <div style={{ display: 'flex', alignItems: 'baseline', gap: '.75rem', marginBottom: '.75rem' }}>
                  <time
                    className="mono"
                    dateTime={e.published_at}
                    style={{ fontSize: '.8125rem', color: i === 0 ? 'var(--accent-ink)' : 'var(--ink-3)' }}
                  >
                    {formatDate(e.published_at)}
                  </time>
                  {i === 0 && <span className="chip chip-accent"><span className="chip-dot" />Siste</span>}
                </div>
                <div className="prose" style={{ fontSize: '.9375rem', lineHeight: 1.6, maxWidth: 'none' }}>
                  <SafeMdx source={e.content} />
                </div>
              </article>
            ))}
          </div>
        )}
      </div>
    </section>
  )
}
