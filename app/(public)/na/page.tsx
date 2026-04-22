import type { Metadata } from 'next'
import Link from 'next/link'

export const metadata: Metadata = {
  title: 'Nå',
  description: 'Hva Marcus Jenshaug jobber med akkurat nå.',
  alternates: { canonical: '/na' },
}

export default function NaPage() {
  return (
    <section style={{ padding: '3rem 2rem' }}>
      <div className="container" style={{ maxWidth: '44rem' }}>
        <div className="eyebrow" style={{ marginBottom: '.75rem' }}>
          /NA · NOW-PAGE · <Link href="https://nownownow.com" className="link" style={{ color: 'inherit' }}>nownownow.com</Link>
        </div>
        <h1 style={{ fontFamily: 'var(--ff-serif)', fontWeight: 500 }}>
          Hva jeg jobber med akkurat nå.
        </h1>
        <p className="muted" style={{ marginTop: '.75rem', maxWidth: '34rem' }}>
          Dette er ikke en blogg. Det er en logg — korte oppdateringer om hva som opptar meg akkurat nå. Inspirert av Derek Sivers sin <code style={{ background: 'var(--bg-sunken)', padding: '1px 5px', borderRadius: 4, fontSize: '.875em' }}>/now</code>-konvensjon.
        </p>
        <div className="card" style={{ marginTop: '2rem' }}>
          <p className="muted">Første oppdatering kommer snart.</p>
        </div>
      </div>
    </section>
  )
}
